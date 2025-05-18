import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from '../../services/api';

// Async thunk to fetch standards and divisions
export const fetchStandardsAndDivisions = createAsyncThunk(
  "standardDivision/fetchStandardsAndDivisions",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/standards-divisions"); // Replace with your API endpoint
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to fetch standards and divisions.");
    }
  }
);

const standardDivisionSlice = createSlice({
  name: "standardDivision",
  initialState: {
    standards: [],
    divisions: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStandardsAndDivisions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStandardsAndDivisions.fulfilled, (state, action) => {
        state.loading = false;
        state.standards = action.payload.standards || [];
        state.divisions = action.payload.divisions || [];
      })
      .addCase(fetchStandardsAndDivisions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch standards and divisions.";
      });
  },
});

export default standardDivisionSlice.reducer;