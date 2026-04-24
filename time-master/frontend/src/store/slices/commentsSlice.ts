import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { commentsApi, type Comment } from '../../services/commentsApi';

interface CommentsState {
  items: Comment[];
  isLoading: boolean;
  error: string | null;
}

const initialState: CommentsState = {
  items: [],
  isLoading: false,
  error: null,
};

// Получить комментарии задачи
export const fetchComments = createAsyncThunk(
  'comments/fetchByTask',
  async (taskId: string) => {
    const response = await commentsApi.getByTask(taskId);
    return response.data;
  }
);

// Создать комментарий
export const createComment = createAsyncThunk(
  'comments/create',
  async ({ taskId, text }: { taskId: string; text: string }) => {
    const response = await commentsApi.create(taskId, text);
    return response.data;
  }
);

// Удалить комментарий
export const deleteComment = createAsyncThunk(
  'comments/delete',
  async (id: string) => {
    await commentsApi.delete(id);
    return id;
  }
);

const commentsSlice = createSlice({
  name: 'comments',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch comments
      .addCase(fetchComments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchComments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch comments';
      })
      // Create comment
      .addCase(createComment.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      // Delete comment
      .addCase(deleteComment.fulfilled, (state, action) => {
        state.items = state.items.filter(c => c._id !== action.payload);
      });
  },
});

export default commentsSlice.reducer;