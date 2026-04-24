import api from './api';

export interface TimeEntry {
  _id: string;
  task: string;
  user: string;
  startTime: string;
  endTime?: string;
  durationMinutes: number;
  createdAt: string;
  updatedAt: string;
}

export interface TimeEntryWithTask extends TimeEntry {
  task: {
    _id: string;
    title: string;
    project: string;
  };
}

export const timeEntriesApi = {
  // Запустить таймер
  start: (taskId: string) => api.post<TimeEntry>('/time-entries/start', { taskId }),

  // Остановить таймер
  stop: () => api.post<TimeEntry>('/time-entries/stop'),

  // Получить записи по задаче
  getByTask: (taskId: string) => api.get<TimeEntry[]>(`/time-entries/task/${taskId}`),

  // Получить записи пользователя за период
  getByUser: (startDate?: Date, endDate?: Date) =>
    api.get<TimeEntryWithTask[]>('/reports/by-user', { params: { start: startDate, end: endDate } }),

  // Получить активный таймер
  getActive: () => api.get<TimeEntry | null>('/time-entries/active'),
};