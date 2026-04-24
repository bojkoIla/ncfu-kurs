import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchTasks, createTask, updateTask, deleteTask } from '../store/slices/tasksSlice';
import { fetchProjects } from '../store/slices/projectsSlice';
import { exportToCSV } from '../services/exportService';
import { exportTasksToPDF } from '../services/htmlExportService';

export default function TasksPage() {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const { items: tasks, isLoading, error } = useSelector((state: any) => state.tasks);
  const { items: projects } = useSelector((state: any) => state.projects);
  const taskRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const initialLoadDone = useRef(false);
  const isUpdatingURL = useRef(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [savedFilters, setSavedFilters] = useState<any[]>([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [filterName, setFilterName] = useState('');


  const [filters, setFilters] = useState(() => {
    const savedProject = localStorage.getItem('tasks_project_filter');
    const savedStatus = localStorage.getItem('tasks_status_filter');
    const savedPriority = localStorage.getItem('tasks_priority_filter');
    return {
      project: savedProject || '',
      status: savedStatus || '',
      priority: savedPriority || '',
    };
  });

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project: '',
    status: 'todo',
    priority: 'medium',
    dueDate: '',
  });


  useEffect(() => {
    localStorage.setItem('tasks_project_filter', filters.project);
    localStorage.setItem('tasks_status_filter', filters.status);
    localStorage.setItem('tasks_priority_filter', filters.priority);
  }, [filters.project, filters.status, filters.priority]);


  useEffect(() => {
    const saved = localStorage.getItem('taskFilters');
    if (saved) {
      setSavedFilters(JSON.parse(saved));
    }

    const lastProject = localStorage.getItem('tasks_project_filter');
    const lastStatus = localStorage.getItem('tasks_status_filter');
    const lastPriority = localStorage.getItem('tasks_priority_filter');

    if (lastProject && !initialLoadDone.current) {
      setFilters(prev => ({ ...prev, project: lastProject }));
    }
    if (lastStatus && !initialLoadDone.current) {
      setFilters(prev => ({ ...prev, status: lastStatus }));
    }
    if (lastPriority && !initialLoadDone.current) {
      setFilters(prev => ({ ...prev, priority: lastPriority }));
    }

    const params = new URLSearchParams(location.search);
    const projectParam = params.get('project');
    const statusParam = params.get('status');
    const priorityParam = params.get('priority');
    const searchParam = params.get('search');

    if (projectParam) setFilters(prev => ({ ...prev, project: projectParam }));
    if (statusParam) setFilters(prev => ({ ...prev, status: statusParam }));
    if (priorityParam) setFilters(prev => ({ ...prev, priority: priorityParam }));
    if (searchParam) setSearchQuery(searchParam);

    initialLoadDone.current = true;
  }, []);

  useEffect(() => {
    dispatch(fetchProjects() as any);
  }, [dispatch]);

  const loadTasks = useCallback((currentFilters: typeof filters) => {
    const activeFilters: any = {};
    if (currentFilters.project) activeFilters.project = currentFilters.project;
    if (currentFilters.status) activeFilters.status = currentFilters.status;
    if (currentFilters.priority) activeFilters.priority = currentFilters.priority;
    dispatch(fetchTasks(activeFilters) as any);
  }, [dispatch]);

  useEffect(() => {
    if (!initialLoadDone.current) return;

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      loadTasks(filters);
    }, 300);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [filters, loadTasks]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const taskId = params.get('taskId');

    if (taskId && tasks.length > 0 && taskRefs.current[taskId]) {
      setTimeout(() => {
        if (taskRefs.current[taskId]) {
          taskRefs.current[taskId]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          const element = taskRefs.current[taskId];
          if (element) {
            element.style.transition = 'background-color 0.5s';
            element.style.backgroundColor = '#fff3cd';
            setTimeout(() => {
              if (element) element.style.backgroundColor = '';
            }, 2000);
          }
        }
      }, 500);
    }
  }, [location.search, tasks]);

  useEffect(() => {
    if (!initialLoadDone.current || isUpdatingURL.current) return;

    isUpdatingURL.current = true;

    const params = new URLSearchParams();
    if (filters.project) params.set('project', filters.project);
    if (filters.status) params.set('status', filters.status);
    if (filters.priority) params.set('priority', filters.priority);
    if (searchQuery) params.set('search', searchQuery);

    const newUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
    window.history.replaceState({}, '', newUrl);

    isUpdatingURL.current = false;
  }, [filters, searchQuery]);

  const filteredTasks = useMemo(() => {
    let result = tasks;

    if (filters.project) {
      result = result.filter((task: any) => task.project === filters.project);
    }
    if (filters.status) {
      result = result.filter((task: any) => task.status === filters.status);
    }
    if (filters.priority) {
      result = result.filter((task: any) => task.priority === filters.priority);
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((task: any) =>
        task.title.toLowerCase().includes(query) ||
        (task.description && task.description.toLowerCase().includes(query))
      );
    }
    return result;
  }, [tasks, filters, searchQuery]);

  const handleExportCSV = () => {
    const columns = [
      { key: 'title', label: 'Название' },
      { key: 'projectName', label: 'Проект' },
      { key: 'status', label: 'Статус' },
      { key: 'priority', label: 'Приоритет' },
      { key: 'dueDate', label: 'Срок' },
    ];

    const dataWithProjectName = filteredTasks.map((task: any) => ({
      ...task,
      projectName: projects.find((p: any) => p._id === task.project)?.name || '—',
      dueDate: task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Не указан',
    }));

    exportToCSV(dataWithProjectName, 'tasks_export', columns);
  };

  const handleExportPDF = async () => {
    await exportTasksToPDF(filteredTasks, projects, 'Задачи');
  };

  const saveCurrentFilter = () => {
    if (!filterName.trim()) return;
    const newFilter = {
      id: Date.now(),
      name: filterName,
      filters: { ...filters },
      searchQuery,
    };
    const updated = [...savedFilters, newFilter];
    setSavedFilters(updated);
    localStorage.setItem('taskFilters', JSON.stringify(updated));
    setFilterName('');
    setShowSaveModal(false);
  };

  const loadSavedFilter = (filter: any) => {
    setFilters(filter.filters);
    setSearchQuery(filter.searchQuery || '');
  };

  const deleteSavedFilter = (id: number) => {
    const updated = savedFilters.filter((f: any) => f.id !== id);
    setSavedFilters(updated);
    localStorage.setItem('taskFilters', JSON.stringify(updated));
  };

  const applyQuickFilter = (filterType: string) => {
    switch (filterType) {
      case 'my':
        setFilters(prev => ({ ...prev, status: '', priority: '' }));
        setSearchQuery('');
        break;
      case 'active':
        setFilters(prev => ({ ...prev, status: 'in_progress', priority: '' }));
        setSearchQuery('');
        break;
      case 'high':
        setFilters(prev => ({ ...prev, status: '', priority: 'high' }));
        setSearchQuery('');
        break;
      case 'overdue':
        setFilters(prev => ({ ...prev, status: '', priority: '' }));
        setSearchQuery('');
        break;
    }
  };

  const resetFilters = () => {
    setFilters(prev => ({ ...prev, status: '', priority: '' }));
    setSearchQuery('');
  };

  const openCreateModal = () => {
    setEditingTask(null);
    setIsCreating(true);
    setFormData({
      title: '',
      description: '',
      project: filters.project || '',
      status: 'todo',
      priority: 'medium',
      dueDate: '',
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
    setIsCreating(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.project) {
      alert('Выберите проект!');
      return;
    }

    if (editingTask) {
      await dispatch(updateTask({ id: editingTask._id, data: formData }) as any);
    } else {
      await dispatch(createTask(formData) as any);
    }
    closeModal();
  };

  const handleEdit = (task: any) => {
    setEditingTask(task);
    setIsCreating(false);
    setFormData({
      title: task.title,
      description: task.description || '',
      project: task.project,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate?.split('T')[0] || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Вы уверены, что хотите удалить эту задачу?')) {
      await dispatch(deleteTask(id) as any);
    }
  };

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

  if (isLoading && tasks.length === 0 && initialLoadDone.current === false) {
    return <div style={{ padding: '2rem', color: 'var(--text-primary)' }}>Загрузка...</div>;
  }

  if (error) {
    return <div style={{ padding: '2rem', color: 'red' }}>Ошибка: {error}</div>;
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ color: 'var(--text-primary)' }}>Задачи</h1>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
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
            + Создать задачу
          </button>
        </div>
      </div>

      {/* Быстрые фильтры */}
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => applyQuickFilter('my')}
          style={{
            padding: '0.25rem 0.75rem',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.875rem',
          }}
        >
          Мои задачи
        </button>
        <button
          onClick={() => applyQuickFilter('active')}
          style={{
            padding: '0.25rem 0.75rem',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.875rem',
          }}
        >
          Активные задачи
        </button>
        <button
          onClick={() => applyQuickFilter('high')}
          style={{
            padding: '0.25rem 0.75rem',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.875rem',
          }}
        >
          Высокий приоритет
        </button>
        <button
          onClick={() => applyQuickFilter('overdue')}
          style={{
            padding: '0.25rem 0.75rem',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.875rem',
          }}
        >
          Просроченные
        </button>
      </div>

      {/* Поиск */}
      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="🔍 Поиск по названию или описанию..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid var(--input-border)',
            borderRadius: '8px',
            fontSize: '1rem',
            backgroundColor: 'var(--input-bg)',
            color: 'var(--input-text)',
          }}
        />
      </div>

      {/* Фильтры */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <select
          value={filters.project}
          onChange={(e) => setFilters({ ...filters, project: e.target.value })}
          style={{ padding: '0.5rem', border: '1px solid var(--input-border)', borderRadius: '4px', backgroundColor: 'var(--input-bg)', color: 'var(--input-text)' }}
        >
          <option value="">Все проекты</option>
          {projects.map((project: any) => (
            <option key={project._id} value={project._id}>{project.name}</option>
          ))}
        </select>

        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          style={{ padding: '0.5rem', border: '1px solid var(--input-border)', borderRadius: '4px', backgroundColor: 'var(--input-bg)', color: 'var(--input-text)' }}
        >
          <option value="">Все статусы</option>
          <option value="todo">К выполнению</option>
          <option value="in_progress">В процессе</option>
          <option value="done">Выполнено</option>
        </select>

        <select
          value={filters.priority}
          onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
          style={{ padding: '0.5rem', border: '1px solid var(--input-border)', borderRadius: '4px', backgroundColor: 'var(--input-bg)', color: 'var(--input-text)' }}
        >
          <option value="">Все приоритеты</option>
          <option value="low">Низкий</option>
          <option value="medium">Средний</option>
          <option value="high">Высокий</option>
        </select>

        <button
          onClick={() => setShowSaveModal(true)}
          style={{ padding: '0.5rem 1rem', backgroundColor: '#17a2b8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          disabled={!filters.project && !filters.status && !filters.priority && !searchQuery}
        >
          💾 Сохранить фильтр
        </button>

        {(filters.status || filters.priority || searchQuery) && (
          <button
            onClick={resetFilters}
            style={{ padding: '0.5rem 1rem', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Сбросить фильтры
          </button>
        )}
      </div>

      {/* Сохранённые фильтры */}
      {savedFilters.length > 0 && (
        <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Сохранённые фильтры:</span>
          {savedFilters.map((filter: any) => (
            <div key={filter.id} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', backgroundColor: 'var(--hover)', borderRadius: '4px', padding: '0.25rem 0.5rem' }}>
              <button
                onClick={() => loadSavedFilter(filter)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--text-primary)' }}
              >
                {filter.name}
              </button>
              <button
                onClick={() => deleteSavedFilter(filter.id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc3545', fontSize: '0.875rem' }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Результаты поиска */}
      <div style={{ marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
        Найдено задач: {filteredTasks.length} из {tasks.length}
      </div>

      {filteredTasks.length === 0 ? (
        <p style={{ color: 'var(--text-primary)' }}>Нет задач. Создайте первую задачу или измените фильтры!</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredTasks.map((task: any) => {
            const project = projects.find((p: any) => p._id === task.project);
            return (
              <div
                key={task._id}
                ref={(el) => { taskRefs.current[task._id] = el; }}
                style={{
                  border: `1px solid var(--border)`,
                  borderRadius: '8px',
                  padding: '1rem',
                  backgroundColor: 'var(--bg-card)',
                  boxShadow: 'var(--shadow)',
                  transition: 'background-color 0.5s',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                      <h3
                        style={{ margin: 0, cursor: 'pointer', color: 'var(--primary)' }}
                        onClick={() => navigate(`/tasks/${task._id}`)}
                      >
                        {task.title}
                      </h3>
                      <span style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.875rem', backgroundColor: getStatusColor(task.status), color: 'white' }}>
                        {getStatusText(task.status)}
                      </span>
                      <span style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.875rem', backgroundColor: getPriorityColor(task.priority), color: 'white' }}>
                        {getPriorityText(task.priority)}
                      </span>
                    </div>
                    {task.description && <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{task.description}</p>}
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
                      {project && <span>📁 {project.name}</span>}
                      {task.dueDate && (
                        <span>📅 {new Date(task.dueDate).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => handleEdit(task)}
                      style={{ padding: '0.25rem 0.75rem', backgroundColor: '#ffc107', color: '#333', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Редактировать
                    </button>
                    <button
                      onClick={() => handleDelete(task._id)}
                      style={{ padding: '0.25rem 0.75rem', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Модальное окно для сохранения фильтра */}
      {showSaveModal && (
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
          onClick={() => setShowSaveModal(false)}
        >
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              borderRadius: '8px',
              padding: '2rem',
              width: '400px',
              maxWidth: '90%',
              color: 'var(--text-primary)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ color: 'var(--text-primary)' }}>Сохранить фильтр</h2>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.25rem', color: 'var(--text-primary)' }}>Название фильтра</label>
              <input
                type="text"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                placeholder="Например: Задачи на неделю"
                style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--input-border)', borderRadius: '4px', backgroundColor: 'var(--input-bg)', color: 'var(--input-text)' }}
                autoFocus
              />
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowSaveModal(false)}
                style={{ padding: '0.5rem 1rem', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                Отмена
              </button>
              <button
                onClick={saveCurrentFilter}
                disabled={!filterName.trim()}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: filterName.trim() ? 'pointer' : 'not-allowed',
                  opacity: filterName.trim() ? 1 : 0.6,
                }}
              >
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно для создания/редактирования задачи */}
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
          onClick={closeModal}
        >
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              borderRadius: '12px',
              padding: '2rem',
              width: '500px',
              maxWidth: '90%',
              maxHeight: '90%',
              overflow: 'auto',
              color: 'var(--text-primary)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>{editingTask ? 'Редактировать задачу' : 'Новая задача'}</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.25rem', color: 'var(--text-primary)' }}>Название *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--input-border)', borderRadius: '4px', backgroundColor: 'var(--input-bg)', color: 'var(--input-text)' }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.25rem', color: 'var(--text-primary)' }}>Проект *</label>
                <select
                  value={formData.project}
                  onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--input-border)', borderRadius: '4px', backgroundColor: 'var(--input-bg)', color: 'var(--input-text)' }}
                >
                  <option value="">Выберите проект</option>
                  {projects.map((project: any) => (
                    <option key={project._id} value={project._id}>{project.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.25rem', color: 'var(--text-primary)' }}>Описание</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--input-border)', borderRadius: '4px', backgroundColor: 'var(--input-bg)', color: 'var(--input-text)', minHeight: '80px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', color: 'var(--text-primary)' }}>Статус</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--input-border)', borderRadius: '4px', backgroundColor: 'var(--input-bg)', color: 'var(--input-text)' }}
                  >
                    <option value="todo">К выполнению</option>
                    <option value="in_progress">В процессе</option>
                    <option value="done">Выполнено</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', color: 'var(--text-primary)' }}>Приоритет</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--input-border)', borderRadius: '4px', backgroundColor: 'var(--input-bg)', color: 'var(--input-text)' }}
                  >
                    <option value="low">Низкий</option>
                    <option value="medium">Средний</option>
                    <option value="high">Высокий</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.25rem', color: 'var(--text-primary)' }}>Срок выполнения</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--input-border)', borderRadius: '4px', backgroundColor: 'var(--input-bg)', color: 'var(--input-text)' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={closeModal}
                  style={{ padding: '0.5rem 1rem', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Отмена
                </button>
                <button type="submit" style={{ padding: '0.5rem 1rem', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  {editingTask ? 'Сохранить' : 'Создать'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}