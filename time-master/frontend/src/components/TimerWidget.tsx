import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { startTimer, stopTimer, fetchActiveTimer } from '../store/slices/timeEntriesSlice';

interface TimerWidgetProps {
  taskId?: string;
  taskTitle?: string;
  onTimerStart?: () => void;
  onTimerStop?: () => void;
}

export default function TimerWidget({ taskId, taskTitle, onTimerStart, onTimerStop }: TimerWidgetProps) {
  const dispatch = useDispatch();
  const { activeTimer, isLoading } = useSelector((state: any) => state.timeEntries);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  // Проверяем активный таймер при загрузке
  useEffect(() => {
    dispatch(fetchActiveTimer() as any);
  }, [dispatch]);

  // Обновляем elapsedSeconds, когда есть активный таймер
  useEffect(() => {
    if (activeTimer && activeTimer.startTime && !activeTimer.endTime) {
      setIsRunning(true);
      const startTime = new Date(activeTimer.startTime).getTime();

      const updateElapsed = () => {
        const now = Date.now();
        const elapsed = Math.floor((now - startTime) / 1000);
        setElapsedSeconds(elapsed);
      };

      updateElapsed();
      const interval = setInterval(updateElapsed, 1000);

      return () => clearInterval(interval);
    } else {
      setIsRunning(false);
      setElapsedSeconds(0);
    }
  }, [activeTimer]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = async () => {
    if (!taskId) return;
    await dispatch(startTimer(taskId) as any);
    if (onTimerStart) onTimerStart();
  };

  const handleStop = async () => {
    await dispatch(stopTimer() as any);
    setIsRunning(false);
    setElapsedSeconds(0);
    if (onTimerStop) onTimerStop();
  };

  // Если передан taskId и нет активного таймера для этой задачи, показываем кнопку старта
  if (taskId && (!activeTimer || activeTimer.task !== taskId)) {
    return (
      <button
        onClick={handleStart}
        disabled={isLoading}
        style={{
          padding: '0.25rem 0.75rem',
          backgroundColor: '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '0.875rem',
        }}
      >
        ▶ Запустить таймер
      </button>
    );
  }

  // Если есть активный таймер для этой задачи, показываем его
  if (activeTimer && activeTimer.task === taskId && isRunning) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{
          fontFamily: 'monospace',
          fontSize: '1rem',
          fontWeight: 'bold',
          color: '#28a745',
        }}>
          ⏱️ {formatTime(elapsedSeconds)}
        </span>
        <button
          onClick={handleStop}
          disabled={isLoading}
          style={{
            padding: '0.25rem 0.75rem',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.875rem',
          }}
        >
          ⏹ Остановить
        </button>
      </div>
    );
  }

  // Если активный таймер для другой задачи, показываем сообщение
  if (activeTimer && !activeTimer.endTime && activeTimer.task !== taskId) {
    return (
      <span style={{ fontSize: '0.875rem', color: '#ffc107' }}>
        ⏳ Таймер активен в другой задаче
      </span>
    );
  }

  return null;
}