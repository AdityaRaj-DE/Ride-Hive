// controllers/ride.controller.js

const Ride = require("../models/ride");
const { getRoute } = require("../services/route.service");
const { calculatePrice } = require("../services/pricing.service");
const { findNearbyDrivers } = require("../services/driver.service");
const { generateOtp } = require("../services/otp.service");

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

exports.getRouteGeometry = async (req, res) => {
  try {
    const { start, end } = req.body;
    if (!start || !end) return res.status(400).json({ error: "start and end required" });
    const route = await getRoute(start, end);
    res.json(route);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createRide = async (req, res) => {
  try {
    const { pickup, drop } = req.body;

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
    const route = await getRoute(pickup, drop);

    const priceEstimate = calculatePrice({
      distance: route.distance,
      duration: route.duration,
    });

    const ride = await Ride.create({
      riderId: req.user.id,

      pickup: { type: "Point", coordinates: [pickup.lng, pickup.lat] },
      drop: { type: "Point", coordinates: [drop.lng, drop.lat] },

      distance: route.distance,
      duration: route.duration,
      routeGeometry: route.geometry,

      priceEstimate,

      status: "SEARCHING",
      requestedAt: new Date(),
    });

    // 3) Broadcast to drivers
    const io = req.app.get("io");

    if (io) {
      const nearbyDrivers = await findNearbyDrivers(pickup);

      let riderName = "Incoming Passenger";
      try {
        const { data: riderInfo } = await axios.get(
          `${process.env.RIDER_SERVICE_URL}/by-user/${req.user.id}`
        );
        if (riderInfo && riderInfo.rider) {
          riderName = `${riderInfo.rider.name.first} ${riderInfo.rider.name.last}`;
        }
      } catch (err) {
        console.warn("Failed to fetch rider name for broadcast:", err.message);
      }

      const payload = {
        rideId: ride._id,
        pickup,
        drop,
        distance: ride.distance,
        duration: ride.duration,
        price: ride.priceEstimate,
        riderName,
      };

      nearbyDrivers.forEach((driver) => {
        io.to(`user_${driver._id}`).emit("ride.created", payload);
      });

      // 🆙 Increment offers in driver service
      const driverUserIds = nearbyDrivers.map(d => d._id);
      if (driverUserIds.length > 0) {
        axios.post(`${process.env.DRIVER_SERVICE_URL}/internal/increment-offers`, { userIds: driverUserIds })
          .catch(err => console.error("Failed to increment driver offers:", err.message));
      }
    }

    return res.status(201).json({
      rideId: ride._id,
      status: ride.status,
    });
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
  notifyAdminOtp("RIDE_START", ride.riderId, otp);

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

  let riders = [];
  if (ride.rideType === "POOL") {
    // Fetch all rider profiles for pool
    const riderPromises = ride.riders.map((r) =>
      axios.get(`${process.env.RIDER_SERVICE_URL}/by-user/${r.riderId}`).then(res => res.data).catch(() => null)
    );
    riders = (await Promise.all(riderPromises)).filter(r => r !== null);
  } else {
    // Single rider for normal ride
    const { data: singleRider } = await axios.get(
      `${process.env.RIDER_SERVICE_URL}/by-user/${ride.riderId}`,
    );
    riders = [singleRider];
  }

  // Fallback for safety
  if (riders.length === 0) {
     return res.status(500).json({ error: "Failed to fetch rider details" });
  }

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
      id: riders[0].rider.userId,
      name: `${riders[0].rider.name.first} ${riders[0].rider.name.last}`,
      phone: null,
    },

    // All riders for pool rides
    allRiders: riders.map(r => ({
      id: r.rider.userId,
      name: `${r.rider.name.first} ${r.rider.name.last}`,
      phone: null
    })),

    rideStartOtp: {
      code: ride.rideStartOtp.code,
    },
  };
  console.log("DRIVER API RAW:", driver);
  console.log("RIDER API RAW:", riders);
  const io = req.app.get("io");
  if (io) {
    if (ride.rideType === "POOL") {
      ride.riders.forEach((r) => {
        io.to(`user_${r.riderId}`).emit("ride.assigned", payload);
      });
    } else {
      io.to(`user_${ride.riderId}`).emit("ride.assigned", payload);
    }
    io.to(`user_${ride.driverId}`).emit("ride.assigned", payload);
  }
  console.log("EMITTING ride.updated", ride.status);

  console.log("otp: ", ride.rideStartOtp.code);

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

  if (ride.rideStartOtp.code !== otp) {
    return res.status(400).json({ error: "Invalid OTP" });
  }

  if (ride.rideStartOtp.expiresAt < new Date()) {
    return res.status(400).json({ error: "OTP expired" });
  }

  ride.status = "IN_PROGRESS";
  ride.startedAt = new Date();
  ride.rideStartOtp.verified = true;

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
        const route = await getRoute(pickupLoc, currentLocation);
        
        const recalculatedPrice = calculatePrice({
          distance: route.distance,
          duration: route.duration,
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

    // 3. Trigger Payment Service (Background)
    try {
      // We don't await here to avoid blocking a fast response, 
      // but we catch errors to log them correctly.
      axios.post(`${process.env.PAYMENT_SERVICE_URL}/internal/payments`, {
        rideId: ride._id,
        userId: ride.riderId,
        driverId: ride.driverId,
        amount: finalPrice,
        paymentMethod: ride.paymentMethod
      }, {
        headers: { "x-internal-key": process.env.INTERNAL_SERVICE_KEY }
      }).then(() => {
        console.log(`💰 [Payment Sync] Success for ride ${ride._id}`);
      }).catch(err => {
        console.error("❌ [Payment Sync] Failed background call:", err.message);
      });
    } catch (err) {
       console.error("❌ Failed to initiate payment sync block:", err.message);
    }

    res.json(payload);
  } catch (err) {
    console.error("completeRide error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

exports.cancelByRider = async (req, res) => {
  console.log("Cancel request:", {
    rideId: req.params.id,
    userId: req.user.id,
  });

  const existing = await Ride.findById(req.params.id);

  if (!existing) {
    return res.status(404).json({ error: "Ride not found" });
  }

  // ❗ already cancelled → just return success
  if (existing.status === "CANCELLED_BY_RIDER") {
    return res.json(existing);
  }

  // ❗ not allowed to cancel
  if (["IN_PROGRESS", "COMPLETED"].includes(existing.status)) {
    return res.status(400).json({
      error: "Cannot cancel after ride started",
    });
  }

  // ✅ perform cancel
  existing.status = "CANCELLED_BY_RIDER";
  existing.cancelledAt = new Date();

  await existing.save();

  return res.json(existing);
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
    const route = await getRoute(pickup, drop);

    // 2. Calculate price
    const basePrice = calculatePrice({
      distance: route.distance,
      duration: route.duration,
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

    const route = await getRoute(pickup, drop);

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

    // 🔥 SMART MATCHING: Find existing pools 
    const matchingPool = await Ride.findOne({
      rideType: "POOL",
      status: { $in: ["SEARCHING", "DRIVER_ASSIGNED", "DRIVER_ARRIVING"] },
      availableSeats: { $gt: 0 },
      "route.location": {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [pickup.lng, pickup.lat],
          },
          $maxDistance: 15000, // 15km
        },
      },
      // Ensure we match with pools that haven't picked anyone else yet or are still at start
      "route.order": 0,
    });

    if (matchingPool) {
      // Auto-join existing pool
      return await exports.addRiderToPool(
        {
          params: { rideId: matchingPool._id },
          body: { pickup, drop },
          user: req.user,
          app: req.app,
        },
        res,
      );
    }

    const geoPickup = {
      type: "Point",
      coordinates: [pickup.lng, pickup.lat],
    };

    const geoDrop = {
      type: "Point",
      coordinates: [drop.lng, drop.lat],
    };

    const routeData = await getRoute(pickup, drop);
    const basePrice = calculatePrice({
      distance: routeData.distance,
      duration: routeData.duration,
    });

    const poolOtp = generateOtp();
    const ride = await Ride.create({
      rideType: "POOL",

      riders: [
        {
          riderId: req.user.id,
          pickup: geoPickup,
          drop: geoDrop,
          status: "WAITING",
          otp: poolOtp,
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

      priceEstimate: Math.round(basePrice * 0.7),
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
      let riderName = "Incoming Passenger";
      try {
        const { data: riderInfo } = await axios.get(
          `${process.env.RIDER_SERVICE_URL}/by-user/${req.user.id}`
        );
        if (riderInfo && riderInfo.rider) {
          riderName = `${riderInfo.rider.name.first} ${riderInfo.rider.name.last}`;
        }
      } catch (err) {
        console.warn("Failed to fetch rider name for pool broadcast:", err.message);
      }

      const payload = {
        _id: ride._id,
        rideId: ride._id,
        pickup: pickup,
        drop: drop,
        price: ride.priceEstimate,
        rideType: "POOL",
        availableSeats: ride.availableSeats,
        riderName,
      };

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

    const baseOrder = ride.route.length;
    const riderOtp = generateOtp();

    ride.riders.push({
      riderId: req.user.id,
      pickup: geoPickup,
      drop: geoDrop,
      otp: riderOtp,
    });

    // append route (NO REORDERING)
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

  const stop = ride.route.find((s) => s.order === order);
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

    // Global transition to IN_PROGRESS on the FIRST pickup
    if (ride.status !== "IN_PROGRESS") {
      ride.status = "IN_PROGRESS";
      ride.startedAt = new Date();
    }
  } else if (stop.type === "DROP") {
    riderInPool.status = "DROPPED";
    
    // Check if all riders are dropped
    const allDropped = ride.riders.every((r) => r.status === "DROPPED");
    if (allDropped) {
      ride.status = "COMPLETED";
      ride.completedAt = new Date();
    }
  }

  await ride.save();

  // Populate driver and rider details for the frontend
  // (In a real app, you'd use a more robust way to populate these)
  // For now, we'll return the ride and the gateway will broadcast it.

  res.json(ride);
};

exports.getRideHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.activeRole;
    
    // Statuses that represent "finished" or "ended" journeys
    const historyStatuses = ["COMPLETED", "CANCELLED_BY_RIDER", "CANCELLED_BY_DRIVER"];
    
    let query = { status: { $in: historyStatuses } };
    
    if (role === "rider") {
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
    let ridersData = [];
    if (ride.rideType === "POOL") {
      const riderPromises = ride.riders.map(r => 
        axios.get(`${process.env.RIDER_SERVICE_URL}/by-user/${r.riderId}`).then(res => res.data).catch(() => null)
      );
      ridersData = (await Promise.all(riderPromises))
        .filter(r => r !== null)
        .map(r => ({
          id: r.rider.userId,
          name: `${r.rider.name.first} ${r.rider.name.last}`,
          phone: r.rider.phone || "N/A"
        }));
    } else {
      try {
        const { data: rProfile } = await axios.get(`${process.env.RIDER_SERVICE_URL}/by-user/${ride.riderId}`);
        ridersData = [{
          id: rProfile.rider.userId,
          name: `${rProfile.rider.name.first} ${rProfile.rider.name.last}`,
          phone: rProfile.rider.phone || "N/A"
        }];
      } catch (err) {
        console.warn("Failed to fetch rider details for history:", err.message);
      }
    }

    const payload = {
      ...serializeRide(ride),
      driver: driverData,
      riders: ridersData,
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