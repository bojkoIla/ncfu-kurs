import api from './api';

export interface FileData {
  _id: string;
  originalName: string;
  filename: string;
  mimetype: string;
  size: number;
  uploadedBy: string;
  createdAt: string;
}

export const filesApi = {
  // Загрузить файл для проекта
  uploadToProject: (projectId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<FileData>(`/files/upload?projectId=${projectId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Загрузить файл для задачи
  uploadToTask: (taskId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<FileData>(`/files/upload?taskId=${taskId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Получить файлы проекта
  getProjectFiles: (projectId: string) =>
    api.get<FileData[]>(`/files/project/${projectId}`),

  // Получить файлы задачи
  getTaskFiles: (taskId: string) =>
    api.get<FileData[]>(`/files/task/${taskId}`),

  // Скачать файл
  downloadFile: (fileId: string) =>
    api.get(`/files/download/${fileId}`, { responseType: 'blob' }),

  // Удалить файл
  deleteFile: (fileId: string) => api.delete(`/files/${fileId}`),
};

// Экспорт по умолчанию для удобства
export default filesApi;