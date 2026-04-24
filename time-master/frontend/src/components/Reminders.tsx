import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

export default function Reminders() {
  const { items: tasks } = useSelector((state: any) => state.tasks);
  const { items: projects } = useSelector((state: any) => state.projects);
  const navigate = useNavigate();
  const [reminders, setReminders] = useState<any[]>([]);

  useEffect(() => {
    const now = new Date();
    const upcoming: any[] = [];

    tasks.forEach((task: any) => {
      if (!task.dueDate || task.status === 'done') return;

      const dueDate = new Date(task.dueDate);
      const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays >= 0 && diffDays <= 3) {
        const project = projects.find((p: any) => p._id === task.project);
        upcoming.push({
          ...task,
          projectName: project?.name,
          daysLeft: diffDays,
          isOverdue: false,
        });
      }

      if (dueDate < now) {
        const project = projects.find((p: any) => p._id === task.project);
        upcoming.push({
          ...task,
          projectName: project?.name,
          daysLeft: Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
          isOverdue: true,
        });
      }
    });

    upcoming.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    setReminders(upcoming.slice(0, 10));
  }, [tasks, projects]);

  const getReminderColor = (daysLeft: number, isOverdue: boolean) => {
    if (isOverdue) return '#dc3545';
    if (daysLeft === 0) return '#ffc107';
    if (daysLeft === 1) return '#fd7e14';
    return '#28a745';
  };

  const getReminderText = (daysLeft: number, isOverdue: boolean) => {
    if (isOverdue) return 'Просрочено';
    if (daysLeft === 0) return 'Сегодня';
    if (daysLeft === 1) return 'Завтра';
    return `${daysLeft} дн.`;
  };

  if (reminders.length === 0) {
    return (
      <div style={{ padding: '1rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Нет активных напоминаний</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '1rem' }}>
      <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Напоминания</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {reminders.map((reminder) => (
          <div
            key={reminder._id}
            onClick={() => navigate(`/tasks/${reminder._id}`)}
            style={{
              padding: '0.75rem',
              backgroundColor: 'var(--bg-secondary)',
              borderLeft: `4px solid ${getReminderColor(reminder.daysLeft, reminder.isOverdue)}`,
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(4px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <strong style={{ color: 'var(--text-primary)' }}>{reminder.title}</strong>
                {reminder.projectName && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>
                    📁 {reminder.projectName}
                  </span>
                )}
              </div>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 'bold',
                color: getReminderColor(reminder.daysLeft, reminder.isOverdue),
              }}>
                {getReminderText(reminder.daysLeft, reminder.isOverdue)}
              </span>
            </div>
            {reminder.dueDate && (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                📅 {new Date(reminder.dueDate).toLocaleDateString()}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}