import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import projectsReducer from './slices/projectsSlice';
import tasksReducer from './slices/tasksSlice';
import timeEntriesReducer from './slices/timeEntriesSlice';
import reportsReducer from './slices/reportsSlice';
import commentsReducer from './slices/commentsSlice';
import notesReducer from './slices/notesSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    projects: projectsReducer,
    tasks: tasksReducer,
    timeEntries: timeEntriesReducer,
    reports: reportsReducer,
    comments: commentsReducer,
    notes: notesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;