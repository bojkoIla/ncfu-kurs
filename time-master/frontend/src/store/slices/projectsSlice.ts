import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { projectsApi, type Project } from '../../services/projectsApi';

interface ProjectsState {
  items: Project[];
  isLoading: boolean;
  error: string | null;
}

const initialState: ProjectsState = {
  items: [],
  isLoading: false,
  error: null,
};

// Получить все проекты
export const fetchProjects = createAsyncThunk(
  'projects/fetchAll',
  async () => {
    const response = await projectsApi.getAll();
    return response.data;
  }
);

// Создать проект
export const createProject = createAsyncThunk(
  'projects/create',
  async (data: { name: string; description?: string; color?: string }) => {
    const response = await projectsApi.create(data);
    return response.data;
  }
);

// Обновить проект
export const updateProject = createAsyncThunk(
  'projects/update',
  async ({ id, data }: { id: string; data: Partial<Project> }) => {
    const response = await projectsApi.update(id, data);
    return response.data;
  }
);

// Удалить проект
export const deleteProject = createAsyncThunk(
  'projects/delete',
  async (id: string) => {
    await projectsApi.delete(id);
    return id;
  }
);

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch projects';
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        const index = state.items.findIndex(p => p._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.items = state.items.filter(p => p._id !== action.payload);
      });
  },
});

export default projectsSlice.reducer;