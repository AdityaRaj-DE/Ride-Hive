// controllers/ride.controller.js

const Ride = require("../models/ride");


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
    const ride = await Ride.create({
      riderId: req.user.id,
      pickup: { type: "Point", coordinates: [pickup.lng, pickup.lat] },
      drop: { type: "Point", coordinates: [drop.lng, drop.lat] },
      status: "SEARCHING",
      requestedAt: new Date(),
    });

    // 3) Broadcast to drivers
    const io = req.app.get("io");
    if (io) {
      io.to("drivers").emit("ride.created", {
        rideId: ride._id,
        pickup,
        drop,
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
      },
    },
    { new: true }
  );

  if (!ride) return res.status(409).json({ error: "Ride already taken" });

  const io = req.app.get("io");
  if (io) {
    io.to(`rider_${ride.riderId}`).emit("ride.assigned", ride);
    io.to(`driver_${req.user.id}`).emit("ride.assigned", ride);
  }
  console.log("EMITTING ride.updated", ride.status);


  res.json({
    rideId: ride._id,
    riderId: ride.riderId,
    driverId: ride.driverId,
    status: ride.status
  });
  
};


exports.driverArriving = async (req, res) => {
  const ride = await Ride.findOneAndUpdate(
    {
      _id: req.params.id,
      driverId: req.user.id,
      status: "DRIVER_ASSIGNED",
    },
    { $set: { status: "DRIVER_ARRIVING" } },
    { new: true }
  );

  if (!ride) return res.status(400).json({ error: "Invalid transition" });

  const io = req.app.get("io");
  if (io) {
    io.to(`user_${ride.riderId}`).emit("ride.updated", ride);
    io.to(`user_${ride.driverId}`).emit("ride.updated", ride);
  }
  console.log("EMITTING ride.updated", ride.status);


  res.json(ride);

};


exports.startRide = async (req, res) => {
  const ride = await Ride.findOneAndUpdate(
    {
      _id: req.params.id,
      driverId: req.user.id,
      status: "DRIVER_ARRIVING",
    },
    {
      $set: {
        status: "IN_PROGRESS",
        startedAt: new Date(),
      },
    },
    { new: true }
  );

  if (!ride) return res.status(400).json({ error: "Invalid transition" });

  const io = req.app.get("io");
  if (io) {
    io.to(`user_${ride.riderId}`).emit("ride.updated", ride);
    io.to(`user_${ride.driverId}`).emit("ride.updated", ride);
  }
  console.log("EMITTING ride.updated", ride.status);


  res.json(ride);

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
    { new: true }
  );

  if (!ride) return res.status(400).json({ error: "Invalid transition" });

  const io = req.app.get("io");
  if (io) {
    io.to(`user_${ride.riderId}`).emit("ride.updated", ride);
    io.to(`user_${ride.driverId}`).emit("ride.updated", ride);
  }
  console.log("EMITTING ride.updated", ride.status);


  res.json(ride);

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
    { new: true }
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
      "IN_PROGRESS"
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
