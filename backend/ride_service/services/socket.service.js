const Ride = require("../models/ride");
const axios = require("axios");
const { getRoute, calculateFare } = require("./fare.service");

const DRIVER_SERVICE_URL = process.env.DRIVER_SERVICE_URL || "http://localhost:3003";

function setupSockets(io) {
  io.on("connection", (socket) => {
    console.log("✅ Socket connected:", socket.id, socket.user);

    // Auto join user room
    socket.join(`user_${socket.user.id}`);

    // Join role rooms
    if (socket.user.activeRole === "rider") socket.join("riders");
    if (socket.user.roles?.driver) socket.join("drivers");

    // Rider creates ride request
    socket.on("rider_request_ride", async (payload, ack) => {
      try {
        if (socket.user.activeRole !== "rider") {
          return ack?.({ ok: false, message: "Only riders can request ride" });
        }

        const riderId = socket.user.id;
        const { pickup, destination } = payload;
        if (!pickup || !destination) {
          return ack?.({ ok: false, message: "pickup and destination required" });
        }

        const { distanceKm, durationMin } = await getRoute(pickup, destination);
        const fare = calculateFare(distanceKm, durationMin);

        const ride = await Ride.create({
          riderId,
          pickup: { type: "Point", coordinates: [pickup.lng, pickup.lat] },
          destination: { type: "Point", coordinates: [destination.lng, destination.lat] },
          distanceKm,
          durationMin,
          fare,
          status: "REQUESTED",
        });

        // find nearby drivers
        let nearbyDrivers = [];
        try {
          const { data } = await axios.get(
            `${DRIVER_SERVICE_URL}/drivers/nearby?lat=${pickup.lat}&lng=${pickup.lng}`
          );
          nearbyDrivers = data || [];
        } catch (err) {
          console.warn("Nearby driver lookup failed:", err.message);
        }

        // Broadcast only to drivers room (MVP), later filter by nearby driver rooms
        io.to("drivers").emit("ride_broadcast", {
          rideId: ride._id,
          pickup,
          destination,
          distanceKm,
          durationMin,
          fare,
          nearbyDrivers,
        });

        ack?.({
          ok: true,
          rideId: ride._id,
          fare,
          distanceKm,
          durationMin,
        });
      } catch (err) {
        console.error("rider_request_ride error:", err);
        ack?.({ ok: false, message: "Could not create ride" });
      }
    });

    // Driver joins ride room after accept (client emits this after HTTP accept)
    socket.on("join_ride_room", ({ rideId }, ack) => {
      if (!rideId) return ack?.({ ok: false, message: "rideId required" });
      socket.join(`ride_${rideId}`);
      ack?.({ ok: true });
    });

    socket.on("driver_location_update", ({ rideId, lat, lng }) => {
      if (!rideId) return;
      io.to(`ride_${rideId}`).emit("driver_location_update", {
        driverId: socket.user.id,
        lat,
        lng,
      });
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected:", socket.id);
    });
  });

  return io;
}

module.exports = setupSockets;
