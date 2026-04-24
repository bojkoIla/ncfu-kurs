import api from './api';

export interface Comment {
  _id: string;
  text: string;
  author: string;
  authorName?: string;
  task: string;
  createdAt: string;
}

export const commentsApi = {
  // Получить комментарии к задаче
  getByTask: (taskId: string) => api.get<Comment[]>(`/comments/task/${taskId}`),

  // Создать комментарий
  create: (taskId: string, text: string) => api.post<Comment>('/comments', { taskId, text }),

  // Удалить комментарий
  delete: (id: string) => api.delete(`/comments/${id}`),
};