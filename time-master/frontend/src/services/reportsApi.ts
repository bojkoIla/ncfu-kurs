import api from './api';

export const reportsApi = {
  // Время по проектам
  getTimeByProjects: (startDate: string, endDate: string) =>
    api.get('/reports/by-projects', { params: { start: startDate, end: endDate } }),

  // Время по задачам
  getTimeByTasks: (startDate: string, endDate: string) =>
    api.get('/reports/by-tasks', { params: { start: startDate, end: endDate } }),

  // Ежедневная статистика
  getDailyStats: (startDate: string, endDate: string) =>
    api.get('/reports/daily', { params: { start: startDate, end: endDate } }),
};