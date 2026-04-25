import { Socket } from "socket.io-client";
import { store } from "../store";
import { getDriverSocket } from "./socketClient";

import {
  addAvailableRide,
  setActiveRide,
} from "../store/slices/driverRideSlice";

let initialized = false;

export const initDriverRideListeners = (socket: Socket) => {
  if (initialized) return;
  initialized = true;

  socket.on("ride.created", (ride) => {
    console.log("Driver received ride.created:", ride);
    store.dispatch(addAvailableRide(ride));
  });

  socket.on("ride.assigned", (ride) => {
    console.log("Driver ride.assigned:", ride);
    store.dispatch(setActiveRide(ride));
  });

  socket.on("ride.restore", (ride) => {
    console.log("Driver ride.restore:", ride);
    store.dispatch(setActiveRide(ride));
  });

  // ⭐ driver location updates
  socket.on("driver.location", (data) => {
    console.log("Driver location broadcast:", data);
  });

  socket.on("pool.assigned", (ride) => {
    console.log("Driver pool.assigned:", ride);
    store.dispatch(setActiveRide(ride));
  });

  socket.on("pool.updated", (ride) => {
    console.log("Driver pool.updated:", ride);
    store.dispatch(setActiveRide(ride));
  });
  
  socket.on("pool.rider_added", (ride) => {
    console.log("Driver pool.rider_added:", ride);
    store.dispatch(setActiveRide(ride));
  });

  socket.on("ride.updated", (ride: any) => {
    console.log("Driver ride.updated:", ride);
    store.dispatch(setActiveRide(ride));
  });
};

export const emitAcceptRide = (rideId: string) => {
  const socket = getDriverSocket();
  if (!socket) return;

  socket.emit("acceptRide", { rideId }, (ack: any) => {
    console.log("acceptRide ack:", ack);

    if (!ack?.error) {
      store.dispatch(setActiveRide(ack));
      startDriverLocationTracking(rideId); // ⭐ start GPS tracking
    }
  });
};

export const emitDriverArriving = (rideId: string) => {
  const socket = getDriverSocket();
  if (!socket) return;

  socket.emit("driverArriving", { rideId }, (ack: any) => {
    console.log("driverArriving ack:", ack);
  });
};

export const emitStartRide = (rideId: string, otp: string) => {
  const socket = getDriverSocket();
  if (!socket) return;

  socket.emit("driverStartRide", { rideId, otp }, (ack: any) => {
    console.log("startRide ack:", ack);
  });
}

export const emitCompleteRide = (
  rideId: string, 
  currentLocation: { lat: number, lng: number }, 
  paymentMethod: string,
  callback?: (ack: any) => void
) => {
  const socket = getDriverSocket();
  if (!socket) return;

  socket.emit("driverCompleteRide", { rideId, currentLocation, paymentMethod }, (ack: any) => {
    console.log("completeRide ack:", ack);
    if (callback) callback(ack);
  });
};

export const emitCancelRide = (rideId: string) => {
  const socket = getDriverSocket();
  if (!socket) return;

  socket.emit("cancelRide", { rideId }, (ack: any) => {
    console.log("cancelRide ack:", ack);
  });
};

export const startDriverLocationTracking = (rideId: string) => {
  const socket = getDriverSocket();
  if (!socket) return;

  navigator.geolocation.watchPosition((pos) => {

    socket.emit("driver.location", {
      rideId,
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
    });

  });
};

export const emitUpdatePoolStop = (rideId: string, order: number, otp?: string, paymentMethod?: string) => {
  const socket = getDriverSocket();
  if (!socket) return;

  socket.emit("updatePoolStop", { rideId, order, otp, paymentMethod }, (ack: any) => {
    console.log("updatePoolStop ack:", ack);
  });
};