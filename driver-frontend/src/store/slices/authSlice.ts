import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

interface User {
  id: string;
  mobileNumber: string;
  onboarding: {
    rider: boolean;
    driver: boolean;
  };
  roles: {
    rider: boolean;
    driver: boolean;
  };
  activeRole: "rider" | "driver";
  isVerified: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  otpSent: boolean;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem("token"),
  loading: false,
  error: null,
  otpSent: false,
};

// 1️⃣ Send OTP
export const sendOtp = createAsyncThunk(
  "auth/sendOtp",
  async (mobile: string, { rejectWithValue }) => {
    try {
      await api.post("/auth/otp/send", { mobileNumber: mobile });
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "OTP send failed");
    }
  }
);

// 2️⃣ Verify OTP
export const verifyOtp = createAsyncThunk(
  "auth/verifyOtp",
  async (
    { mobile, otp }: { mobile: string; otp: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await api.post("/auth/otp/verify", {
        mobileNumber: mobile,
        otp,
        deviceId: "web",
      });

      return res.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "OTP verification failed"
      );
    }
  }
);

// 3️⃣ Activate Role (driver / rider)
export const activateRole = createAsyncThunk(
  "auth/activateRole",
  async (role: "driver" | "rider", { rejectWithValue }) => {
    try {
      const res = await api.post("/auth/role/activate", { role });
      return res.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Role activation failed"
      );
    }
  }
);

// 4️⃣ Fetch current user
export const fetchMe = createAsyncThunk(
  "auth/fetchMe",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/auth/me");
      return res.data;
    } catch {
      return rejectWithValue("Session expired");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.otpSent = false;
      localStorage.removeItem("token");
    },
  },
  extraReducers: (builder) => {
    builder
      // Send OTP
      .addCase(sendOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendOtp.fulfilled, (state) => {
        state.loading = false;
        state.otpSent = true;
      })
      .addCase(sendOtp.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Verify OTP
      .addCase(verifyOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.accessToken;
        state.otpSent = false;
        localStorage.setItem("token", action.payload.accessToken);
      })
      .addCase(verifyOtp.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Me
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(fetchMe.rejected, (state) => {
        state.user = null;
        state.token = null;
        localStorage.removeItem("token");
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
