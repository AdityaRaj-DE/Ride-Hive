import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axios";

export const completeRiderOnboarding = createAsyncThunk(
    "rider/onboard",
    async (payload: any, { rejectWithValue }) => {
      try {
        await api.post("/rider/profile", payload);
      } catch (err: any) {
        return rejectWithValue(
          err.response?.data?.message || "Onboarding failed"
        );
      }
    }
  );
  

  export const updateRiderProfile = createAsyncThunk(
    "rider/updateProfile",
    async (payload: any, { rejectWithValue }) => {
      try {
        await api.patch("/rider/profile", payload);
      } catch (err: any) {
        return rejectWithValue(
          err.response?.data?.message || "Profile update failed"
        );
      }
    }
  );
  