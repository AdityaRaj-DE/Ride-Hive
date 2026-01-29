// controllers/ride.controller.js

const Ride = require("../models/ride");


exports.createRide = async (req, res) => {
  const { pickup, drop } = req.body;

  if (!pickup || !drop) return res.status(400).json({ error: "pickup/drop required" });

  const ride = await Ride.create({
    riderId: req.user.id,
    pickup: { type: "Point", coordinates: [pickup.lng, pickup.lat] },
    drop: { type: "Point", coordinates: [drop.lng, drop.lat] },
    status: "SEARCHING",
    requestedAt: new Date(),
  });

  const io = req.app.get("io");
  if (io) io.to("drivers").emit("ride.created", { rideId: ride._id });

  res.status(201).json({ rideId: ride._id, status: ride.status });
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

  res.json({ rideId: ride._id });
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

  res.json({ success: true });
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

  res.json({ success: true });
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

  res.json({ success: true });
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

  res.json({ success: true });
};
