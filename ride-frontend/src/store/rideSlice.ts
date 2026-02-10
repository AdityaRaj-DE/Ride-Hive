import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type LatLng = { lat: number; lng: number };

export interface RideState {
  rideId: string | null;
  status: string | null;
  pickup: LatLng | null;
  drop: LatLng | null;
  driverId: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: RideState = {
  rideId: null,
  status: null,
  pickup: null,
  drop: null,
  driverId: null,
  loading: false,
  error: null,
};

// Payload can be either:
// 1) Full ride (from ride.restore / ride.assigned)
// 2) Partial ack { rideId, status }
type RideServerPayload = any;

function normalizeRide(payload: RideServerPayload) {
  const rideId = payload._id || payload.rideId || null;
  const status = payload.status || null;

  let pickup: LatLng | null = null;
  let drop: LatLng | null = null;

  if (payload.pickup?.coordinates) {
    pickup = {
      lng: payload.pickup.coordinates[0],
      lat: payload.pickup.coordinates[1],
    };
  } else if (payload.pickup?.lat && payload.pickup?.lng) {
    pickup = payload.pickup;
  }

  if (payload.drop?.coordinates) {
    drop = {
      lng: payload.drop.coordinates[0],
      lat: payload.drop.coordinates[1],
    };
  } else if (payload.drop?.lat && payload.drop?.lng) {
    drop = payload.drop;
  }

  const driverId = payload.driverId || null;

  return { rideId, status, pickup, drop, driverId };
}

const rideSlice = createSlice({
  name: "ride",
  initialState,
  reducers: {
    setRideFromServer(state, action: PayloadAction<RideServerPayload>) {
      const normalized = normalizeRide(action.payload);
      state.rideId = normalized.rideId;
      state.status = normalized.status;
      state.pickup = normalized.pickup ?? state.pickup;
      state.drop = normalized.drop ?? state.drop;
      state.driverId = normalized.driverId;
      state.loading = false;
      state.error = null;
    },

    updateRideStatus(state, action: PayloadAction<string>) {
      state.status = action.payload;
    },

    clearRide(state) {
      state.rideId = null;
      state.status = null;
      state.pickup = null;
      state.drop = null;
      state.driverId = null;
      state.loading = false;
      state.error = null;
    },

    setRideLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },

    setRideError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
  },
});

export const {
  setRideFromServer,
  updateRideStatus,
  clearRide,
  setRideLoading,
  setRideError,
} = rideSlice.actions;

export default rideSlice.reducer;
