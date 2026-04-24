import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { reportsApi } from '../../services/reportsApi';

const initialState = {
  timeByProjects: [],
  isLoading: false,
  error: null,
};

// Получить время по проектам
export const fetchTimeByProjects = createAsyncThunk(
  'reports/timeByProjects',
  async ({ startDate, endDate }: { startDate: string; endDate: string }) => {
    const response = await reportsApi.getTimeByProjects(startDate, endDate);
    return response.data;
  }
);

const reportsSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTimeByProjects.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTimeByProjects.fulfilled, (state, action) => {
        state.isLoading = false;
        state.timeByProjects = action.payload;
      })
      .addCase(fetchTimeByProjects.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch projects report';
      });
  },
});

export default reportsSlice.reducer;