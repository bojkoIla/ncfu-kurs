import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProjects, createProject, updateProject, deleteProject } from '../store/slices/projectsSlice';
import { exportToCSV } from '../services/exportService';
import { exportToPDFFromHTML } from '../services/htmlExportService';
import FileUploader from '../components/FileUploader';
import FileList from '../components/FileList';

export default function ProjectsPage() {
  const dispatch = useDispatch();
  const { items: projects, isLoading, error } = useSelector((state: any) => state.projects);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [fileRefreshTrigger, setFileRefreshTrigger] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#007bff',
  });

  const handleExportCSV = () => {
    const columns = [
      { key: 'name', label: 'Название' },
      { key: 'description', label: 'Описание' },
      { key: 'color', label: 'Цвет' },
    ];
    exportToCSV(projects, 'projects_export', columns);
  };

  const handleExportPDF = async () => {
    const container = document.createElement('div');
    container.style.cssText = `
      position: fixed;
      top: -9999px;
      left: -9999px;
      width: 800px;
      background: white;
      padding: 20px;
      font-family: Arial, Helvetica, sans-serif;
    `;

    container.innerHTML = `
      <div style="padding: 20px;">
        <h1>Проекты</h1>
        <p>Дата экспорта: ${new Date().toLocaleString()}</p>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #007bff; color: white;">
              <th style="padding: 10px; border: 1px solid #ddd;">Название</th>
              <th style="padding: 10px; border: 1px solid #ddd;">Описание</th>
              <th style="padding: 10px; border: 1px solid #ddd;">Цвет</th>
            </tr>
          </thead>
          <tbody>
            ${projects.map((project: any) => `
              <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 8px; border: 1px solid #ddd;">${project.name}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${project.description || '—'}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">
                  <div style="width: 20px; height: 20px; background-color: ${project.color}; border-radius: 4px;"></div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    document.body.appendChild(container);
    const id = 'projects-export';
    container.id = id;
    await exportToPDFFromHTML(id, 'Проекты');
    document.body.removeChild(container);
  };

  useEffect(() => {
    dispatch(fetchProjects() as any);
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let projectId;

    if (editingProject) {
      await dispatch(updateProject({ id: editingProject._id, data: formData }) as any);
      projectId = editingProject._id;
    } else {
      const result = await dispatch(createProject(formData) as any);
      projectId = result.payload._id;
    }

    if (uploadedFiles.length > 0 && projectId) {
      for (const file of uploadedFiles) {
        const formDataFile = new FormData();
        formDataFile.append('file', file);
        try {
          await fetch(`http://localhost:3001/files/upload?projectId=${projectId}`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
            body: formDataFile,
          });
        } catch (error) {
          console.error('Error uploading file:', error);
        }
      }
      setUploadedFiles([]);
    }

    setIsModalOpen(false);
    setEditingProject(null);
    setFormData({ name: '', description: '', color: '#007bff' });
  };

  const handleEdit = (project: any) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      description: project.description || '',
      color: project.color,
    });
    setUploadedFiles([]);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Вы уверены, что хотите удалить этот проект?')) {
      await dispatch(deleteProject(id) as any);
    }
  };

  const openCreateModal = () => {
    setEditingProject(null);
    setFormData({ name: '', description: '', color: '#007bff' });
    setUploadedFiles([]);
    setIsModalOpen(true);
  };

  const openProjectDetail = (project: any) => {
    setSelectedProject(project);
  };

  const handleFileSelect = (files: FileList | null) => {
    if (files) {
      setUploadedFiles(prev => [...prev, ...Array.from(files)]);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  if (isLoading && projects.length === 0) {
    return <div style={{ padding: '2rem', color: 'var(--text-primary)' }}>Загрузка...</div>;
  }

  if (error) {
    return <div style={{ padding: '2rem', color: 'red' }}>Ошибка: {error}</div>;
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ color: 'var(--text-primary)' }}>Проекты</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={handleExportCSV}
            style={{ padding: '0.5rem 1rem', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            📄 Экспорт CSV
          </button>
          <button
            onClick={handleExportPDF}
            style={{ padding: '0.5rem 1rem', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            📑 Экспорт PDF
          </button>
          <button
            onClick={openCreateModal}
            style={{ padding: '0.5rem 1rem', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            + Создать проект
          </button>
        </div>
      </div>

      {projects.length === 0 ? (
        <p style={{ color: 'var(--text-primary)' }}>Нет проектов. Создайте первый проект!</p>
      ) : (
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {projects.map((project: any) => (
            <div
              key={project._id}
              onClick={() => openProjectDetail(project)}
              style={{
                border: `1px solid var(--card-border)`,
                borderRadius: '8px',
                padding: '1rem',
                backgroundColor: 'var(--card-bg)',
                boxShadow: 'var(--shadow)',
                cursor: 'pointer',
                transition: 'transform 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '4px',
                    backgroundColor: project.color,
                  }}
                />
                <h3 style={{ margin: 0, color: 'var(--card-text)' }}>{project.name}</h3>
              </div>
              {project.description && (
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>{project.description}</p>
              )}
              <div style={{ display: 'flex', gap: '0.5rem' }} onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => handleEdit(project)}
                  style={{ padding: '0.25rem 0.75rem', backgroundColor: '#ffc107', color: '#333', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Редактировать
                </button>
                <button
                  onClick={() => handleDelete(project._id)}
                  style={{ padding: '0.25rem 0.75rem', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Удалить
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Модальное окно для создания/редактирования проекта */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              borderRadius: '8px',
              padding: '2rem',
              width: '500px',
              maxWidth: '90%',
              maxHeight: '90%',
              overflow: 'auto',
              color: 'var(--text-primary)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>{editingProject ? 'Редактировать проект' : 'Новый проект'}</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.25rem', color: 'var(--label-color)' }}>Название *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--input-border)', borderRadius: '4px', backgroundColor: 'var(--input-bg)', color: 'var(--input-text)' }}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.25rem', color: 'var(--label-color)' }}>Описание</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--input-border)', borderRadius: '4px', backgroundColor: 'var(--input-bg)', color: 'var(--input-text)', minHeight: '80px' }}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.25rem', color: 'var(--label-color)' }}>Цвет</label>
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  style={{ width: '100%', height: '40px', border: '1px solid var(--input-border)', borderRadius: '4px', backgroundColor: 'var(--input-bg)' }}
                />
              </div>

              {/* Загрузка файлов при создании */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.25rem', color: 'var(--label-color)' }}>Файлы</label>
                <div
                  style={{
                    border: `2px dashed var(--border)`,
                    borderRadius: '8px',
                    padding: '1rem',
                    textAlign: 'center',
                    cursor: 'pointer',
                    backgroundColor: 'var(--input-bg)',
                  }}
                  onClick={() => document.getElementById('fileInput')?.click()}
                >
                  <input
                    id="fileInput"
                    type="file"
                    multiple
                    onChange={(e) => handleFileSelect(e.target.files)}
                    style={{ display: 'none' }}
                  />
                  <p style={{ color: 'var(--text-primary)' }}>📁 Нажмите для выбора файлов</p>
                  <small style={{ color: 'var(--text-secondary)' }}>Можно выбрать несколько файлов (макс. 10MB каждый)</small>
                </div>
                {uploadedFiles.length > 0 && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <p style={{ fontSize: '0.875rem', marginBottom: '0.25rem', color: 'var(--text-primary)' }}>Выбрано файлов: {uploadedFiles.length}</p>
                    <ul style={{ margin: 0, paddingLeft: '1rem', fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                      {uploadedFiles.map((file, index) => (
                        <li key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            style={{ background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer' }}
                          >
                            ×
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ padding: '0.5rem 1rem', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Отмена
                </button>
                <button type="submit" style={{ padding: '0.5rem 1rem', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  {editingProject ? 'Сохранить' : 'Создать'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Модальное окно для просмотра деталей проекта */}
      {selectedProject && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
          onClick={() => setSelectedProject(null)}
        >
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              borderRadius: '8px',
              padding: '2rem',
              width: '600px',
              maxWidth: '90%',
              maxHeight: '90%',
              overflow: 'auto',
              color: 'var(--text-primary)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ color: 'var(--text-primary)' }}>{selectedProject.name}</h2>
              <button onClick={() => setSelectedProject(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-primary)' }}>×</button>
            </div>

            {/* Описание */}
            <div style={{ marginBottom: '1rem' }}>
              <p style={{ color: 'var(--text-primary)' }}><strong>Описание:</strong> {selectedProject.description || 'Нет описания'}</p>
              <p style={{ color: 'var(--text-primary)' }}><strong>Цвет:</strong> <span style={{ display: 'inline-block', width: '20px', height: '20px', backgroundColor: selectedProject.color, borderRadius: '4px', verticalAlign: 'middle' }}></span></p>
              <p style={{ color: 'var(--text-primary)' }}><strong>Создан:</strong> {new Date(selectedProject.createdAt).toLocaleDateString()}</p>
            </div>

            {/* Файлы - под описанием */}
            <div style={{ marginTop: '1rem' }}>
              <h3 style={{ color: 'var(--text-primary)' }}>Файлы проекта</h3>
              <FileUploader
                type="project"
                id={selectedProject._id}
                onUploadComplete={() => setFileRefreshTrigger(prev => prev + 1)}
              />
              <div style={{ marginTop: '1rem' }}>
                <FileList type="project" id={selectedProject._id} refreshTrigger={fileRefreshTrigger} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}