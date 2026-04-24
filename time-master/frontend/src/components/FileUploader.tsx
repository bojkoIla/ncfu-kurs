import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { filesApi } from '../services/filesApi';

interface FileUploaderProps {
  type: 'project' | 'task';
  id: string;
  onUploadComplete?: () => void;
}

export default function FileUploader({ type, id, onUploadComplete }: FileUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      if (type === 'project') {
        await filesApi.uploadToProject(id, file);
      } else {
        await filesApi.uploadToTask(id, file);
      }
      if (onUploadComplete) onUploadComplete();
    } catch (err) {
      setError('Ошибка при загрузке файла');
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  }, [type, id, onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  return (
    <div>
      <div
        {...getRootProps()}
        style={{
          border: `2px dashed ${isDragActive ? '#007bff' : '#ddd'}`,
          borderRadius: '8px',
          padding: '1rem',
          textAlign: 'center',
          cursor: 'pointer',
          backgroundColor: isDragActive ? '#e3f2fd' : '#f8f9fa',
          transition: 'all 0.2s',
        }}
      >
        <input {...getInputProps()} />
        {isUploading ? (
          <p>Загрузка...</p>
        ) : isDragActive ? (
          <p>Отпустите файл для загрузки</p>
        ) : (
          <p>📁 Перетащите файл сюда или нажмите для выбора (макс. 10MB)</p>
        )}
      </div>
      {error && <p style={{ color: '#dc3545', fontSize: '0.875rem', marginTop: '0.5rem' }}>{error}</p>}
    </div>
  );
}