import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import rideReducer from "./rideSlice";
import riderReducer from './riderSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ride: rideReducer,
    rider: riderReducer, 
  },
});

// 👉 Correct export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
