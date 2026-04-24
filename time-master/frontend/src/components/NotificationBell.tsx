import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import toast, { Toaster } from 'react-hot-toast';
import {
  getNotificationCount,
  showDeadlineNotifications,
  clearReadNotifications,
  setOnNotificationRead
} from '../services/deadlineService';

interface NotificationBellProps {
  onTaskClick?: (taskId: string) => void;
}

export default function NotificationBell({ onTaskClick }: NotificationBellProps) {
  const { items: tasks } = useSelector((state: any) => state.tasks);
  const { items: projects } = useSelector((state: any) => state.projects);
  const [notificationCount, setNotificationCount] = useState(0);
  const [lastChecked, setLastChecked] = useState<Date>(new Date());

  // Функция обновления счётчика
  const updateCount = () => {
    const count = getNotificationCount(tasks);
    setNotificationCount(count);
  };

  // Регистрируем коллбэк для обновления счётчика при прочтении уведомления
  useEffect(() => {
    setOnNotificationRead(updateCount);
    return () => {
      setOnNotificationRead(null);
    };
  }, [tasks]);

  // Очистка прочитанных уведомлений при размонтировании компонента (выход из системы)
  useEffect(() => {
    return () => {
      clearReadNotifications();
    };
  }, []);

  // Проверка дедлайнов при загрузке и каждые 5 минут
  useEffect(() => {
    const checkDeadlines = () => {
      if (tasks.length > 0 && projects.length > 0) {
        const count = getNotificationCount(tasks);
        setNotificationCount(count);

        const now = new Date();
        const minutesSinceLastCheck = (now.getTime() - lastChecked.getTime()) / 60000;

        // Показываем уведомления только если есть непрочитанные
        if (minutesSinceLastCheck > 10 && count > 0) {
          showDeadlineNotifications(tasks, projects, onTaskClick);
          setLastChecked(now);
          // Обновляем счётчик после показа уведомлений
          setTimeout(() => {
            setNotificationCount(getNotificationCount(tasks));
          }, 1000);
        }
      }
    };

    const timer = setTimeout(checkDeadlines, 2000);
    const interval = setInterval(checkDeadlines, 300000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [tasks, projects, onTaskClick]);

  const handleClick = () => {
    showDeadlineNotifications(tasks, projects, onTaskClick);
  };

  // Если нет непрочитанных уведомлений - не показываем колокольчик
  if (notificationCount === 0) {
    return null;
  }

  return (
    <>
      <button
        onClick={handleClick}
        style={{
          position: 'fixed',
          top: '1rem',
          right: '1rem',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: '1.5rem',
          padding: '0.5rem',
          borderRadius: '50%',
          backgroundColor: 'var(--bg-card)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '44px',
          height: '44px',
        }}
      >
        🔔
        <span
          style={{
            position: 'absolute',
            top: '-4px',
            right: '-4px',
            backgroundColor: '#dc3545',
            color: 'white',
            borderRadius: '50%',
            padding: '2px 6px',
            fontSize: '0.7rem',
            minWidth: '18px',
            textAlign: 'center',
            fontWeight: 'bold',
          }}
        >
          {notificationCount > 9 ? '9+' : notificationCount}
        </span>
      </button>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 8000,
          style: {
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
          },
        }}
      />
    </>
  );
}