import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { tasksApi, type Task, type CreateTaskData } from '../../services/tasksApi';

interface TasksState {
  items: Task[];
  isLoading: boolean;
  error: string | null;
}

const initialState: TasksState = {
  items: [],
  isLoading: false,
  error: null,
};

// Получить все задачи
export const fetchTasks = createAsyncThunk(
  'tasks/fetchAll',
  async (filters?: { project?: string; status?: string; priority?: string }) => {
    const response = await tasksApi.getAll(filters);
    return response.data;
  }
);

// Создать задачу
export const createTask = createAsyncThunk(
  'tasks/create',
  async (data: CreateTaskData) => {
    const response = await tasksApi.create(data);
    return response.data;
  }
);

// Обновить задачу
export const updateTask = createAsyncThunk(
  'tasks/update',
  async ({ id, data }: { id: string; data: Partial<CreateTaskData> }) => {
    const response = await tasksApi.update(id, data);
    return response.data;
  }
);

// Удалить задачу
export const deleteTask = createAsyncThunk(
  'tasks/delete',
  async (id: string) => {
    await tasksApi.delete(id);
    return id;
  }
);

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchTasks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch tasks';
      })
      // Create
      .addCase(createTask.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      // Update
      .addCase(updateTask.fulfilled, (state, action) => {
        const index = state.items.findIndex(t => t._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      // Delete
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.items = state.items.filter(t => t._id !== action.payload);
      });
  },
});

export default tasksSlice.reducer;