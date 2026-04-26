import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import driverRideReducer from "./slices/driverRideSlice";
import driverLocationReducer from "./slices/driverLocationSlice";
import walletReducer from "./slices/driverWalletSlice";
import driverReducer from "./slices/driverSlice" 

export const store = configureStore({
  reducer: {
    auth: authReducer,
    driver: driverReducer,
    driverRide: driverRideReducer,
    driverLocation: driverLocationReducer,
    driverWallet: walletReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
