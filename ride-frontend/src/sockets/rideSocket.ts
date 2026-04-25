import { Socket } from "socket.io-client";
import { store } from "../store";
import { setRideFromServer, setRideError, updateRideStatus } from "../store/rideSlice";
import { setDriverLocation } from "../store/rideSlice";

let initialized = false;

export const initRideSocketListeners = (socket: Socket) => {
  if (initialized) return;
  initialized = true;

  const dispatchRide = (ride: any) => {
    const userId = store.getState().auth.user?.id;
    store.dispatch(setRideFromServer({ ride, userId }));
  };

  socket.on("ride.restore", (ride) => {
    console.log("ride.restore:", ride);
    dispatchRide(ride);
    if (ride?.rideId) {
      socket.emit("joinRide", { rideId: ride.rideId });
    }
  });

  socket.on("ride.assigned", (ride) => {
    console.log("ride.assigned:", ride);
    dispatchRide(ride);
    if (ride?.rideId) {
      socket.emit("joinRide", { rideId: ride.rideId });
    }
  });

  socket.on("ride.created", (data) => {
    console.log("ride.created event:", data);
    dispatchRide(data);
  });

  socket.on("ride.updated", (ride) => {
    console.log("ride.updated:", ride);
    dispatchRide(ride);
  });

  socket.on("ride.finishing", (data) => {
    console.log("ride.finishing signal status:", data?.status);
    store.dispatch(updateRideStatus(data?.status || "FINISHING"));
  });

  socket.on("ride.error", (err) => {
    console.error("ride.error:", err);
    store.dispatch(setRideError("Ride socket error"));
  });

  socket.on("driver.location", (data) => {
    console.log("driver.location:", data);

    store.dispatch(
      setDriverLocation({
        lat: data.lat,
        lng: data.lng,
      }),
    );
  });

  // Pooling events
  socket.on("pool.rider_added", (data) => {
    console.log("pool.rider_added:", data);
    dispatchRide(data);
  });

  socket.on("pool.assigned", (data) => {
    console.log("pool.assigned:", data);
    dispatchRide(data);
    const id = data.rideId || data._id;
    if (id) {
      socket.emit("joinRide", { rideId: id });
    }
  });

  socket.on("pool.updated", (data) => {
    console.log("pool.updated:", data);
    dispatchRide(data);
  });
};

// Emit wrapper — Rider creates ride via socket
export const emitCreateRide = (payload: {
  pickup: { lat: number; lng: number };
  drop: { lat: number; lng: number };
  passengers?: number;
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
    const userId = store.getState().auth.user?.id;
    store.dispatch(setRideFromServer({ ride: ack, userId }));

    if (ack?.rideId) {
      socket.emit("joinRide", { rideId: ack.rideId });
    }
  });
};

export const emitCreatePoolRide = (payload: {
  pickup: { lat: number; lng: number };
  drop: { lat: number; lng: number };
}) => {
  const socket = storeSocket();
  if (!socket) return;

  socket.emit("createPoolRide", payload, (ack: any) => {
    console.log("createPoolRide ack:", ack);

    if (ack?.error) {
      store.dispatch(setRideError("Failed to create pool ride"));
      return;
    }

    const userId = store.getState().auth.user?.id;
    store.dispatch(setRideFromServer({ ride: ack, userId }));

    const id = ack?.rideId || ack?._id;
    if (id) {
      socket.emit("joinRide", { rideId: id });
    }
  });
};

// Helper to safely get socket from client singleton
import { getSocket } from "./socketClient";
const storeSocket = () => getSocket();
