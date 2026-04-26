// controllers/ride.controller.js

const Ride = require("../models/ride");
const { getRoute } = require("../services/route.service");
const { calculatePrice } = require("../services/pricing.service");
const { findNearbyDrivers } = require("../services/driver.service");
const { generateOtp } = require("../services/otp.service");
const { optimizePoolRoute } = require("../services/route_optimization.service");


const { serializeRide } = require("../serializers/ride.serializer");
const axios = require("axios");

async function notifyAdminOtp(type, target, code) {
  try {
    const adminUrl = process.env.ADMIN_SERVICE_URL || "http://localhost:3009";
    await axios.post(`${adminUrl}/otps`, {
      type,
      target,
      code,
      service: "ride_service"
    });
  } catch (err) {
    console.error("Failed to sync ride OTP with admin service:", err.message);
  }
}

async function sendNotification(userId, title, message, type = "ride") {
  try {
    const notifUrl = process.env.NOTIFICATION_SERVICE_URL || "http://localhost:3007";
    await axios.post(`${notifUrl}/send`, {
      userId,
      title,
      message,
      type
    }, {
      headers: { "x-internal-key": process.env.INTERNAL_SERVICE_KEY }
    });
    console.log(`🔔 Notification sent to user ${userId}: ${title}`);
  } catch (err) {
    console.error("Failed to send notification via service:", err.message);
  }
}

async function fetchRiderName(userId) {
  try {
    const { data: riderInfo } = await axios.get(
      `${process.env.RIDER_SERVICE_URL}/by-user/${userId}`
    );
    if (riderInfo && riderInfo.rider) {
      return `${riderInfo.rider.name.first} ${riderInfo.rider.name.last}`;
    }
  } catch (err) {
    console.warn(`Failed to fetch rider name for ${userId}:`, err.message);
  }
  return "Passenger";
}

exports.getRouteGeometry = async (req, res) => {
  try {
    const { start, end } = req.body;
    if (!start || !end) return res.status(400).json({ error: "start and end required" });
    const route = await getRoute([start, end]);
    res.json(route);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createRide = async (req, res) => {
  try {
    const { pickup, drop, passengers = 1 } = req.body;

    if (!pickup || !drop) {
      return res.status(400).json({ error: "pickup/drop required" });
    }

    // 1) Check if rider already has an active ride
    const activeStatuses = [
      "SEARCHING",
      "DRIVER_ASSIGNED",
      "DRIVER_ARRIVING",
      "IN_PROGRESS",
    ];

    const existing = await Ride.findOne({
      riderId: req.user.id,
      status: { $in: activeStatuses },
    });

    if (existing) {
      // Do NOT create new ride
      return res.status(200).json({
        rideId: existing._id,
        status: existing.status,
        restored: true,
      });
    }

    // 2) Create new ride
    const route = await getRoute([pickup, drop]);

    const priceEstimate = calculatePrice({
      distance: route.distance,
      duration: route.duration,
      passengers: parseInt(req.body.passengers) || 1,
    });

    const riderName = await fetchRiderName(req.user.id);

    const ride = await Ride.create({
      riderId: req.user.id,
      riderName,

      pickup: { 
        type: "Point", 
        coordinates: [pickup.lng, pickup.lat],
        label: pickup.label || null
      },
      drop: { 
        type: "Point", 
        coordinates: [drop.lng, drop.lat],
        label: drop.label || null
      },

      distance: route.distance,
      duration: route.duration,
      routeGeometry: route.geometry,

      passengers: Number(passengers) || 1,
      price: priceEstimate,
      priceEstimate: priceEstimate,

      status: "SEARCHING",
      requestedAt: new Date(),
    });

    // 3) Broadcast to drivers
    const io = req.app.get("io");

    if (io) {
      const nearbyDrivers = await findNearbyDrivers(pickup, 3000, passengers);

      const payload = {
        rideId: ride._id,
        pickup: {
          lat: ride.pickup.coordinates[1],
          lng: ride.pickup.coordinates[0],
          label: ride.pickup.label || pickup.label || "Pickup"
        },
        drop: {
          lat: ride.drop.coordinates[1],
          lng: ride.drop.coordinates[0],
          label: ride.drop.label || drop.label || "Dropoff"
        },
        distance: ride.distance,
        duration: ride.duration,
        price: priceEstimate,
        fare: priceEstimate,
        priceEstimate: priceEstimate,
        riderName: ride.riderName,
        passengers: Number(passengers) || 1,
      };

      nearbyDrivers.forEach((driver) => {
        io.to(`user_${driver.userId}`).emit("ride.created", payload);
      });

      // 🆙 Increment offers in driver service
      const driverUserIds = nearbyDrivers.map(d => d.userId);
      if (driverUserIds.length > 0) {
        axios.post(`${process.env.DRIVER_SERVICE_URL}/internal/increment-offers`, { userIds: driverUserIds })
          .catch(err => console.error("Failed to increment driver offers:", err.message));
      }
    }

    const { serializeRide } = require("../serializers/ride.serializer");
    return res.status(201).json(serializeRide(ride));
  } catch (err) {
    console.error("createRide error:", err.message);
    return res.status(500).json({ error: "Server error" });
  }
};

exports.availableRides = async (req, res) => {
  const rides = await Ride.find({ status: "SEARCHING" })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

  res.json(rides);
};

exports.acceptRide = async (req, res) => {
  const otp = generateOtp();

  const ride = await Ride.findOneAndUpdate(
    {
      _id: req.params.id,
      status: "SEARCHING",
    },
    {
      $set: {
        driverId: req.user.id,
        status: "DRIVER_ASSIGNED",
        assignedAt: new Date(),
        rideStartOtp: {
          code: otp,
          expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
          verified: false,
        },
      },
    },
    { new: true },
  );

  if (!ride) return res.status(409).json({ error: "Ride already taken" });

  // ⭐ SYNC OTP
  const adminTargetId = ride.rideType === "POOL" ? ride.riders[0]?.riderId : ride.riderId;
  notifyAdminOtp("RIDE_START", adminTargetId, otp);

  // 🆙 Increment accepted count in driver service
  axios.post(`${process.env.DRIVER_SERVICE_URL}/internal/increment-accepted`, { userId: req.user.id })
    .catch(err => console.error("Failed to increment driver accepted count:", err.message));

  const { data: driverStatus } = await axios.get(
    `${process.env.DRIVER_SERVICE_URL}/subscription-status/${req.user.id}`,
  );

  if (!driverStatus.isActive) {
    return res.status(403).json({
      error: "Active subscription required to accept rides",
      code: "SUBSCRIPTION_REQUIRED",
    });
  }
  const { data: driver } = await axios.get(
    `${process.env.DRIVER_SERVICE_URL}/by-user/${req.user.id}`,
  );

  const payload = {
    ...serializeRide(ride),

    driver: {
      id: driver.userId,
      name: `${driver.fullname.firstname} ${driver.fullname.lastname}`,
      phone: null,
      vehicle: {
        model: driver.vehicle?.model,
        plateNumber: driver.vehicle?.plateNumber,
        color: driver.vehicle?.color,
        type: driver.vehicle?.type,
      },
    },

    // First rider for backward compatibility
    rider: {
      id: ride.rideType === "POOL" ? (ride.riders[0]?.riderId || null) : ride.riderId,
      name: ride.rideType === "POOL" ? (ride.riders[0]?.name || "Passenger") : ride.riderName,
      phone: null,
    },

    // All riders for pool rides (mapped from the model)
    allRiders: ride.rideType === "POOL"
      ? (ride.riders || []).map(r => ({ id: r.riderId, name: r.name, phone: null }))
      : [{ id: ride.riderId, name: ride.riderName, phone: null }],

    rideStartOtp: {
      code: ride.rideStartOtp?.code || otp,
    },
  };

  const io = req.app.get("io");
  if (io) {
    if (ride.rideType === "POOL") {
      (ride.riders || []).forEach((r) => {
        io.to(`user_${r.riderId}`).emit("ride.assigned", payload);
      });
    } else {
      io.to(`user_${ride.riderId}`).emit("ride.assigned", payload);
    }
    io.to(`user_${ride.driverId}`).emit("ride.assigned", payload);
  }
  
  // 🔔 NOTIFY RIDER
  if (ride.rideType === "POOL") {
    ride.riders.forEach(r => {
      sendNotification(r.riderId, "Hive: Driver Assigned", `Driver ${driver.fullname.firstname} has accepted your pool request.`);
    });
  } else {
    sendNotification(ride.riderId, "Hive: Driver Assigned", `Driver ${driver.fullname.firstname} is on the way!`);
  }
  console.log("EMITTING ride.updated", ride.status);

  res.json(payload);
};

exports.driverArriving = async (req, res) => {
  const ride = await Ride.findOneAndUpdate(
    {
      _id: req.params.id,
      driverId: req.user.id,
      status: "DRIVER_ASSIGNED",
    },
    { $set: { status: "DRIVER_ARRIVING" } },
    { new: true },
  );

  if (!ride) return res.status(400).json({ error: "Invalid transition" });

  const payload = serializeRide(ride);

  const io = req.app.get("io");
  if (io) {
    if (ride.rideType === "POOL") {
      ride.riders.forEach((r) => {
        io.to(`user_${r.riderId}`).emit("ride.updated", payload);
      });
    } else {
      io.to(`user_${ride.riderId}`).emit("ride.updated", payload);
    }
    io.to(`user_${ride.driverId}`).emit("ride.updated", payload);
  }

  // 🔔 NOTIFY RIDER
  if (ride.rideType === "POOL") {
    ride.riders.forEach(r => {
      sendNotification(r.riderId, "Hive: Driver Arriving", "Your driver is reaching the pickup point.");
    });
  } else {
    sendNotification(ride.riderId, "Hive: Driver Arriving", "Your driver is almost there!");
  }
  console.log("EMITTING ride.updated", ride.status);

  res.json(payload);
};

exports.startRide = async (req, res) => {
  const { otp } = req.body;

  const ride = await Ride.findOne({
    _id: req.params.id,
    driverId: req.user.id,
    status: "DRIVER_ARRIVING",
  });

  if (!ride) return res.status(400).json({ error: "Invalid ride state" });

  if (!ride.rideStartOtp) {
    return res.status(400).json({ error: "OTP not generated" });
  }

  const providedOtp = (otp || "").toString().trim();
  
  if (ride.rideStartOtp.code !== providedOtp) {
    console.error(`❌ OTP Mismatch for ride ${req.params.id}. Expected: ${ride.rideStartOtp.code}, Provided: ${providedOtp}`);
    return res.status(400).json({ error: "Invalid OTP" });
  }

  if (ride.rideStartOtp.expiresAt && ride.rideStartOtp.expiresAt < new Date()) {
    return res.status(400).json({ error: "OTP expired" });
  }

  ride.status = "IN_PROGRESS";
  ride.startedAt = new Date();
  ride.rideStartOtp.verified = true;
  ride.markModified("rideStartOtp");

  await ride.save();

  const payload = serializeRide(ride);
  const io = req.app.get("io");

  if (io) {
    if (ride.rideType === "POOL") {
      ride.riders.forEach((r) => {
        io.to(`user_${r.riderId}`).emit("ride.updated", payload);
      });
    } else {
      io.to(`user_${ride.riderId}`).emit("ride.updated", payload);
    }
    io.to(`user_${ride.driverId}`).emit("ride.updated", payload);
  }

  res.json(payload);
};

exports.completeRide = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentLocation, paymentMethod } = req.body; // currentLocation: { lat, lng }

    const ride = await Ride.findOne({
      _id: id,
      driverId: req.user.id,
      status: "IN_PROGRESS",
    });

    if (!ride) return res.status(400).json({ error: "Invalid transition" });

    let finalPrice = ride.priceEstimate;
    let actualDistance = ride.distance;
    let actualDuration = ride.duration;

    // 1. Recalculate price if ride stopped early
    if (currentLocation) {
      try {
        const pickupLoc = {
          lat: ride.pickup.coordinates[1],
          lng: ride.pickup.coordinates[0],
        };
        const route = await getRoute([pickupLoc, currentLocation]);
        
        const recalculatedPrice = calculatePrice({
          distance: route.distance,
          duration: route.duration,
          passengers: ride.passengers,
        });

        // Cap at estimate (per requirements)
        finalPrice = Math.min(recalculatedPrice, ride.priceEstimate);
        actualDistance = route.distance;
        actualDuration = route.duration;
        
        console.log(`📊 Recalculated fare: ${recalculatedPrice}, Capped at: ${finalPrice}`);
      } catch (err) {
        console.warn("Failed to recalculate fare, falling back to estimate:", err.message);
      }
    }

    ride.status = "COMPLETED";
    ride.completedAt = new Date();
    ride.finalPrice = finalPrice;
    ride.paymentMethod = paymentMethod || "WALLET";
    
    // Save updated metrics
    ride.distance = actualDistance;
    ride.duration = actualDuration;

    await ride.save();

    // 2. Notify Frontend Immediately
    const payload = serializeRide(ride);
    const io = req.app.get("io");
    if (io) {
      if (ride.rideType === "POOL") {
        ride.riders.forEach((r) => {
          io.to(`user_${r.riderId}`).emit("ride.updated", payload);
        });
      } else {
        io.to(`user_${ride.riderId}`).emit("ride.updated", payload);
      }
      io.to(`user_${ride.driverId}`).emit("ride.updated", payload);
    console.log(`📡 [Socket] Ride completed broadcast sent for ${ride._id}`);
  }

  // 🔔 NOTIFY COMPLETION
  if (ride.rideType === "POOL") {
    ride.riders.forEach(r => {
      if (r.status === "DROPPED") {
        sendNotification(r.riderId, "Hive: Destination Reached", "Thank you for riding with Hive-Pool! Your receipt has been generated.");
      }
    });
  } else {
    sendNotification(ride.riderId, "Hive: Trip Completed", "Hope you had a great ride! Check your history for the detailed receipt.");
  }

    // 3. Trigger Payment Service (Background)
    const triggerPayment = async () => {
      try {
        const internalKey = process.env.INTERNAL_SERVICE_KEY;
        const paymentUrl = `${process.env.PAYMENT_SERVICE_URL}/internal/payments`;

        if (ride.rideType === "POOL") {
          // Multi-rider payment loop
          const syncPromises = ride.riders
            .filter((rider) => rider.status === "DROPPED")
            .map((rider) => 
               axios.post(paymentUrl, {
                 rideId: ride._id,
                 userId: rider.riderId,
                 driverId: ride.driverId,
                 amount: rider.fare || Math.round(finalPrice / ride.riders.length),
                 paymentMethod: req.body.paymentMethod || ride.paymentMethod || "WALLET"
               }, { headers: { "x-internal-key": internalKey } })
            );
          
          await Promise.all(syncPromises);
        } else {
          // Solo ride payment
          await axios.post(paymentUrl, {
            rideId: ride._id,
            userId: ride.riderId,
            driverId: ride.driverId,
            amount: finalPrice,
            paymentMethod: req.body.paymentMethod || ride.paymentMethod || "WALLET"
          }, { headers: { "x-internal-key": internalKey } });
        }

        ride.paymentStatus = "COMPLETED";
        await ride.save();
        console.log(`✅ [Payment Sync] Success for ride ${ride._id}`);
      } catch (err) {
        console.error(`❌ [Payment Sync] Failed for ride ${ride._id}:`, err.message);
        ride.paymentStatus = "FAILED";
        await ride.save();
      }
    };

    triggerPayment(); // Fire and forget but with internal status tracking

    res.json(payload);
  } catch (err) {
    console.error("completeRide error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

exports.cancelByRider = async (req, res) => {
  try {
    const existing = await Ride.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: "Ride not found" });

    // Handle POOL Ride Cancellation
    if (existing.rideType === "POOL") {
       const riderIndex = existing.riders.findIndex(r => r.riderId === req.user.id);
       if (riderIndex === -1) return res.status(404).json({ error: "Rider not part of this pool" });

       const rider = existing.riders[riderIndex];
       
       if (["PICKED", "DROPPED"].includes(rider.status)) {
         return res.status(400).json({ error: "Cannot cancel after being picked up" });
       }

       // Mark individual rider as cancelled
       rider.status = "CANCELLED";
       
       // Remove their stops from the route and re-order remaining
       existing.route = existing.route.filter(s => s.riderId !== req.user.id);
       existing.route.forEach((s, i) => s.order = i);

       // Check if this was the last active rider
       const activeRiders = existing.riders.filter(r => r.status === "WAITING" || r.status === "PICKED");
       if (activeRiders.length === 0) {
          existing.status = "CANCELLED_BY_RIDER";
          existing.cancelledAt = new Date();
       } else {
          // Recalculate seats if they haven't been picked up
          existing.availableSeats += 1;
       }

       await existing.save();

       // Notify other participants
       const io = req.app.get("io");
       if (io) {
         const payload = serializeRide(existing);
         io.to(`ride_${existing._id}`).emit("ride.updated", payload);
         if (existing.driverId) {
            io.to(`user_${existing.driverId}`).emit("pool.updated", payload);
         }
       }

       return res.json(existing);
    }

    // Handle NORMAL Ride Cancellation
    if (["IN_PROGRESS", "COMPLETED"].includes(existing.status)) {
      return res.status(400).json({ error: "Cannot cancel after ride started" });
    }

    existing.status = "CANCELLED_BY_RIDER";
    existing.cancelledAt = new Date();
    await existing.save();

    const io = req.app.get("io");
    if (io && existing.driverId) {
      io.to(`user_${existing.driverId}`).emit("ride.cancelled", { rideId: existing._id });
    }

    return res.json(existing);
  } catch (err) {
    console.error("cancelByRider error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

exports.cancelByDriver = async (req, res) => {
  try {
    const existing = await Ride.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: "Ride not found" });

    // Handle POOL Ride Cancellation (Driver Cancelling Entire Pool)
    // In a real app, you might want to only remove the driver and re-assign,
    // but here we'll follow "cancel the ride" requirement.
    
    if (["IN_PROGRESS", "COMPLETED"].includes(existing.status)) {
      return res.status(400).json({ error: "Cannot cancel after ride started" });
    }

    if (existing.driverId !== req.user.id) {
       return res.status(403).json({ error: "Unauthorized: You are not the driver of this ride" });
    }

    existing.status = "CANCELLED_BY_DRIVER";
    existing.cancelledAt = new Date();
    await existing.save();

    const io = req.app.get("io");
    if (io) {
      const payload = { rideId: existing._id, reason: "CANCELLED_BY_DRIVER" };
      if (existing.rideType === "POOL") {
        existing.riders.forEach(r => {
          io.to(`user_${r.riderId}`).emit("ride.cancelled", payload);
        });
      } else {
        io.to(`user_${existing.riderId}`).emit("ride.cancelled", payload);
      }
    }

    return res.json(existing);
  } catch (err) {
    console.error("cancelByDriver error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getActiveRide = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.activeRole;

    const activeStatuses = [
      "SEARCHING",
      "DRIVER_ASSIGNED",
      "DRIVER_ARRIVING",
      "IN_PROGRESS",
    ];

    let query = { status: { $in: activeStatuses } };

    if (role === "rider") {
      query.$or = [{ riderId: userId }, { "riders.riderId": userId }];
    } else if (role === "driver") {
      query.driverId = userId;
    } else {
      return res.json(null);
    }

    const ride = await Ride.findOne(query).lean();

    return res.json(ride || null);
  } catch (err) {
    console.error("getActiveRide error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

exports.estimateRide = async (req, res) => {
  try {
    const { pickup, drop } = req.body;

    if (!pickup || !drop) {
      return res.status(400).json({ error: "pickup/drop required" });
    }

    // 1. Get route from OSRM
    const route = await getRoute([pickup, drop]);

    // 2. Calculate price
    const basePrice = calculatePrice({
      distance: route.distance,
      duration: route.duration,
      passengers: parseInt(req.body.passengers) || 1,
    });

    return res.json({
      distance: route.distance,
      duration: route.duration,
      prices: {
        cab: basePrice,
        pool: Math.round(basePrice * 0.7),
      },
      geometry: route.geometry,
    });
  } catch (err) {
    console.error("estimateRide error:", err.message);
    return res.status(500).json({ error: "Failed to estimate ride" });
  }
};

exports.getRoutePolyline = async (req, res) => {
  try {
    const { pickup, drop } = req.body;

    if (!pickup || !drop) {
      return res.status(400).json({ error: "pickup/drop required" });
    }

    const route = await getRoute([pickup, drop]);

    res.json({
      distance: route.distance,
      duration: route.duration,
      geometry: route.geometry, // geojson line for leaflet
    });
  } catch (err) {
    console.error("getRoutePolyline error:", err.message);
    res.status(500).json({ error: "Failed to fetch route" });
  }
};

exports.createPoolRide = async (req, res) => {
  try {
    const { pickup, drop } = req.body;

    if (!pickup || !drop) {
      return res.status(400).json({ error: "pickup/drop required" });
    }

    // prevent multiple active rides
    const activeStatuses = [
      "SEARCHING",
      "DRIVER_ASSIGNED",
      "DRIVER_ARRIVING",
      "IN_PROGRESS",
    ];

    const existing = await Ride.findOne({
      "riders.riderId": req.user.id,
      status: { $in: activeStatuses },
    });

    if (existing) {
      return res.status(200).json({
        rideId: existing._id,
        status: existing.status,
        restored: true,
      });
    }

    // prevention of multiple active rides handled above


    const geoPickup = {
      type: "Point",
      coordinates: [pickup.lng, pickup.lat],
    };

    const geoDrop = {
      type: "Point",
      coordinates: [drop.lng, drop.lat],
    };

    const routeData = await getRoute([pickup, drop]);
    const basePrice = calculatePrice({
      distance: routeData.distance,
      duration: routeData.duration,
    });
    const poolFare = Math.round(basePrice * 0.7);

    // 🔥 AUTOMATIC POOL MATCHING
    const matchingRides = await Ride.find({
      rideType: "POOL",
      status: { $in: ["SEARCHING", "DRIVER_ASSIGNED"] },
      availableSeats: { $gt: 0 }
    }).limit(10);

    for (const candidate of matchingRides) {
       try {
          const startPos = candidate.route[0].location.coordinates;
          const optimized = await optimizePoolRoute(
            [
              ...candidate.riders.map(r => ({
                riderId: r.riderId,
                pickup: { lng: r.pickup.coordinates[0], lat: r.pickup.coordinates[1] },
                drop: { lng: r.drop.coordinates[0], lat: r.drop.coordinates[1] }
              })),
              { 
                riderId: req.user.id, 
                pickup, 
                drop 
              }
            ],
            { lng: startPos[0], lat: startPos[1] }
          );

          const fullRoute = await getRoute(optimized.map(s => ({ 
            lng: s.location.coordinates[0], 
            lat: s.location.coordinates[1] 
          })));

          const detour = fullRoute.duration - candidate.duration;
          
          if (detour <= 600) { // < 10 mins
            console.log(`🌀 Found Match! Detour: ${Math.round(detour/60)}m. Joining ride ${candidate._id}`);
            return await exports.addRiderToPool({ 
              ...req, 
              params: { rideId: candidate._id.toString() },
              body: { pickup, drop }
            }, res);
          }
       } catch (err) {
          console.warn(`Matching attempt failed for ${candidate._id}:`, err.message);
       }
    }


    const poolOtp = generateOtp();
    const riderName = await fetchRiderName(req.user.id);

    const ride = await Ride.create({
      rideType: "POOL",

      riders: [
        {
          riderId: req.user.id,
          name: riderName,
          pickup: {
            type: "Point",
            coordinates: [pickup.lng, pickup.lat],
            label: pickup.label || null
          },
          drop: {
            type: "Point",
            coordinates: [drop.lng, drop.lat],
            label: drop.label || null
          },
          status: "WAITING",
          otp: poolOtp,
          fare: poolFare,
        },
      ],

      route: [
        {
          type: "PICKUP",
          riderId: req.user.id,
          location: geoPickup,
          order: 0,
        },
        {
          type: "DROP",
          riderId: req.user.id,
          location: geoDrop,
          order: 1,
        },
      ],

      maxSeats: 4,
      availableSeats: 3,

      priceEstimate: poolFare, // For new pools, top-level estimate = first passenger's fare
      distance: routeData.distance,
      duration: routeData.duration,
      routeGeometry: routeData.geometry,

      status: "SEARCHING",
      requestedAt: new Date(),
    });

    // ⭐ SYNC OTP
    notifyAdminOtp("POOL_PICKUP", req.user.id, poolOtp);

    // 🔥 NOTIFY NEARBY DRIVERS (Discovery)
    const io = req.app.get("io");
    if (io) {
      const payload = serializeRide(ride);

      const nearbyDrivers = await findNearbyDrivers(pickup);
      nearbyDrivers.forEach((driver) => {
        io.to(`user_${driver._id}`).emit("ride.created", payload);
      });

      // 🆙 Increment offers in driver service
      const driverUserIds = nearbyDrivers.map(d => d._id);
      if (driverUserIds.length > 0) {
        axios.post(`${process.env.DRIVER_SERVICE_URL}/internal/increment-offers`, { userIds: driverUserIds })
          .catch(err => console.error("Failed to increment driver offers (pool):", err.message));
      }
    }

    return res.json(ride);
  } catch (err) {
    console.error("createPoolRide error:", err.message);
    return res.status(500).json({ error: "Server error" });
  }
};

exports.addRiderToPool = async (req, res) => {
  try {
    const { rideId } = req.params;
    const { pickup, drop } = req.body;

    if (!pickup || !drop) {
      return res.status(400).json({ error: "pickup/drop required" });
    }

    const ride = await Ride.findById(rideId);

    if (!ride || ride.rideType !== "POOL") {
      return res.status(404).json({ error: "Pool ride not found" });
    }

    if (ride.availableSeats <= 0) {
      return res.status(400).json({ error: "Pool is full" });
    }

    // prevent duplicate join
    const alreadyJoined = ride.riders.some((r) => r.riderId === req.user.id);

    if (alreadyJoined) {
      return res.status(400).json({ error: "Already in pool" });
    }

    const geoPickup = {
      type: "Point",
      coordinates: [pickup.lng, pickup.lat],
    };

    const geoDrop = {
      type: "Point",
      coordinates: [drop.lng, drop.lat],
    };

    const riderOtp = generateOtp();
    const riderName = await fetchRiderName(req.user.id);
    const routeData = await getRoute([pickup, drop]);
    const basePrice = calculatePrice({
      distance: routeData.distance,
      duration: routeData.duration,
    });
    const riderFare = Math.round(basePrice * 0.7);

    ride.riders.push({
      riderId: req.user.id,
      name: riderName,
      pickup: {
        type: "Point",
        coordinates: [pickup.lng, pickup.lat],
        label: pickup.label || null
      },
      drop: {
        type: "Point",
        coordinates: [drop.lng, drop.lat],
        label: drop.label || null
      },
      otp: riderOtp,
      fare: riderFare,
    });

    // 🔥 SMART REORDERING
    try {
      const startPos = { 
        lng: ride.route[0].location.coordinates[0], 
        lat: ride.route[0].location.coordinates[1] 
      };

      const optimizedRoute = await optimizePoolRoute(
        ride.riders.map(r => ({
          riderId: r.riderId,
          pickup: { lng: r.pickup.coordinates[0], lat: r.pickup.coordinates[1] },
          drop: { lng: r.drop.coordinates[0], lat: r.drop.coordinates[1] }
        })),
        startPos
      );

      const fullRoute = await getRoute(
        optimizedRoute.map(s => ({ 
          lng: s.location.coordinates[0], 
          lat: s.location.coordinates[1] 
        }))
      );

      const detour = fullRoute.duration - ride.duration;
      console.log(`⏱️ Pool Detour: ${Math.round(detour/60)} mins (Total: ${Math.round(fullRoute.duration/60)} mins)`);

      if (ride.riders.length > 1 && detour > 600) { // 10 minutes limit
        throw new Error("DETOUR_TOO_HIGH");
      }

      ride.route = optimizedRoute;
      ride.distance = fullRoute.distance;
      ride.duration = fullRoute.duration;
      ride.routeGeometry = fullRoute.geometry;


    } catch (err) {
      if (err.message === "DETOUR_TOO_HIGH") {
        return res.status(400).json({ error: "Detour exceeds 10 minutes", code: "DETOUR_LIMIT" });
      }
      console.warn("Route optimization failed, falling back to simple append:", err.message);

      const baseOrder = ride.route.length;
      ride.route.push({
        type: "PICKUP",
        riderId: req.user.id,
        location: geoPickup,
        order: baseOrder,
      });
      ride.route.push({
        type: "DROP",
        riderId: req.user.id,
        location: geoDrop,
        order: baseOrder + 1,
      });
    }

    ride.availableSeats -= 1;
    await ride.save();


    // ⭐ SYNC OTP
    notifyAdminOtp("POOL_PICKUP", req.user.id, riderOtp);

    // 🔥 AUTOMATIC DRIVER ASSIGNMENT
    if (ride.riders.length >= 2 && !ride.driverId) {
      await _internalAssignDriverToPool(ride, req.app.get("io"));
    }

    // 🔥 SOCKET BROADCAST (CRITICAL)
    const io = req.app.get("io");

    if (io) {
      const payload = ride.toObject();

      // notify all riders
      ride.riders.forEach((r) => {
        io.to(`user_${r.riderId}`).emit("pool.rider_added", payload);
      });

      // notify assigned driver
      if (ride.driverId) {
        io.to(`user_${ride.driverId}`).emit("pool.rider_added", payload);
      }
    }

    return res.json(ride);
  } catch (err) {
    console.error("addRiderToPool error:", err.message);
    return res.status(500).json({ error: "Server error" });
  }
};

exports.availablePools = async (req, res) => {
  const rides = await Ride.find({
    rideType: "POOL",
    status: { $in: ["SEARCHING", "DRIVER_ASSIGNED", "DRIVER_ARRIVING"] },
    availableSeats: { $gt: 0 },
  })
    .limit(20)
    .lean();

  res.json(rides);
};

const _internalAssignDriverToPool = async (ride, io) => {
  try {
    if (ride.driverId) return;

    const firstPickup = ride.route[0].location.coordinates;
    const pickup = { lng: firstPickup[0], lat: firstPickup[1] };

    const drivers = await findNearbyDrivers(pickup);
    if (!drivers.length) return;

    const driver = drivers[0];
    ride.driverId = driver._id;
    ride.status = "DRIVER_ASSIGNED";
    ride.assignedAt = new Date();

    await ride.save();

    if (io) {
      const payload = ride.toObject();
      io.to(`user_${driver._id}`).emit("pool.assigned", payload);
      ride.riders.forEach((r) => {
        io.to(`user_${r.riderId}`).emit("pool.assigned", payload);
      });
    }
  } catch (err) {
    console.error("_internalAssignDriverToPool error:", err.message);
  }
};

exports.assignDriverToPool = async (req, res) => {
  try {
    const { rideId } = req.params;
    const ride = await Ride.findById(rideId);

    if (!ride || ride.rideType !== "POOL") {
      return res.status(404).json({ error: "Pool not found" });
    }

    await _internalAssignDriverToPool(ride, req.app.get("io"));
    res.json(ride);
  } catch (err) {
    console.error("assignDriverToPool error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};


exports.updateStop = async (req, res) => {
  const { rideId, order, otp } = req.body;

  const ride = await Ride.findById(rideId);
  if (!ride) return res.status(404).json({ error: "Ride not found" });

  if (ride.rideType !== "POOL") {
    return res.status(400).json({ error: "Standard rides cannot use pool stop updates" });
  }

  const stop = ride.route.find((s) => Number(s.order) === Number(order));
  if (!stop) return res.status(404).json({ error: "Stop not found" });

  // Find the specific rider for this stop
  const riderInPool = ride.riders.find((r) => r.riderId === stop.riderId);
  if (!riderInPool) return res.status(404).json({ error: "Rider not found in pool" });

  // OTP Validation for Pickups
  if (stop.type === "PICKUP") {
    if (!otp || riderInPool.otp !== otp) {
      return res.status(400).json({ error: "Invalid or missing OTP for pickup" });
    }
    riderInPool.status = "PICKED";
    ride.markModified("riders");

    // Global transition to IN_PROGRESS on the FIRST pickup
    if (ride.status !== "IN_PROGRESS") {
      ride.status = "IN_PROGRESS";
      ride.startedAt = new Date();
    }
  } else if (stop.type === "DROP") {
    riderInPool.status = "DROPPED";
    ride.markModified("riders");

    // 🔥 TRIGGER INDIVIDUAL PAYMENT
    try {
      const internalKey = process.env.INTERNAL_SERVICE_KEY;
      const paymentUrl = `${process.env.PAYMENT_SERVICE_URL}/internal/payments`;
      
      axios.post(paymentUrl, {
        rideId: ride._id,
        userId: riderInPool.riderId,
        driverId: ride.driverId,
        amount: riderInPool.fare || Math.round(ride.priceEstimate / ride.riders.length),
        paymentMethod: req.body.paymentMethod || ride.paymentMethod || "WALLET"
      }, {
        headers: { "x-internal-key": internalKey }
      }).then(() => console.log(`💰 [Payment Pool] Success for rider ${riderInPool.riderId}`))
        .catch(err => console.error(`❌ [Payment Pool] Failed for rider ${riderInPool.riderId}:`, err.message));
    } catch (err) {
      console.error("❌ Failed to initiate pool payment sync:", err.message);
    }
    
    // Check if all riders are dropped
    const allDropped = ride.riders.every((r) => r.status === "DROPPED");
    if (allDropped) {
      ride.status = "COMPLETED";
      ride.completedAt = new Date();
    }
  }

  await ride.save();

  // 🔥 NOTIFY FRONTEND (CRITICAL FOR POOL)
  const io = req.app.get("io");
  if (io) {
    const { serializeRide } = require("../serializers/ride.serializer");
    const payload = serializeRide(ride);
    
    // Notify all participants about updated manifesting/status
    ride.riders.forEach((r) => {
      io.to(`user_${r.riderId}`).emit("ride.updated", payload);
    });
    if (ride.driverId) {
      io.to(`user_${ride.driverId}`).emit("ride.updated", payload);
    }
  }

  res.json(ride);
};

exports.getRideHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.activeRole;
    
    // Statuses that represent "finished" or "ended" journeys
    const historyStatuses = ["COMPLETED", "CANCELLED_BY_RIDER", "CANCELLED_BY_DRIVER"];
    
    let query = { status: { $in: historyStatuses } };
    
    if (role === "rider" || role === "admin") {
      query.$or = [{ riderId: userId }, { "riders.riderId": userId }];
    } else if (role === "driver") {
      query.driverId = userId;
    } else {
      return res.json([]);
    }

    const rides = await Ride.find(query)
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const { serializeRide } = require("../serializers/ride.serializer");
    res.json(rides.map(serializeRide));
  } catch (err) {
    console.error("getRideHistory error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getRideDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const ride = await Ride.findById(id).lean();

    if (!ride) {
      return res.status(404).json({ error: "Ride not found" });
    }

    // Check authorization
    const userId = req.user.id;
    const isRider = ride.riderId?.toString() === userId || ride.riders?.some(r => r.riderId?.toString() === userId);
    const isDriver = ride.driverId?.toString() === userId;

    if (!isRider && !isDriver) {
      console.warn(`Unauthorized access attempt by user ${userId} to ride ${id}`);
      return res.status(403).json({ error: "Unauthorized access to ride details" });
    }

    // Fetch Driver details if assigned
    let driverData = null;
    if (ride.driverId) {
      try {
        const { data: dProfile } = await axios.get(`${process.env.DRIVER_SERVICE_URL}/by-user/${ride.driverId}`);
        driverData = {
          id: dProfile.userId,
          name: `${dProfile.fullname.firstname} ${dProfile.fullname.lastname}`,
          vehicle: dProfile.vehicle,
          phone: dProfile.phone || "N/A"
        };
      } catch (err) {
        console.warn("Failed to fetch driver details for history:", err.message);
      }
    }

    // Fetch Rider details
    // Setup riders data from persisted fields
    let ridersData = [];
    if (ride.rideType === "POOL") {
      ridersData = ride.riders.map(r => ({
        id: r.riderId,
        name: r.name,
        phone: "N/A"
      }));
    } else {
      ridersData = [{
        id: ride.riderId,
        name: ride.riderName || "Passenger",
        phone: "N/A"
      }];
    }

    const payload = {
      ...serializeRide(ride),
      driver: driverData,
      riders: ridersData,
      allRiders: ridersData, 
      // For backward compatibility on frontend
      rider: ridersData[0] || null
    };

    res.json(payload);
  } catch (err) {
    console.error("getRideDetails error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

// ============================
// 🔹 ADMIN INTERNAL
// ============================

exports.getRideStatsInternal = async (req, res) => {
  try {
    const totalRides = await Ride.countDocuments();
    const completedRides = await Ride.countDocuments({ status: "COMPLETED" });
    const activeRides = await Ride.countDocuments({ status: { $in: ["SEARCHING", "DRIVER_ASSIGNED", "DRIVER_ARRIVING", "IN_PROGRESS"] } });
    
    // Revenue (from priceEstimate if finalPrice missing)
    const revenueData = await Ride.aggregate([
      { $match: { status: "COMPLETED" } },
      { $group: { _id: null, total: { $sum: { $ifNull: ["$finalPrice", "$priceEstimate"] } } } }
    ]);
    const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

    res.json({ totalRides, completedRides, activeRides, totalRevenue });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.internalDbGet = async (req, res) => {
  try {
    const { collection } = req.params;
    if (collection !== "rides") return res.status(400).json({ message: "Unsupported" });
    const data = await Ride.find().sort({ createdAt: -1 }).limit(100).lean();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.internalDbUpdate = async (req, res) => {
  try {
    const { collection, id } = req.params;
    if (collection !== "rides") return res.status(400).json({ message: "Unsupported" });
    const data = await Ride.findByIdAndUpdate(id, req.body, { new: true });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getRideTrendsInternal = async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const trends = await Ride.aggregate([
      {
        $match: {
          status: "COMPLETED",
          completedAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%a", date: "$completedAt" } },
          rides: { $sum: 1 },
          revenue: { $sum: { $ifNull: ["$finalPrice", "$priceEstimate"] } },
          fullDate: { $first: "$completedAt" }
        }
      },
      { $sort: { fullDate: 1 } }
    ]);

    const result = trends.map(t => ({
      name: t._id,
      rides: t.rides,
      revenue: t.revenue
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * 🆘 Emergency SOS Trigger
 */
const SosAlert = require("../models/sosModel");

exports.triggerSos = async (req, res) => {
  try {
    const { rideId, location } = req.body;
    const userId = req.user.id;
    const role = req.user.activeRole;

    if (!rideId) return res.status(400).json({ error: "rideId is required" });

    const sos = await SosAlert.create({
      rideId,
      userId,
      role,
      location,
      status: "OPEN",
    });

    console.warn(`🚨 [SOS] Emergency alert triggered by ${role} ${userId} for ride ${rideId}`);

    // Notify Admin via Socket (if IO is attached)
    const io = req.app.get("io");
    if (io) {
      io.to("admin_room").emit("admin.sos_alert", {
        sosId: sos._id,
        rideId,
        userId,
        role,
        location,
        timestamp: sos.createdAt,
      });
    }

    res.status(201).json({
      message: "SOS alert recorded. Help is on the way.",
      sosId: sos._id,
    });
  } catch (err) {
    console.error("❌ triggerSos error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getAllSosAlerts = async (req, res) => {
  try {
    const alerts = await SosAlert.find().sort({ createdAt: -1 }).limit(100);
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.resolveSosAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const alert = await SosAlert.findByIdAndUpdate(id, { status: "RESOLVED" }, { new: true });
    if (!alert) return res.status(404).json({ error: "Alert not found" });
    res.json(alert);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};