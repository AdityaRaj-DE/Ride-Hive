import { createSlice,type PayloadAction } from "@reduxjs/toolkit";

interface DriverRideState {
  availableRides: any[];
  activeRide: any | null;
}

const initialState: DriverRideState = {
  availableRides: [],
  activeRide: null,
};

const driverRideSlice = createSlice({
  name: "driverRide",
  initialState,
  reducers: {
    setAvailableRides(state, action: PayloadAction<any[]>) {
      state.availableRides = action.payload;
    },

    addAvailableRide(state, action: PayloadAction<any>) {
      state.availableRides.unshift(action.payload);
    },

    setActiveRide(state, action: PayloadAction<any>) {
      state.activeRide = action.payload;
      state.availableRides = [];
    },

    clearActiveRide(state) {
      state.activeRide = null;
    },
  },
});

export const {
  setAvailableRides,
  addAvailableRide,
  setActiveRide,
  clearActiveRide,
} = driverRideSlice.actions;

export default driverRideSlice.reducer;
