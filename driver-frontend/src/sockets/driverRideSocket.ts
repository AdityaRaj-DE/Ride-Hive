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
};

export const emitAcceptRide = (rideId: string) => {
  const socket = getDriverSocket();
  if (!socket) return;

  socket.emit("acceptRide", { rideId }, (ack: any) => {
    console.log("acceptRide ack:", ack);
  });
};

