import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { timeEntriesApi } from '../../services/timeEntriesApi';

const initialState = {
  activeTimer: null,
  entries: [],
  isLoading: false,
  error: null,
};

// Запустить таймер
export const startTimer = createAsyncThunk(
  'timeEntries/start',
  async (taskId: string) => {
    const response = await timeEntriesApi.start(taskId);
    return response.data;
  }
);

// Остановить таймер
export const stopTimer = createAsyncThunk(
  'timeEntries/stop',
  async () => {
    const response = await timeEntriesApi.stop();
    return response.data;
  }
);

// Получить активный таймер
export const fetchActiveTimer = createAsyncThunk(
  'timeEntries/fetchActive',
  async () => {
    const response = await timeEntriesApi.getActive();
    return response.data;
  }
);

// Получить записи по задаче
export const fetchTimeEntriesByTask = createAsyncThunk(
  'timeEntries/fetchByTask',
  async (taskId: string) => {
    const response = await timeEntriesApi.getByTask(taskId);
    return { taskId, entries: response.data };
  }
);

const timeEntriesSlice = createSlice({
  name: 'timeEntries',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Start timer
      .addCase(startTimer.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(startTimer.fulfilled, (state, action) => {
        state.isLoading = false;
        state.activeTimer = action.payload;
      })
      .addCase(startTimer.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to start timer';
      })
      // Stop timer
      .addCase(stopTimer.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(stopTimer.fulfilled, (state, action) => {
        state.isLoading = false;
        state.activeTimer = null;
        state.entries = [action.payload, ...state.entries];
      })
      .addCase(stopTimer.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to stop timer';
      })
      // Fetch active timer
      .addCase(fetchActiveTimer.fulfilled, (state, action) => {
        state.activeTimer = action.payload;
      })
      // Fetch entries by task
      .addCase(fetchTimeEntriesByTask.fulfilled, (state, action) => {
        state.entries = action.payload.entries;
      });
  },
});

export const { clearError } = timeEntriesSlice.actions;
export default timeEntriesSlice.reducer;