import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchProjects } from '../store/slices/projectsSlice';
import { fetchTasks } from '../store/slices/tasksSlice';

export default function ProjectView() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: projects, isLoading: projectsLoading } = useSelector((state: any) => state.projects);
  const { items: tasks, isLoading: tasksLoading } = useSelector((state: any) => state.tasks);

  // Загружаем сохранённый проект из localStorage
  const [selectedProjectId, setSelectedProjectId] = useState<string>(() => {
    const saved = localStorage.getItem('selectedProjectId');
    return saved || '';
  });

  const [projectTasks, setProjectTasks] = useState<any[]>([]);

  // Загрузка проектов и задач
  useEffect(() => {
    if (projects.length === 0) {
      dispatch(fetchProjects() as any);
    }
    if (tasks.length === 0) {
      dispatch(fetchTasks({}) as any);
    }
  }, [dispatch, projects.length, tasks.length]);

  // Сохраняем выбранный проект в localStorage при изменении
  useEffect(() => {
    if (selectedProjectId) {
      localStorage.setItem('selectedProjectId', selectedProjectId);
    }
  }, [selectedProjectId]);

  // Фильтрация задач по выбранному проекту
  useEffect(() => {
    if (selectedProjectId && tasks.length > 0) {
      const filtered = tasks.filter((task: any) => {
        const taskProjectId = task.project?.toString();
        const selectedId = selectedProjectId.toString();
        return taskProjectId === selectedId;
      });
      setProjectTasks(filtered);
    } else if (projects.length > 0 && !selectedProjectId) {
      // Автоматически выбираем первый проект
      setSelectedProjectId(projects[0]._id);
    } else if (selectedProjectId && tasks.length === 0) {
      setProjectTasks([]);
    }
  }, [selectedProjectId, tasks, projects]);

  // При изменении списка проектов, обновляем выбранный проект если нужно
  useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0]._id);
    } else if (projects.length > 0 && selectedProjectId) {
      // Проверяем, существует ли выбранный проект ещё
      const projectExists = projects.some((p: any) => p._id === selectedProjectId);
      if (!projectExists) {
        setSelectedProjectId(projects[0]._id);
      }
    }
  }, [projects, selectedProjectId]);

  const selectedProject = projects.find((p: any) => p._id === selectedProjectId);

  const getStatusText = (status: string) => {
    const statusMap: any = {
      todo: 'К выполнению',
      in_progress: 'В процессе',
      done: 'Выполнено',
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap: any = {
      todo: '#6c757d',
      in_progress: '#007bff',
      done: '#28a745',
    };
    return colorMap[status] || '#6c757d';
  };

  const getPriorityText = (priority: string) => {
    const priorityMap: any = {
      low: 'Низкий',
      medium: 'Средний',
      high: 'Высокий',
    };
    return priorityMap[priority] || priority;
  };

  const getPriorityColor = (priority: string) => {
    const colorMap: any = {
      low: '#28a745',
      medium: '#ffc107',
      high: '#dc3545',
    };
    return colorMap[priority] || '#6c757d';
  };

  const completedTasks = projectTasks.filter((t: any) => t.status === 'done').length;
  const progress = projectTasks.length > 0 ? (completedTasks / projectTasks.length) * 100 : 0;

  if (projectsLoading && projects.length === 0) {
    return (
      <div style={{ padding: '1rem', textAlign: 'center' }}>
        <p>Загрузка проектов...</p>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div style={{ padding: '1rem', textAlign: 'center' }}>
        <p>Нет проектов. Создайте проект!</p>
        <button
          onClick={() => navigate('/projects')}
          style={{ padding: '0.5rem 1rem', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '0.5rem' }}
        >
          Перейти к проектам
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h3 style={{ margin: 0 }}>Проект и задачи</h3>
        <select
          value={selectedProjectId}
          onChange={(e) => setSelectedProjectId(e.target.value)}
          style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
        >
          {projects.map((project: any) => (
            <option key={project._id} value={project._id}>{project.name}</option>
          ))}
        </select>
      </div>

      {selectedProject && (
        <>
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '1rem',
            color: 'white',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <div style={{ width: '16px', height: '16px', borderRadius: '4px', backgroundColor: selectedProject.color }} />
              <h4 style={{ margin: 0 }}>{selectedProject.name}</h4>
            </div>
            {selectedProject.description && (
              <p style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem' }}>{selectedProject.description}</p>
            )}

            {/* Статистика проекта */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem', fontSize: '0.75rem' }}>
              <span>📋 Всего задач: {projectTasks.length}</span>
              <span>✅ Выполнено: {completedTasks}</span>
            </div>

            <div style={{ marginTop: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                <span>Прогресс</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div style={{ height: '6px', backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${progress}%`, height: '100%', backgroundColor: '#28a745', borderRadius: '3px' }} />
              </div>
            </div>
          </div>

          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {tasksLoading && projectTasks.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#666', padding: '1rem' }}>Загрузка задач...</p>
            ) : projectTasks.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#666', padding: '1rem' }}>Нет задач в этом проекте</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {projectTasks.map((task: any) => (
                  <div
                    key={task._id}
                    onClick={() => navigate(`/tasks/${task._id}`)}
                    style={{
                      padding: '0.5rem',
                      backgroundColor: 'var(--bg-secondary)',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                      border: '1px solid var(--border)',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div>
                        <strong>{task.title}</strong>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.7rem', padding: '0.125rem 0.375rem', borderRadius: '4px', backgroundColor: getStatusColor(task.status), color: 'white' }}>
                          {getStatusText(task.status)}
                        </span>
                        <span style={{ fontSize: '0.7rem', padding: '0.125rem 0.375rem', borderRadius: '4px', backgroundColor: getPriorityColor(task.priority), color: 'white' }}>
                          {getPriorityText(task.priority)}
                        </span>
                      </div>
                    </div>
                    {task.dueDate && (
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                        📅 {new Date(task.dueDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}