import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchActiveTimer, stopTimer } from '../store/slices/timeEntriesSlice';

export default function GlobalTimer() {
  const dispatch = useDispatch();
  const { activeTimer, isLoading } = useSelector((state: any) => state.timeEntries);
  const { items: tasks } = useSelector((state: any) => state.tasks);

  useEffect(() => {
    dispatch(fetchActiveTimer() as any);
  }, [dispatch]);

  const getTaskTitle = () => {
    if (!activeTimer) return '';
    const task = tasks.find((t: any) => t._id === activeTimer.task);
    return task?.title || 'Задача';
  };

  if (!activeTimer || activeTimer.endTime) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      backgroundColor: '#28a745',
      color: 'white',
      padding: '0.75rem 1.5rem',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      zIndex: 1000,
    }}>
      <span>⏱️ Таймер активен: {getTaskTitle()}</span>
      <button
        onClick={() => dispatch(stopTimer() as any)}
        disabled={isLoading}
        style={{
          padding: '0.25rem 0.75rem',
          backgroundColor: '#dc3545',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        Остановить
      </button>
    </div>
  );
}