import { useEffect, useState } from 'react';
import { filesApi } from '../services/filesApi';

interface FileItem {
  _id: string;
  originalName: string;
  filename: string;
  mimetype: string;
  size: number;
  uploadedBy: string;
  createdAt: string;
}

interface FileListProps {
  type: 'project' | 'task';
  id: string;
  refreshTrigger?: number;
}

export default function FileList({ type, id, refreshTrigger }: FileListProps) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadFiles = async () => {
    setIsLoading(true);
    try {
      let response;
      if (type === 'project') {
        response = await filesApi.getProjectFiles(id);
      } else {
        response = await filesApi.getTaskFiles(id);
      }
      setFiles(response.data);
    } catch (error) {
      console.error('Error loading files:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, [type, id, refreshTrigger]);

  const handleDownload = async (fileId: string, fileName: string) => {
    try {
      const response = await filesApi.downloadFile(fileId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Ошибка при скачивании файла');
    }
  };

  const handleDelete = async (fileId: string) => {
    if (confirm('Удалить файл?')) {
      try {
        await filesApi.deleteFile(fileId);
        loadFiles();
      } catch (error) {
        console.error('Error deleting file:', error);
        alert('Ошибка при удалении файла');
      }
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (mimetype: string) => {
    if (mimetype.startsWith('image/')) return '🖼️';
    if (mimetype === 'application/pdf') return '📄';
    if (mimetype.includes('word')) return '📝';
    if (mimetype.includes('excel') || mimetype.includes('sheet')) return '📊';
    return '📎';
  };

  if (isLoading) {
    return <p>Загрузка файлов...</p>;
  }

  if (files.length === 0) {
    return <p style={{ color: '#666' }}>Нет прикреплённых файлов</p>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {files.map((file) => (
        <div
          key={file._id}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.5rem',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #e9ecef',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
            <span style={{ fontSize: '1.25rem' }}>{getFileIcon(file.mimetype)}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 500 }}>{file.originalName}</div>
              <div style={{ fontSize: '0.75rem', color: '#666' }}>
                {formatFileSize(file.size)} • {new Date(file.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => handleDownload(file._id, file.originalName)}
              style={{
                padding: '0.25rem 0.5rem',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.75rem',
              }}
            >
              Скачать
            </button>
            <button
              onClick={() => handleDelete(file._id)}
              style={{
                padding: '0.25rem 0.5rem',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.75rem',
              }}
            >
              Удалить
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}