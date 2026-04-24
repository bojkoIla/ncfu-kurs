import api from './api';

export interface Task {
  _id: string;
  title: string;
  description?: string;
  project: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  estimatedHours: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  project: string;
  status?: 'todo' | 'in_progress' | 'done';
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
  estimatedHours?: number;
}

export const tasksApi = {
  // Получить все задачи (с фильтрацией)
  getAll: (filters?: { project?: string; status?: string; priority?: string }) =>
    api.get<Task[]>('/tasks', { params: filters }),

  // Получить одну задачу
  getOne: (id: string) => api.get<Task>(`/tasks/${id}`),

  // Создать задачу
  create: (data: CreateTaskData) => api.post<Task>('/tasks', data),

  // Обновить задачу
  update: (id: string, data: Partial<CreateTaskData>) =>
    api.put<Task>(`/tasks/${id}`, data),

  // Удалить задачу
  delete: (id: string) => api.delete(`/tasks/${id}`),
};