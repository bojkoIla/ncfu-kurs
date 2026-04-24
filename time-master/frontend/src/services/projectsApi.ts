import api from './api';

export interface Project {
  _id: string;
  name: string;
  description?: string;
  color: string;
  owner: string;
  createdAt: string;
  updatedAt: string;
}

export const projectsApi = {
  // Получить все проекты
  getAll: () => api.get<Project[]>('/projects'),

  // Получить один проект
  getOne: (id: string) => api.get<Project>(`/projects/${id}`),

  // Создать проект
  create: (data: { name: string; description?: string; color?: string }) =>
    api.post<Project>('/projects', data),

  // Обновить проект
  update: (id: string, data: Partial<Project>) =>
    api.put<Project>(`/projects/${id}`, data),

  // Удалить проект
  delete: (id: string) => api.delete(`/projects/${id}`),
};