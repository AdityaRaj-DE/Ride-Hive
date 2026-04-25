import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../../shared/store/slices/authSlice";
import driverRideReducer from "../../shared/store/slices/driverRideSlice";
import driverLocationReducer from "../../shared/store/slices/driverLocationSlice";
import walletReducer from "../../shared/store/slices/driverWalletSlice";
import driverReducer from "../../shared/store/slices/driverSlice" 

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
