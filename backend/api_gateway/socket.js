const { Server } = require("socket.io");
const axios = require("axios");
const urls = require("./utils/serviceUrls");

module.exports = function setupSocket(httpServer) {
  console.log(">>> socket.js loaded");

  const io = new Server(httpServer, {
    cors: {
      origin: [
        "http://localhost:5173", "https://localhost:5173",
        "http://localhost:5174", "https://localhost:5174",
        "http://localhost:5175", "https://localhost:5175"
      ],
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
    console.log(`🔥 Incoming socket connection: user_${socket.user.id} (${socket.user.activeRole})`);
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
        
        // 📢 Targeted broadcast to nearby drivers
        if (res.data.nearbyDrivers && Array.isArray(res.data.nearbyDrivers)) {
          console.log(`📡 Broadcasting ride ${res.data.rideId} to ${res.data.nearbyDrivers.length} nearby drivers`);
          res.data.nearbyDrivers.forEach(driverId => {
            io.to(`user_${driverId}`).emit("ride.created", res.data);
          });
        } else {
          console.log(`⚠️ No nearby drivers found for ride ${res.data.rideId}`);
        }

        ack?.(res.data);
      } catch (e) {
        console.error(
          "createRide error:",
          e.response?.status,
          e.response?.data,
        );
        ack?.({ error: true });
      }
    });

    socket.on("acceptRide", async ({ rideId }, ack) => {
      try {
        const { data } = await axios.post(
          `${urls.ride}/${rideId}/accept`,
          {},
          { headers: { Authorization: `Bearer ${socket.token}` } },
        );

        // Join driver to ride room
        socket.join(`ride_${rideId}`);

        // Notify rider
        if (data.rideType === "POOL" && data.riders) {
           data.riders.forEach(r => {
             io.to(`user_${r.riderId}`).emit("ride.assigned", data);
           });
        } else {
           io.to(`user_${data.riderId}`).emit("ride.assigned", data);
        }
        
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
          { headers: { Authorization: `Bearer ${socket.token}` } },
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

    socket.on("driver.location", ({ rideId, lat, lng }) => {
      if (socket.user.activeRole !== "driver") return;

      io.to(`ride_${rideId}`).emit("driver.location", {
        driverId: socket.user.id,
        lat,
        lng,
      });
    });

    socket.on("driverStartRide", async ({ rideId, otp }, ack) => {
      try {
        const { data } = await axios.post(
          `${urls.ride}/${rideId}/start`,
          { otp },
          { headers: { Authorization: `Bearer ${socket.token}` } },
        );

        io.to(`ride_${rideId}`).emit("ride.updated", data);
        io.to(`user_${data.riderId}`).emit("ride.updated", data);
        io.to(`user_${data.driverId}`).emit("ride.updated", data);

        ack?.(data);
      } catch (e) {
        ack?.({ error: true });
      }
    });

    socket.on("driverCompleteRide", async ({ rideId, currentLocation, paymentMethod }, ack) => {
      try {
        const { data } = await axios.post(
          `${urls.ride}/${rideId}/complete`,
          { currentLocation, paymentMethod },
          { headers: { Authorization: `Bearer ${socket.token}` } },
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

    // Call Signaling
    socket.on("call_offer", ({ rideId, offer, meta }) => {
      socket.to(`ride_${rideId}`).emit("call_offer", { offer, meta });
    });

    socket.on("call_answer", ({ rideId, answer }) => {
      socket.to(`ride_${rideId}`).emit("call_answer", { answer });
    });

    socket.on("call_ice_candidate", ({ rideId, candidate }) => {
      socket.to(`ride_${rideId}`).emit("call_ice_candidate", { candidate });
    });

    socket.on("call_hangup", ({ rideId, from }) => {
      socket.to(`ride_${rideId}`).emit("call_hangup", { from });
    });


    socket.on("cancelRide", async ({ rideId }, ack) => {
      try {
        const isDriver = socket.user.activeRole === "driver";
        const endpoint = isDriver ? `${urls.ride}/${rideId}/cancel-driver` : `${urls.ride}/${rideId}/cancel`;

        const { data } = await axios.post(
          endpoint,
          {},
          { headers: { Authorization: `Bearer ${socket.token}` } },
        );

        // 🔥 Notify ALL participants
        io.to(`ride_${rideId}`).emit("ride.cancelled", { rideId, reason: isDriver ? "CANCELLED_BY_DRIVER" : "CANCELLED_BY_RIDER" });
        io.to(`user_${data.riderId}`).emit("ride.cancelled", { rideId });
        if (data.driverId) {
          io.to(`user_${data.driverId}`).emit("ride.cancelled", { rideId });
        }
        
        io.to(`ride_${rideId}`).emit("ride.updated", data);

        ack?.(data);
      } catch (e) {
        console.error("cancelRide error:", e.response?.data);
        ack?.({ error: true });
      }
    });

    socket.on("createPoolRide", async (payload, ack) => {
      try {
        const res = await axios.post(`${urls.ride}/pool/create`, payload, {
          headers: { Authorization: `Bearer ${socket.token}` },
        });

        const data = res.data;

        socket.join(`ride_${data._id}`);

        // 📢 Targeted broadcast to nearby drivers (discovery)

        if (data.nearbyDrivers && Array.isArray(data.nearbyDrivers)) {
          data.nearbyDrivers.forEach(driverId => {
            io.to(`user_${driverId}`).emit("ride.created", {
              ...data,
              rideId: data._id,
              rideType: "POOL"
            });
          });
        }

        io.to(`ride_${data._id}`).emit("pool.updated", data);

        ack?.(data);
      } catch (e) {
        console.error("createPoolRide error:", e.response?.data);
        ack?.({ error: true });
      }
    });

    socket.on("joinPoolRide", async ({ rideId, pickup, drop }, ack) => {
      try {
        const { data } = await axios.post(
          `${urls.ride}/pool/${rideId}/add`,
          { pickup, drop },
          {
            headers: { Authorization: `Bearer ${socket.token}` },
          },
        );

        // join ride room
        socket.join(`ride_${rideId}`);

        // 🔥 notify ALL users in ride room
        io.to(`ride_${rideId}`).emit("pool.updated", data);

        // If driver was assigned automatically, notify them specifically
        if (data.status === "DRIVER_ASSIGNED" && data.driverId) {
          io.to(`user_${data.driverId}`).emit("pool.assigned", data);
          // And notify riders again with the 'assigned' event for UI transition
          data.riders.forEach(r => {
             io.to(`user_${r.riderId}`).emit("pool.assigned", data);
          });
        }

        ack?.(data);
      } catch (e) {
        console.error("joinPoolRide error:", e.response?.data);
        ack?.({ error: true });
      }
    });

    socket.on("updatePoolStop", async ({ rideId, order, otp, paymentMethod }, ack) => {
      try {
        const { data } = await axios.post(
          `${urls.ride}/pool/update-stop`,
          { rideId, order, otp, paymentMethod },
          {
            headers: { Authorization: `Bearer ${socket.token}` },
          },
        );

        io.to(`ride_${rideId}`).emit("pool.updated", data);
        ack?.(data);
      } catch (e) {
        console.error("updatePoolStop error:", e.response?.data);
        ack?.({ error: true });
      }
    });

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
