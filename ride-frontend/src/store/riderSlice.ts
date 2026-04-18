import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axios";

interface RiderState {
  loading: boolean;
  error: string | null;
}

const initialState: RiderState = {
  loading: false,
  error: null,
};

export const completeRiderOnboarding = createAsyncThunk(
  "rider/onboard",
  async (payload: any, { rejectWithValue }) => {
    try {
      await api.post("/rider/onboard", payload);
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Onboarding failed"
      );
    }
  }
);

export const updateRiderProfile = createAsyncThunk(
  "rider/profile/update",
  async (payload: any, { rejectWithValue }) => {
    try {
      await api.post("/rider/profile", payload);
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Profile update failed"
      );
    }
  }
);

const riderSlice = createSlice({
  name: "rider",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(completeRiderOnboarding.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(completeRiderOnboarding.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(completeRiderOnboarding.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateRiderProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateRiderProfile.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateRiderProfile.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default riderSlice.reducer;
