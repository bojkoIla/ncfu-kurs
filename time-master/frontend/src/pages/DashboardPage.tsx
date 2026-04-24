import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProjects } from '../store/slices/projectsSlice';
import { fetchTasks } from '../store/slices/tasksSlice';
import { fetchActiveTimer } from '../store/slices/timeEntriesSlice';
import TaskCalendar from '../components/TaskCalendar';
import Reminders from '../components/Reminders';
import ProjectView from '../components/ProjectView';

export default function DashboardPage() {
  const dispatch = useDispatch();
  const { token } = useSelector((state: any) => state.auth);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    if (token) {
      dispatch(fetchProjects() as any);
      dispatch(fetchTasks({}) as any);
      dispatch(fetchActiveTimer() as any);
    }
  }, [dispatch, token]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    alert(`Выбрана дата: ${date.toLocaleDateString()}`);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem' }}>Дашборд</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
        {/* Календарь задач */}
        <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          <TaskCalendar onDateSelect={handleDateSelect} />
        </div>

        {/* Напоминания */}
        <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          <Reminders />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
        {/* Просмотр проекта и его задач */}
        <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', overflow: 'auto' }}>
          <ProjectView />
        </div>
      </div>
    </div>
  );
}