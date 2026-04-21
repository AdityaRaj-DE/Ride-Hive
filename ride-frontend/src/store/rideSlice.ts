import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type LatLng = { lat: number; lng: number };

export interface RideState {
  rideId: string | null;
  status: string | null;

  pickup: LatLng | null;
  drop: LatLng | null;

  rideType: "NORMAL" | "POOL" | null;
  riders: any[] | null;

  driverId: string | null;
  driver: any | null;

  driverLocation: LatLng | null;

  rideStartOtp: { code: string } | null;

  distance: number | null;
  duration: number | null;
  price: number | null;
  finalPrice: number | null;
  paymentMethod: string | null;
  geometry: any | null;

  loading: boolean;
  error: string | null;
}

const initialState: RideState = {
  rideId: null,
  status: null,

  pickup: null,
  drop: null,

  rideType: null,
  riders: null,

  driverId: null,
  driver: null,

  driverLocation: null,

  rideStartOtp: null,

  distance: null,
  duration: null,
  price: null,
  finalPrice: null,
  paymentMethod: null,
  geometry: null,

  loading: false,
  error: null,
};

// Payload can be either:
// 1) Full ride (from ride.restore / ride.assigned)
// 2) Partial ack { rideId, status }
type RideServerPayload = any;

function normalizeRide(payload: RideServerPayload, userId?: string | null) {
  const rideId = payload._id || payload.rideId || null;
  const status = payload.status || null;

  let pickup: LatLng | null = null;
  let drop: LatLng | null = null;

  // 1. Try top-level (Normal Ride)
  if (payload.pickup?.coordinates) {
    pickup = { lng: payload.pickup.coordinates[0], lat: payload.pickup.coordinates[1] };
  } else if (payload.pickup?.lat && payload.pickup?.lng) {
    pickup = payload.pickup;
  }

  if (payload.drop?.coordinates) {
    drop = { lng: payload.drop.coordinates[0], lat: payload.drop.coordinates[1] };
  } else if (payload.drop?.lat && payload.drop?.lng) {
    drop = payload.drop;
  }

  // 2. Try Pool Riders array (Pool Ride - find self)
  if (payload.rideType === "POOL" && payload.riders && userId) {
    const me = payload.riders.find((r: any) => r.riderId === userId);
    if (me) {
      if (me.pickup?.coordinates) {
        pickup = { lng: me.pickup.coordinates[0], lat: me.pickup.coordinates[1] };
      }
      if (me.drop?.coordinates) {
        drop = { lng: me.drop.coordinates[0], lat: me.drop.coordinates[1] };
      }
      if (me.otp) {
        payload.rideStartOtp = { code: me.otp };
      }
    }
  }

  return {
    rideId,
    status,
    pickup,
    drop,
    rideType: payload.rideType || "NORMAL",
    riders: payload.riders || null,
    driverId: payload.driverId || null,
    driver: payload.driver || null,
    rideStartOtp: payload.rideStartOtp || null,
    finalPrice: payload.finalPrice || null,
    paymentMethod: payload.paymentMethod || null,
  };
}

const rideSlice = createSlice({
  name: "ride",
  initialState,
  reducers: {
    setRideFromServer(state, action) {
      // payload can be { ride, userId } or just ride
      const payload = action.payload.ride || action.payload;
      const userId = action.payload.userId || null;
      
      const normalized = normalizeRide(payload, userId);

      state.rideId = normalized.rideId ?? state.rideId;

      if (normalized.status) {
        state.status = normalized.status;
      }

      state.pickup = normalized.pickup ?? state.pickup;
      state.drop = normalized.drop ?? state.drop;

      state.rideType = normalized.rideType ?? state.rideType;
      state.riders = normalized.riders ?? state.riders;

      state.driverId = normalized.driverId ?? state.driverId;
      state.driver = normalized.driver ?? state.driver;
      state.rideStartOtp = normalized.rideStartOtp ?? state.rideStartOtp;
      state.finalPrice = normalized.finalPrice ?? state.finalPrice;
      state.paymentMethod = normalized.paymentMethod ?? state.paymentMethod;
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
    setEstimate(state, action) {
      const { distance, duration, price, geometry } = action.payload;

      state.distance = distance;
      state.duration = duration;
      state.price = price;
      state.geometry = geometry;
    },
    setDriverLocation(state, action: PayloadAction<LatLng>) {
      state.driverLocation = action.payload;
    },
  },
});

export const {
  setRideFromServer,
  updateRideStatus,
  clearRide,
  setRideLoading,
  setRideError,
  setEstimate,
  setDriverLocation,
} = rideSlice.actions;

export default rideSlice.reducer;
