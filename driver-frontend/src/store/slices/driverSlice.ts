import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

interface DriverState {
  profile: any | null;
  loading: boolean;
  error: string | null;
}

const initialState: DriverState = {
  profile: null,
  loading: false,
  error: null,
};

// onboarding steps
export const onboardBasic = createAsyncThunk(
  "driver/onboardBasic",
  async (payload: any, { rejectWithValue }) => {
    try {
      return (await api.post("/driver/onboard/basic", payload)).data;
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message);
    }
  }
);

export const onboardVehicle = createAsyncThunk(
  "driver/onboardVehicle",
  async (payload: any, { rejectWithValue }) => {
    try {
      return (await api.post("/driver/onboard/vehicle", payload)).data;
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message);
    }
  }
);

export const onboardDocuments = createAsyncThunk(
  "driver/onboardDocuments",
  async (payload: any, { rejectWithValue }) => {
    try {
      return (await api.post("/driver/onboard/documents", payload)).data;
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message);
    }
  }
);

// driver self profile
export const fetchDriverProfile = createAsyncThunk(
  "driver/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      return (await api.get("/driver/me")).data;
    } catch {
      return rejectWithValue("Failed to fetch driver");
    }
  }
);

// toggle availability
export const toggleAvailability = createAsyncThunk(
  "driver/toggleAvailability",
  async (isAvailable: boolean, { rejectWithValue }) => {
    try {
      return (await api.put("/driver/availability", { isAvailable })).data;
    } catch (e: any) {
      // Return both message and status code for the UI to handle
      return rejectWithValue({
        message: e.response?.data?.message || "Failed to update availability",
        code: e.response?.data?.code || "ERROR",
      });
    }
  }
);

const driverSlice = createSlice({
  name: "driver",
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addMatcher(
        (a) => a.type.startsWith("driver/") && a.type.endsWith("/pending"),
        (s) => {
          s.loading = true;
          s.error = null;
        }
      )
      .addMatcher(
        (a): a is any => a.type.startsWith("driver/") && a.type.endsWith("/fulfilled"),
        (s, a) => {
          s.loading = false;
          if (a.type === "driver/fetchProfile/fulfilled" || a.type === "driver/toggleAvailability/fulfilled") {
            s.profile = (a.payload as any).driver || a.payload;
          }
        }
      )
      .addMatcher(
        (a): a is any => a.type.startsWith("driver/") && a.type.endsWith("/rejected"),
        (s, a) => {
          s.loading = false;
          s.error = (a.payload as any)?.message || a.payload;
        }
      );
  },
});

export default driverSlice.reducer;
