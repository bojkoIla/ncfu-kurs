import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { notesApi, type Note } from '../../services/notesApi';

interface NotesState {
  items: Note[];
  isLoading: boolean;
  error: string | null;
}

const initialState: NotesState = {
  items: [],
  isLoading: false,
  error: null,
};

export const fetchNotes = createAsyncThunk('notes/fetchAll', async () => {
  const response = await notesApi.getAll();
  return response.data;
});

export const createNote = createAsyncThunk(
  'notes/create',
  async (data: { title: string; content?: string; tags?: string[] }) => {
    const response = await notesApi.create(data);
    return response.data;
  }
);

export const updateNote = createAsyncThunk(
  'notes/update',
  async ({ id, data }: { id: string; data: Partial<Note> }) => {
    const response = await notesApi.update(id, data);
    return response.data;
  }
);

export const togglePinNote = createAsyncThunk('notes/togglePin', async (id: string) => {
  const response = await notesApi.togglePin(id);
  return response.data;
});

export const deleteNote = createAsyncThunk('notes/delete', async (id: string) => {
  await notesApi.delete(id);
  return id;
});

const notesSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNotes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchNotes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch notes';
      })
      .addCase(createNote.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateNote.fulfilled, (state, action) => {
        const index = state.items.findIndex((n) => n._id === action.payload._id);
        if (index !== -1) state.items[index] = action.payload;
      })
      .addCase(togglePinNote.fulfilled, (state, action) => {
        const index = state.items.findIndex((n) => n._id === action.payload._id);
        if (index !== -1) state.items[index] = action.payload;
        state.items.sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));
      })
      .addCase(deleteNote.fulfilled, (state, action) => {
        state.items = state.items.filter((n) => n._id !== action.payload);
      });
  },
});

export default notesSlice.reducer;