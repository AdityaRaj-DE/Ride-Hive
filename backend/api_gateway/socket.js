const { Server } = require("socket.io");
const axios = require("axios");
const urls = require("./utils/serviceUrls");

module.exports = function setupSocket(httpServer) {
  console.log(">>> socket.js loaded");

  const io = new Server(httpServer, {
    cors: {
      origin: ["https://localhost:5173", "https://localhost:5174"],
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

      socket.user = {
        id: data.id,
        roles: data.roles,
        activeRole: data.activeRole,
        onboarding: data.onboarding,
      };

      socket.token = token;

      next();
    } catch {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    console.log("🔥 Incoming socket connection");
    socket.join(`user_${socket.user.id}`);

    if (socket.user.activeRole === "rider") socket.join("riders");
    if (socket.user.activeRole === "driver") socket.join("drivers");

    // rider creates ride
    socket.on("createRide", async (payload, ack) => {
      try {
        console.log("🔥 createRide received:", payload);

        const res = await axios.post(`${urls.ride}`, payload, {
          headers: { Authorization: `Bearer ${socket.token}` },
        });

        console.log("Ride service response:", res.data);

        io.to("drivers").emit("ride.created", res.data);

        ack?.(res.data);
      } catch (e) {
        console.error(
          "createRide error:",
          e.response?.status,
          e.response?.data
        );
        ack?.({ error: true });
      }
    });

    socket.on("acceptRide", async ({ rideId }, ack) => {
      try {
        const { data } = await axios.post(
          `${urls.ride}/${rideId}/accept`,
          {},
          { headers: { Authorization: `Bearer ${socket.token}` } }
        );

        // Join driver to ride room
        socket.join(`ride_${rideId}`);

        // Notify rider
        io.to(`user_${data.riderId}`).emit("ride.assigned", data);

        // Notify driver (optional but consistent)
        io.to(`user_${data.driverId}`).emit("ride.assigned", data);

        ack?.(data);
      } catch (e) {
        console.error("acceptRide error:", e.response?.data);
        ack?.({ error: true });
      }
    });

    socket.on("driverArriving", async ({ rideId }, ack) => {
      try {
        const { data } = await axios.post(
          `${urls.ride}/${rideId}/arriving`,
          {},
          { headers: { Authorization: `Bearer ${socket.token}` } }
        );

        io.to(`ride_${rideId}`).emit("ride.updated", data);
        io.to(`user_${data.riderId}`).emit("ride.updated", data);
        io.to(`user_${data.driverId}`).emit("ride.updated", data);
        console.log("EMITTING ride.updated", data.status);

        ack?.(data);
      } catch (e) {
        ack?.({ error: true });
      }
    });

    socket.on("driverStartRide", async ({ rideId }, ack) => {
      try {
        const { data } = await axios.post(
          `${urls.ride}/${rideId}/start`,
          {},
          { headers: { Authorization: `Bearer ${socket.token}` } }
        );

        io.to(`ride_${rideId}`).emit("ride.updated", data);
        io.to(`user_${data.riderId}`).emit("ride.updated", data);
        io.to(`user_${data.driverId}`).emit("ride.updated", data);
        console.log("EMITTING ride.updated", data.status);

        ack?.(data);
      } catch (e) {
        ack?.({ error: true });
      }
    });

    socket.on("driverCompleteRide", async ({ rideId }, ack) => {
      try {
        const { data } = await axios.post(
          `${urls.ride}/${rideId}/complete`,
          { finalPrice: 200 },
          { headers: { Authorization: `Bearer ${socket.token}` } }
        );

        io.to(`ride_${rideId}`).emit("ride.updated", data);
        io.to(`user_${data.riderId}`).emit("ride.updated", data);
        io.to(`user_${data.driverId}`).emit("ride.updated", data);
        console.log("EMITTING ride.updated", data.status);

        ack?.(data);
      } catch (e) {
        ack?.({ error: true });
      }
    });

    socket.on("joinRide", ({ rideId }) => socket.join(`ride_${rideId}`));

    socket.onAny((event, data) => {
      console.log("GATEWAY EVENT:", event, data);
    });

    (async () => {
      try {
        const { data } = await axios.get(`${urls.ride}/active`, {
          headers: { Authorization: `Bearer ${socket.token}` },
        });

        if (data) {
          socket.join(`ride_${data._id}`);
          socket.emit("ride.restore", data);
        }
      } catch {}
    })();
  });

  return io;
};
