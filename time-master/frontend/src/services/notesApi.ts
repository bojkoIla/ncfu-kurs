import api from './api';

export interface Note {
  _id: string;
  title: string;
  content: string;
  isPinned: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export const notesApi = {
  getAll: () => api.get<Note[]>('/notes'),
  getOne: (id: string) => api.get<Note>(`/notes/${id}`),
  create: (data: { title: string; content?: string; tags?: string[] }) =>
    api.post<Note>('/notes', data),
  update: (id: string, data: Partial<Note>) =>
    api.put<Note>(`/notes/${id}`, data),
  togglePin: (id: string) => api.put<Note>(`/notes/${id}/pin`),
  delete: (id: string) => api.delete(`/notes/${id}`),
};