import { Socket } from "socket.io-client";
import { store } from "../store";
import { setRideFromServer, setRideError } from "../store/rideSlice";
import { setDriverLocation } from "../store/rideSlice";

let initialized = false;

export const initRideSocketListeners = (socket: Socket) => {
  if (initialized) return;
  initialized = true;

  socket.on("ride.restore", (ride) => {
    console.log("ride.restore:", ride);
    store.dispatch(setRideFromServer(ride));
    if (ride?._id) {
      socket.emit("joinRide", { rideId: ride._id });
    }
  });

  socket.on("ride.assigned", (ride) => {
    console.log("ride.assigned:", ride);
    store.dispatch(setRideFromServer(ride));
    if (ride?._id || ride?.rideId) {
      const rideId = ride._id || ride.rideId;
      socket.emit("joinRide", { rideId });
    }
  });

  socket.on("ride.created", (data) => {
    console.log("ride.created event:", data);
    // Usually drivers care, but normalize anyway if received
    store.dispatch(setRideFromServer(data));
  });

  socket.on("ride.updated", (ride) => {
    console.log("ride.updated:", ride);
    console.log("RIDER RECEIVED ride.updated", ride.status);
    store.dispatch(setRideFromServer(ride));
  });
  

  socket.on("ride.error", (err) => {
    console.error("ride.error:", err);
    store.dispatch(setRideError("Ride socket error"));
  });

socket.on("ride.otp", (data) => {
  console.log("ride.otp:", data);

  store.dispatch(
    setRideFromServer({
      rideStartOtp: {
        code: data.otp,
      },
    })
  );
});

socket.on("driver.location", (data) => {
  console.log("driver.location:", data);

  store.dispatch(
    setDriverLocation({
      lat: data.lat,
      lng: data.lng,
    })
  );
});
  
};

// Emit wrapper — Rider creates ride via socket
export const emitCreateRide = (payload: {
  pickup: { lat: number; lng: number };
  drop: { lat: number; lng: number };
}) => {
  const socket = storeSocket();
  if (!socket) return;

  socket.emit("createRide", payload, (ack: any) => {
    console.log("createRide ack:", ack);

    if (ack?.error) {
      store.dispatch(setRideError("Failed to create ride"));
      return;
    }

    // Ack might be partial
    store.dispatch(setRideFromServer(ack));

    if (ack?.rideId) {
      socket.emit("joinRide", { rideId: ack.rideId });
    }
  });
};



// Helper to safely get socket from client singleton
import { getSocket } from "./socketClient";
const storeSocket = () => getSocket();
