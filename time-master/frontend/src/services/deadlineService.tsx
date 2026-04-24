import toast from 'react-hot-toast';

export interface Task {
  _id: string;
  title: string;
  dueDate?: string;
  status: string;
  project?: string;
}

export interface Project {
  _id: string;
  name: string;
}

// Ключ для хранения прочитанных уведомлений в localStorage
const STORAGE_KEY = 'read_notifications';

// Коллбэк для обновления счётчика уведомлений
let onNotificationReadCallback: (() => void) | null = null;

// Регистрация коллбэка для обновления счётчика
export const setOnNotificationRead = (callback: () => void) => {
  onNotificationReadCallback = callback;
};

// Получить прочитанные уведомления из localStorage
const getReadNotifications = (): Set<string> => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    return new Set(JSON.parse(saved));
  }
  return new Set();
};

// Сохранить прочитанные уведомления в localStorage
const saveReadNotifications = (readSet: Set<string>) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(readSet)));
};

// Отметить уведомление как прочитанное
export const markNotificationAsRead = (notificationKey: string): void => {
  const readSet = getReadNotifications();
  readSet.add(notificationKey);
  saveReadNotifications(readSet);

  // Вызываем коллбэк для обновления счётчика
  if (onNotificationReadCallback) {
    onNotificationReadCallback();
  }
};

// Проверить, было ли уведомление прочитано
const isNotificationRead = (notificationKey: string): boolean => {
  const readSet = getReadNotifications();
  return readSet.has(notificationKey);
};

// Очистить все прочитанные уведомления (при выходе из системы)
export const clearReadNotifications = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

// Проверка, является ли дата сегодня
const isToday = (date: Date): boolean => {
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

// Проверка, является ли дата завтра
const isTomorrow = (date: Date): boolean => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return date.toDateString() === tomorrow.toDateString();
};

// Проверка, просрочена ли задача
const isOverdue = (dueDate: Date): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return dueDate < today;
};

// Форматирование даты
const formatDate = (date: Date): string => {
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
  });
};

// Получение задач с приближающимся дедлайном (только непрочитанные)
export const getUnreadTasksWithDeadlines = (tasks: Task[]): {
  todayTasks: Task[];
  tomorrowTasks: Task[];
  overdueTasks: Task[];
} => {
  const todayTasks: Task[] = [];
  const tomorrowTasks: Task[] = [];
  const overdueTasks: Task[] = [];

  tasks.forEach((task) => {
    if (!task.dueDate || task.status === 'done') return;

    const dueDate = new Date(task.dueDate);
    let type = '';

    if (isOverdue(dueDate)) {
      type = 'overdue';
    } else if (isToday(dueDate)) {
      type = 'today';
    } else if (isTomorrow(dueDate)) {
      type = 'tomorrow';
    } else {
      return;
    }

    const notificationKey = `${task._id}_${type}`;

    // Пропускаем уже прочитанные уведомления
    if (isNotificationRead(notificationKey)) return;

    if (type === 'overdue') {
      overdueTasks.push(task);
    } else if (type === 'today') {
      todayTasks.push(task);
    } else if (type === 'tomorrow') {
      tomorrowTasks.push(task);
    }
  });

  return { todayTasks, tomorrowTasks, overdueTasks };
};

// Создание уникального ключа для уведомления
const getNotificationKey = (taskId: string, type: string): string => {
  return `${taskId}_${type}`;
};

// Создание JSX элемента для уведомления с крестиком закрытия
const createNotificationContent = (
  title: string,
  message: string,
  details: string,
  buttonText: string,
  buttonColor: string,
  onButtonClick: () => void,
  onDismiss: (toastId: string) => void,
  toastId: string,
  notificationKey: string
) => {
  const handleDismiss = () => {
    markNotificationAsRead(notificationKey);
    onDismiss(toastId);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', position: 'relative' }}>
      <button
        onClick={handleDismiss}
        style={{
          position: 'absolute',
          top: '-8px',
          right: '-8px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: '1.25rem',
          color: '#999',
          padding: '0',
          width: '24px',
          height: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          backgroundColor: 'var(--bg-card)',
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = '#dc3545'}
        onMouseLeave={(e) => e.currentTarget.style.color = '#999'}
      >
        ×
      </button>
      <strong>{title}</strong>
      <div>{message}</div>
      <small style={{ color: '#666' }}>{details}</small>
      <button
        onClick={() => {
          markNotificationAsRead(notificationKey);
          onButtonClick();
        }}
        style={{
          marginTop: '8px',
          padding: '4px 12px',
          backgroundColor: buttonColor,
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        {buttonText}
      </button>
    </div>
  );
};

// Показ уведомлений (только непрочитанных)
export const showDeadlineNotifications = (
  tasks: Task[],
  projects: Project[],
  onTaskClick?: (taskId: string) => void
): void => {
  const { todayTasks, tomorrowTasks, overdueTasks } = getUnreadTasksWithDeadlines(tasks);

  // Просроченные задачи
  if (overdueTasks.length > 0) {
    overdueTasks.forEach((task) => {
      const notificationKey = getNotificationKey(task._id, 'overdue');
      const project = projects.find((p) => p._id === task.project);
      const dueDate = new Date(task.dueDate!);

      toast.error(
        (t) => createNotificationContent(
          '⚠️ Просрочена задача!',
          task.title,
          `${project?.name ? `Проект: ${project.name} • ` : ''}Срок был: ${formatDate(dueDate)}`,
          'Перейти к задаче',
          '#dc3545',
          () => {
            toast.dismiss(t.id);
            if (onTaskClick) onTaskClick(task._id);
          },
          (id) => toast.dismiss(id),
          t.id,
          notificationKey
        ),
        {
          duration: 10000,
          position: 'top-right',
        }
      );
    });
  }

  // Задачи на сегодня
  if (todayTasks.length > 0) {
    todayTasks.forEach((task) => {
      const notificationKey = getNotificationKey(task._id, 'today');
      const project = projects.find((p) => p._id === task.project);

      toast(
        (t) => createNotificationContent(
          '⏰ Дедлайн сегодня!',
          task.title,
          project?.name ? `Проект: ${project.name}` : '',
          'Перейти к задаче',
          '#007bff',
          () => {
            toast.dismiss(t.id);
            if (onTaskClick) onTaskClick(task._id);
          },
          (id) => toast.dismiss(id),
          t.id,
          notificationKey
        ),
        {
          duration: 8000,
          position: 'top-right',
          icon: '🔔',
        }
      );
    });
  }

  // Задачи на завтра
  if (tomorrowTasks.length > 0) {
    tomorrowTasks.forEach((task) => {
      const notificationKey = getNotificationKey(task._id, 'tomorrow');
      const project = projects.find((p) => p._id === task.project);
      const dueDate = new Date(task.dueDate!);

      toast(
        (t) => createNotificationContent(
          '📅 Дедлайн завтра',
          task.title,
          `${project?.name ? `Проект: ${project.name} • ` : ''}Срок: ${formatDate(dueDate)}`,
          'Перейти к задаче',
          '#28a745',
          () => {
            toast.dismiss(t.id);
            if (onTaskClick) onTaskClick(task._id);
          },
          (id) => toast.dismiss(id),
          t.id,
          notificationKey
        ),
        {
          duration: 6000,
          position: 'top-right',
          icon: '📅',
        }
      );
    });
  }
};

// Подсчёт количества непрочитанных уведомлений
export const getNotificationCount = (tasks: Task[]): number => {
  const { todayTasks, tomorrowTasks, overdueTasks } = getUnreadTasksWithDeadlines(tasks);
  return todayTasks.length + tomorrowTasks.length + overdueTasks.length;
};