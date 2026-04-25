import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

interface DriverWalletState {
  walletBalance: number;
  subscription: any;
  loading: boolean;
  error: string | null;
}

const initialState: DriverWalletState = {
  walletBalance: 0,
  subscription: null,
  loading: false,
  error: null,
};

export const fetchWallet = createAsyncThunk(
  "driver/wallet/fetchWallet",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/driver/wallet");
      return data;
    } catch {
      return rejectWithValue("Wallet fetch failed");
    }
  }
);

export const addFunds = createAsyncThunk(
  "driver/wallet/addFunds",
  async (amount: number, { rejectWithValue }) => {
    try {
      const { data } = await api.post(
        "/driver/wallet/add-funds",
        { amount }
      );
      return data;
    } catch {
      return rejectWithValue("Add funds failed");
    }
  }
);

export const subscribePlan = createAsyncThunk(
  "driver/wallet/subscribePlan",
  async (planName: string, { rejectWithValue }) => {
    try {
      const { data } = await api.post(
        "/driver/subscription/subscribe",
        { planName }
      );
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Subscribe failed");
    }
  }
);

const walletSlice = createSlice({
  name: "driverWallet",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWallet.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchWallet.fulfilled, (state, action) => {
        state.loading = false;
        state.walletBalance = action.payload.walletBalance;
        state.subscription = action.payload.subscription;
      })
      .addCase(fetchWallet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(addFunds.fulfilled, (state, action) => {
        state.walletBalance = action.payload.walletBalance;
      })
      .addCase(subscribePlan.fulfilled, (state, action) => {
        state.walletBalance = action.payload.walletBalance;
        state.subscription = action.payload.subscription;
      });
  },
});

export default walletSlice.reducer;
