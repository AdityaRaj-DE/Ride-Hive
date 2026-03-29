// controllers/ride.controller.js

const Ride = require("../models/ride");
const { getRoute } = require("../services/route.service");
const { calculatePrice } = require("../services/pricing.service");
const { findNearbyDrivers } = require("../services/driver.service");
const { generateOtp } = require("../services/otp.service");

const { serializeRide } = require("../serializers/ride.serializer");
const axios = require("axios");

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
    // 3) Broadcast to drivers
    const io = req.app.get("io");

    if (io) {
      const nearbyDrivers = await findNearbyDrivers(pickup);

      const payload = {
        rideId: ride._id,
        pickup,
        drop,
        distance: ride.distance,
        duration: ride.duration,
        price: ride.priceEstimate,
      };

      nearbyDrivers.forEach((driver) => {
        io.to(`user_${driver._id}`).emit("ride.created", payload);
      });
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

  const { data: driver } = await axios.get(
    `${process.env.DRIVER_SERVICE_URL}/by-user/${req.user.id}`,
  );

  const { data: rider } = await axios.get(
    `${process.env.RIDER_SERVICE_URL}/by-user/${ride.riderId}`,
  );
  const payload = {
    ...serializeRide(ride),

    driver: {
      id: driver.id,
      name: driver.name,
      phone: driver.phone,
    },

    rider: {
      id: rider.id,
      name: rider.name,
      phone: rider.phone,
    },

    rideStartOtp: {
      code: ride.rideStartOtp.code,
    },
  };
  const io = req.app.get("io");
  if (io) {
    io.to(`rider_${ride.riderId}`).emit("ride.assigned", payload);
    io.to(`driver_${req.user.id}`).emit("ride.assigned", payload);
    io.to(`user_${ride.riderId}`).emit("ride.otp", {
      rideId: ride._id,
      otp: ride.rideStartOtp.code,
    });
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
    io.to(`user_${ride.riderId}`).emit("ride.updated", payload);
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
    io.to(`user_${ride.riderId}`).emit("ride.updated", payload);
    io.to(`user_${ride.driverId}`).emit("ride.updated", payload);
  }

  res.json(payload);
};

exports.completeRide = async (req, res) => {
  const ride = await Ride.findOneAndUpdate(
    {
      _id: req.params.id,
      driverId: req.user.id,
      status: "IN_PROGRESS",
    },
    {
      $set: {
        status: "COMPLETED",
        completedAt: new Date(),
        finalPrice: req.body.finalPrice || 0,
      },
    },
    { new: true },
  );

  if (!ride) return res.status(400).json({ error: "Invalid transition" });

  const payload = serializeRide(ride);
  const io = req.app.get("io");
  if (io) {
    io.to(`user_${ride.riderId}`).emit("ride.updated", payload);
    io.to(`user_${ride.driverId}`).emit("ride.updated", payload);
  }
  console.log("EMITTING ride.updated", ride.status);

  res.json(payload);
};

exports.cancelByRider = async (req, res) => {
  const ride = await Ride.findOneAndUpdate(
    {
      _id: req.params.id,
      riderId: req.user.id,
      status: { $in: ["SEARCHING", "DRIVER_ASSIGNED"] },
    },
    {
      $set: {
        status: "CANCELLED_BY_RIDER",
        cancelledAt: new Date(),
      },
    },
    { new: true },
  );

  if (!ride) return res.status(400).json({ error: "Cannot cancel" });

  res.json(ride);
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
      query.riderId = userId;
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
    const price = calculatePrice({
      distance: route.distance,
      duration: route.duration,
    });

    return res.json({
      distance: route.distance,
      duration: route.duration,
      price,
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
