import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTasks, updateTask } from '../store/slices/tasksSlice';
import { fetchProjects } from '../store/slices/projectsSlice';
import { fetchTimeEntriesByTask } from '../store/slices/timeEntriesSlice';
import { fetchComments, createComment, deleteComment } from '../store/slices/commentsSlice';
import FileUploader from '../components/FileUploader';
import FileList from '../components/FileList';

export default function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { items: tasks, isLoading: tasksLoading } = useSelector((state: any) => state.tasks);
  const { items: projects } = useSelector((state: any) => state.projects);
  const { entries: timeEntries, isLoading: entriesLoading } = useSelector((state: any) => state.timeEntries);
  const { items: comments, isLoading: commentsLoading } = useSelector((state: any) => state.comments);

  const [newComment, setNewComment] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'files' | 'comments'>('info');
  const [fileRefreshTrigger, setFileRefreshTrigger] = useState(0);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    status: '',
    priority: '',
    dueDate: '',
  });

  const task = tasks.find((t: any) => t._id === id);
  const project = task ? projects.find((p: any) => p._id === task.project) : null;


  const getTimeUntilDue = (dueDate: string | undefined) => {
    if (!dueDate) return null;

    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: `Просрочено на ${Math.abs(diffDays)} дн.`, color: '#dc3545', isOverdue: true };
    } else if (diffDays === 0) {
      return { text: 'Сегодня', color: '#ffc107', isOverdue: false };
    } else if (diffDays === 1) {
      return { text: 'Завтра', color: '#ffc107', isOverdue: false };
    } else if (diffDays <= 3) {
      return { text: `${diffDays} дн.`, color: '#fd7e14', isOverdue: false };
    } else if (diffDays <= 7) {
      return { text: `${diffDays} дн.`, color: '#28a745', isOverdue: false };
    } else {
      return { text: `${diffDays} дн.`, color: 'var(--text-secondary)', isOverdue: false };
    }
  };

  useEffect(() => {
    if (tasks.length === 0) {
      dispatch(fetchTasks({}) as any);
    }
    if (projects.length === 0) {
      dispatch(fetchProjects() as any);
    }
    if (id) {
      dispatch(fetchTimeEntriesByTask(id) as any);
      dispatch(fetchComments(id) as any);
    }
  }, [dispatch, id, tasks.length, projects.length]);

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (id) {
      await dispatch(updateTask({ id, data: editForm }) as any);
      setIsEditing(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (id && newComment.trim()) {
      await dispatch(createComment({ taskId: id, text: newComment }) as any);
      setNewComment('');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (confirm('Удалить комментарий?')) {
      await dispatch(deleteComment(commentId) as any);
    }
  };

  const formatMinutes = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}ч ${mins}м`;
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

  const totalTime = timeEntries.reduce((sum: number, entry: any) => sum + (entry.durationMinutes || 0), 0);
  const timeUntilDue = getTimeUntilDue(task?.dueDate);

  if (tasksLoading && !task) {
    return <div style={{ padding: '2rem', color: 'var(--text-primary)' }}>Загрузка...</div>;
  }

  if (!task) {
    return <div style={{ padding: '2rem', color: 'var(--text-primary)' }}>Задача не найдена</div>;
  }

  if (isEditing) {
    return (
      <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
        <h1 style={{ color: 'var(--text-primary)' }}>Редактирование задачи</h1>
        <form onSubmit={handleUpdateTask}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.25rem', color: 'var(--label-color)' }}>Название *</label>
            <input
              type="text"
              value={editForm.title}
              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              required
              style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--input-border)', borderRadius: '4px', backgroundColor: 'var(--input-bg)', color: 'var(--input-text)' }}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.25rem', color: 'var(--label-color)' }}>Описание</label>
            <textarea
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--input-border)', borderRadius: '4px', backgroundColor: 'var(--input-bg)', color: 'var(--input-text)', minHeight: '100px' }}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ color: 'var(--label-color)' }}>Статус</label>
              <select
                value={editForm.status}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--input-border)', borderRadius: '4px', backgroundColor: 'var(--input-bg)', color: 'var(--input-text)' }}
              >
                <option value="todo">К выполнению</option>
                <option value="in_progress">В процессе</option>
                <option value="done">Выполнено</option>
              </select>
            </div>
            <div>
              <label style={{ color: 'var(--label-color)' }}>Приоритет</label>
              <select
                value={editForm.priority}
                onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--input-border)', borderRadius: '4px', backgroundColor: 'var(--input-bg)', color: 'var(--input-text)' }}
              >
                <option value="low">Низкий</option>
                <option value="medium">Средний</option>
                <option value="high">Высокий</option>
              </select>
            </div>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ color: 'var(--label-color)' }}>Срок выполнения</label>
            <input
              type="date"
              value={editForm.dueDate}
              onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--input-border)', borderRadius: '4px', backgroundColor: 'var(--input-bg)', color: 'var(--input-text)' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button type="submit" style={{ padding: '0.5rem 1rem', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              Сохранить
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              style={{ padding: '0.5rem 1rem', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Отмена
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Кнопка назад */}
      <button
        onClick={() => navigate('/tasks')}
        style={{ marginBottom: '1rem', padding: '0.5rem 1rem', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
      >
        ← Назад к задачам
      </button>

      {/* Заголовок */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ margin: 0, color: 'var(--text-primary)' }}>{task.title}</h1>
          {project && <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>📁 {project.name}</p>}
        </div>
        <button
          onClick={() => {
            setEditForm({
              title: task.title,
              description: task.description || '',
              status: task.status,
              priority: task.priority,
              dueDate: task.dueDate?.split('T')[0] || '',
            });
            setIsEditing(true);
          }}
          style={{ padding: '0.5rem 1rem', backgroundColor: '#ffc107', color: '#333', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Редактировать
        </button>
      </div>

      {/* Вкладки */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '2rem',
        borderBottom: '2px solid var(--border)',
        paddingBottom: '0',
      }}>
        <button
          onClick={() => setActiveTab('info')}
          style={{
            padding: '0.75rem 1.5rem',
            background: activeTab === 'info' ? 'var(--primary)' : 'var(--bg-secondary)',
            color: activeTab === 'info' ? 'white' : 'var(--text-primary)',
            border: activeTab === 'info' ? 'none' : '1px solid var(--border)',
            borderBottom: activeTab === 'info' ? 'none' : '1px solid var(--border)',
            borderRadius: '8px 8px 0 0',
            cursor: 'pointer',
            fontWeight: activeTab === 'info' ? '600' : '500',
            fontSize: '1rem',
            transition: 'all 0.2s ease',
            position: 'relative',
            bottom: '-2px',
          }}
          onMouseEnter={(e) => {
            if (activeTab !== 'info') {
              e.currentTarget.style.background = 'var(--hover)';
              e.currentTarget.style.color = 'var(--primary)';
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== 'info') {
              e.currentTarget.style.background = 'var(--bg-secondary)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }
          }}
        >
          📋 Информация
        </button>

        <button
          onClick={() => setActiveTab('files')}
          style={{
            padding: '0.75rem 1.5rem',
            background: activeTab === 'files' ? '#28a745' : 'var(--bg-secondary)',
            color: activeTab === 'files' ? 'white' : 'var(--text-primary)',
            border: activeTab === 'files' ? 'none' : '1px solid var(--border)',
            borderBottom: activeTab === 'files' ? 'none' : '1px solid var(--border)',
            borderRadius: '8px 8px 0 0',
            cursor: 'pointer',
            fontWeight: activeTab === 'files' ? '600' : '500',
            fontSize: '1rem',
            transition: 'all 0.2s ease',
            position: 'relative',
            bottom: '-2px',
          }}
          onMouseEnter={(e) => {
            if (activeTab !== 'files') {
              e.currentTarget.style.background = 'var(--hover)';
              e.currentTarget.style.color = '#28a745';
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== 'files') {
              e.currentTarget.style.background = 'var(--bg-secondary)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }
          }}
        >
          📎 Файлы
        </button>

        <button
          onClick={() => setActiveTab('comments')}
          style={{
            padding: '0.75rem 1.5rem',
            background: activeTab === 'comments' ? '#17a2b8' : 'var(--bg-secondary)',
            color: activeTab === 'comments' ? 'white' : 'var(--text-primary)',
            border: activeTab === 'comments' ? 'none' : '1px solid var(--border)',
            borderBottom: activeTab === 'comments' ? 'none' : '1px solid var(--border)',
            borderRadius: '8px 8px 0 0',
            cursor: 'pointer',
            fontWeight: activeTab === 'comments' ? '600' : '500',
            fontSize: '1rem',
            transition: 'all 0.2s ease',
            position: 'relative',
            bottom: '-2px',
          }}
          onMouseEnter={(e) => {
            if (activeTab !== 'comments') {
              e.currentTarget.style.background = 'var(--hover)';
              e.currentTarget.style.color = '#17a2b8';
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== 'comments') {
              e.currentTarget.style.background = 'var(--bg-secondary)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }
          }}
        >
          💬 Комментарии
        </button>
      </div>

      {/* Вкладка Информация */}
      {activeTab === 'info' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
            <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <h3 style={{ marginTop: 0, color: 'var(--text-primary)' }}>Статус и приоритет</h3>
              <p>
                <span style={{ display: 'inline-block', padding: '0.25rem 0.5rem', borderRadius: '4px', backgroundColor: getStatusColor(task.status), color: 'white' }}>
                  {getStatusText(task.status)}
                </span>
                {' '}
                <span style={{ display: 'inline-block', padding: '0.25rem 0.5rem', borderRadius: '4px', backgroundColor: getPriorityColor(task.priority), color: 'white' }}>
                  {getPriorityText(task.priority)}
                </span>
              </p>
            </div>

            <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <h3 style={{ marginTop: 0, color: 'var(--text-primary)' }}>Срок выполнения</h3>
              <p style={{ color: 'var(--text-primary)' }}>📅 Срок: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Не указан'}</p>
              {timeUntilDue && (
                <p style={{ color: timeUntilDue.color }}>
                  ⏰ {timeUntilDue.text}
                </p>
              )}
            </div>

            <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <h3 style={{ marginTop: 0, color: 'var(--text-primary)' }}>Затраченное время</h3>
              <p style={{ color: 'var(--text-primary)' }}>⏲️ Всего: {formatMinutes(totalTime)}</p>
              <p style={{ color: 'var(--text-primary)' }}>📊 Количество сессий: {timeEntries.length}</p>
            </div>
          </div>

          {task.description && (
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ color: 'var(--text-primary)' }}>Описание</h2>
              <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <p style={{ margin: 0, whiteSpace: 'pre-wrap', color: 'var(--text-primary)' }}>{task.description}</p>
              </div>
            </div>
          )}

          {/* История временных интервалов */}
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ color: 'var(--text-primary)' }}>История времени</h2>
            {entriesLoading ? (
              <p style={{ color: 'var(--text-primary)' }}>Загрузка...</p>
            ) : timeEntries.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>Нет записей о времени</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--table-header)', borderBottom: '2px solid var(--table-border)' }}>
                      <th style={{ padding: '0.75rem', textAlign: 'left', color: 'var(--text-primary)' }}>Дата</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', color: 'var(--text-primary)' }}>Начало</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', color: 'var(--text-primary)' }}>Конец</th>
                      <th style={{ padding: '0.75rem', textAlign: 'right', color: 'var(--text-primary)' }}>Длительность</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...timeEntries].reverse().map((entry: any) => (
                      <tr key={entry._id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '0.75rem', color: 'var(--text-primary)' }}>{new Date(entry.startTime).toLocaleDateString()}</td>
                        <td style={{ padding: '0.75rem', color: 'var(--text-primary)' }}>{new Date(entry.startTime).toLocaleTimeString()}</td>
                        <td style={{ padding: '0.75rem', color: 'var(--text-primary)' }}>{entry.endTime ? new Date(entry.endTime).toLocaleTimeString() : '—'}</td>
                        <td style={{ padding: '0.75rem', textAlign: 'right', color: 'var(--text-primary)' }}>{formatMinutes(entry.durationMinutes)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Вкладка Файлы */}
      {activeTab === 'files' && (
        <div>
          <FileUploader
            type="task"
            id={id!}
            onUploadComplete={() => setFileRefreshTrigger(prev => prev + 1)}
          />
          <div style={{ marginTop: '1rem' }}>
            <h4 style={{ color: 'var(--text-primary)' }}>Прикреплённые файлы</h4>
            <FileList type="task" id={id!} refreshTrigger={fileRefreshTrigger} />
          </div>
        </div>
      )}

      {/* Вкладка Комментарии */}
      {activeTab === 'comments' && (
        <div>
          <form onSubmit={handleAddComment} style={{ marginBottom: '1rem', display: 'flex', gap: '1rem' }}>
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Написать комментарий..."
              style={{ flex: 1, padding: '0.5rem', border: '1px solid var(--input-border)', borderRadius: '4px', backgroundColor: 'var(--input-bg)', color: 'var(--input-text)' }}
            />
            <button
              type="submit"
              disabled={!newComment.trim()}
              style={{ padding: '0.5rem 1rem', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Отправить
            </button>
          </form>

          {commentsLoading ? (
            <p style={{ color: 'var(--text-primary)' }}>Загрузка комментариев...</p>
          ) : comments.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>Нет комментариев. Будьте первым!</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {comments.map((comment: any) => (
                <div key={comment._id} style={{ backgroundColor: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <strong style={{ color: 'var(--text-primary)' }}>{comment.authorName || 'Пользователь'}</strong>
                      <small style={{ color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>
                        {new Date(comment.createdAt).toLocaleString()}
                      </small>
                      <p style={{ margin: '0.5rem 0 0', whiteSpace: 'pre-wrap', color: 'var(--text-primary)' }}>{comment.text}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteComment(comment._id)}
                      style={{ background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer', fontSize: '1.25rem' }}
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}