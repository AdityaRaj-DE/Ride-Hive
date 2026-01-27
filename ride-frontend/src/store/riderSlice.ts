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
      });
  },
});

export default riderSlice.reducer;
