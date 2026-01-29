function setupSockets(io) {
  io.on("connection", (socket) => {
    if (!socket.user?.id) return socket.disconnect();

    console.log("✅ Socket:", socket.user.id);

    // personal room
    socket.join(`user_${socket.user.id}`);

    // role rooms
    if (socket.user.activeRole === "rider") socket.join("riders");
    if (socket.user.activeRole === "driver") socket.join("drivers");

    // join ride room after HTTP accept
    socket.on("joinRide", ({ rideId }) => {
      if (!rideId) return;
      socket.join(`ride_${rideId}`);
    });

    // realtime driver movement
    socket.on("driverLocation", ({ rideId, lat, lng }) => {
      if (!rideId) return;

      io.to(`ride_${rideId}`).emit("driverLocation", {
        driverId: socket.user.id,
        lat,
        lng,
      });
    });

    socket.on("disconnect", () => {
      console.log("❌ Disconnect:", socket.user.id);
    });
  });
}

module.exports = setupSockets;
