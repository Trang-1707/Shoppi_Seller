// src/features/voucher/voucherSellerSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:9999/api";

// Áp dụng voucher của seller (theo shop)
export const applySellerVoucher = createAsyncThunk(
  "voucher/applySellerVoucher",
  async ({ code, productId }, { rejectWithValue, getState }) => {
    try {
      const { token } = getState().auth;

      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      const response = await axios.get(
        `${API_URL}/buyers/vouchers-seller/code/${code}?productId=${productId}`,
        config
      );

      toast.success("Áp dụng voucher shop thành công!");
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

const voucherSellerSlice = createSlice({
  name: "voucherSeller",
  initialState: {
    sellerVoucher: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearSellerVoucher: (state) => {
      state.sellerVoucher = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(applySellerVoucher.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(applySellerVoucher.fulfilled, (state, action) => {
        state.loading = false;
        state.sellerVoucher = action.payload;
      })
      .addCase(applySellerVoucher.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.sellerVoucher = null;
      });
  },
});

export const { clearSellerVoucher } = voucherSellerSlice.actions;
export default voucherSellerSlice.reducer;
