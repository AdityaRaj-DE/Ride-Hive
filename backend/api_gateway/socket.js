const { Server } = require("socket.io");
const axios = require("axios");
const urls = require("./utils/serviceUrls");

module.exports = function setupSocket(httpServer) {

  const io = new Server(httpServer, {
    cors: {
      origin: ["http://localhost:5173"],
      credentials: true,
    },
  });

  // socket auth
  io.use(async (socket, next) => {
    console.log("Auth handshake received");
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error("No token"));

      const { data } = await axios.get(`${urls.auth}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      socket.user = data;
      socket.token = token;

      next();
    } catch {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", async socket => {
    console.log("🔥 Incoming socket connection");
    socket.join(`user_${socket.user.id}`);

    if (socket.user.activeRole === "rider") socket.join("riders");
    if (socket.user.activeRole === "driver") socket.join("drivers");

    // reconnect restore
    try {
      const { data } = await axios.get(`${urls.ride}/rides/active`, {
        headers: { Authorization: `Bearer ${socket.token}` },
      });

      if (data) {
        socket.join(`ride_${data._id}`);
        socket.emit("ride.restore", data);
      }
    } catch {}

    // rider creates ride
    socket.on("createRide", async (payload, ack) => {
      try {
        console.log("🔥 createRide received:", payload);
    
        const res = await axios.post(`${urls.ride}/rides`, payload, {
          headers: { Authorization: `Bearer ${socket.token}` },
        });
    
        console.log("Ride service response:", res.data);
    
        io.to("drivers").emit("ride.created", res.data);
    
        ack?.(res.data);
      } catch (e) {
        console.error("❌ createRide error:", e.response?.data || e.message);
        ack?.({ error: true });
      }
    });
    

    socket.on("acceptRide", async ({ rideId }, ack) => {
      const res = await axios.post(`${urls.ride}/rides/${rideId}/accept`, {}, {
        headers: { Authorization: `Bearer ${socket.token}` },
      });

      ack?.(res.data);
    });

    socket.on("joinRide", ({ rideId }) => socket.join(`ride_${rideId}`));

  });

  return io;
};
