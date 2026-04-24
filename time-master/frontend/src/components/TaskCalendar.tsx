import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

interface TaskCalendarProps {
  onDateSelect: (date: Date) => void;
}

export default function TaskCalendar({ onDateSelect }: TaskCalendarProps) {
  const { items: tasks } = useSelector((state: any) => state.tasks);
  const [markedDates, setMarkedDates] = useState<Set<string>>(new Set());

  useEffect(() => {
    const dates = new Set<string>();
    tasks.forEach((task: any) => {
      if (task.dueDate) {
        const date = new Date(task.dueDate).toISOString().split('T')[0];
        dates.add(date);
      }
    });
    setMarkedDates(dates);
  }, [tasks]);

  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const dateStr = date.toISOString().split('T')[0];
      if (markedDates.has(dateStr)) {
        return (
          <div style={{
            width: '8px',
            height: '8px',
            backgroundColor: '#dc3545',
            borderRadius: '50%',
            margin: '2px auto 0',
          }} />
        );
      }
    }
    return null;
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Календарь задач</h3>
      <Calendar
        onChange={(value) => onDateSelect(value as Date)}
        tileContent={tileContent}
        locale="ru-RU"
      />
      <style>{`
        .react-calendar {
          background-color: var(--bg-card) !important;
          color: var(--text-primary) !important;
          border: none !important;
          border-radius: 8px;
          width: 100%;
        }
        .react-calendar__tile {
          background-color: var(--bg-card) !important;
          color: var(--text-primary) !important;
        }
        .react-calendar__tile:enabled:hover {
          background-color: var(--hover) !important;
        }
        .react-calendar__navigation button {
          color: var(--text-primary) !important;
          background: none;
        }
        .react-calendar__navigation button:enabled:hover {
          background-color: var(--hover) !important;
        }
        .react-calendar__tile--active {
          background: var(--primary) !important;
          color: white !important;
        }
        .react-calendar__tile--now {
          background: var(--warning) !important;
          color: #333 !important;
        }
        .react-calendar__month-view__weekdays {
          color: var(--text-secondary) !important;
        }
        .react-calendar__month-view__weekdays abbr {
          text-decoration: none;
        }
      `}</style>
    </div>
  );
}