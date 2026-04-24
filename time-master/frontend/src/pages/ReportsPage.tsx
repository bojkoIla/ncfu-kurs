import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTimeByProjects } from '../store/slices/reportsSlice';
import { exportToCSV } from '../services/exportService';
import { exportReportToPDF } from '../services/htmlExportService';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function ReportsPage() {
  const dispatch = useDispatch();
  const { timeByProjects, isLoading, error } = useSelector(
    (state: any) => state.reports
  );

  const [period, setPeriod] = useState('week');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const now = new Date();
    const end = now.toISOString().split('T')[0];
    let start = new Date();

    if (period === 'week') {
      start.setDate(now.getDate() - 7);
    } else if (period === 'month') {
      start.setMonth(now.getMonth() - 1);
    } else if (period === 'year') {
      start.setFullYear(now.getFullYear() - 1);
    }

    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end);
  }, [period]);

  useEffect(() => {
    if (startDate && endDate) {
      dispatch(fetchTimeByProjects({ startDate, endDate }) as any);
    }
  }, [dispatch, startDate, endDate]);

  const handleApplyDates = () => {
    if (startDate && endDate) {
      dispatch(fetchTimeByProjects({ startDate, endDate }) as any);
    }
  };

  const totalMinutes = timeByProjects.reduce((sum: number, p: any) => sum + (p.totalMinutes || 0), 0);

  const handleExportCSV = () => {
    const columns = [
      { key: 'projectName', label: 'Проект' },
      { key: 'totalMinutes', label: 'Время (мин)' },
      { key: 'percentage', label: 'Доля' },
    ];
    const data = timeByProjects.map((p: any) => ({
      projectName: p.projectName,
      totalMinutes: p.totalMinutes,
      percentage: totalMinutes > 0 ? `${Math.round((p.totalMinutes / totalMinutes) * 100)}%` : '0%',
    }));
    exportToCSV(data, `reports_${period}_${startDate}_${endDate}`, columns);
  };

  const handleExportPDF = async () => {
    await exportReportToPDF(timeByProjects, totalMinutes, period, `Отчёт_по_проектам_${period}`);
  };

  const formatMinutes = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}ч ${mins}м`;
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FF6B6B', '#4ECDC4'];

  if (isLoading && timeByProjects.length === 0) {
    return <div style={{ padding: '2rem', color: 'var(--text-primary)' }}>Загрузка...</div>;
  }

  if (error) {
    return <div style={{ padding: '2rem', color: 'red' }}>Ошибка: {error}</div>;
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ color: 'var(--text-primary)' }}>Отчёты и аналитика</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
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
        </div>
      </div>

      {/* Фильтры по периоду */}
      <div
        style={{
          marginTop: '1rem',
          marginBottom: '2rem',
          padding: '1rem',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: '8px',
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <label style={{ marginRight: '0.5rem', color: 'var(--text-primary)' }}>Период:</label>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)', backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)' }}
          >
            <option value="week">Неделя</option>
            <option value="month">Месяц</option>
            <option value="year">Год</option>
            <option value="custom">Свой</option>
          </select>
        </div>

        {(period === 'custom' || !startDate) && (
          <>
            <div>
              <label style={{ marginRight: '0.5rem', color: 'var(--text-primary)' }}>С:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)', backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)' }}
              />
            </div>
            <div>
              <label style={{ marginRight: '0.5rem', color: 'var(--text-primary)' }}>По:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)', backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)' }}
              />
            </div>
            <button
              onClick={handleApplyDates}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Применить
            </button>
          </>
        )}
      </div>

      {/* Общая статистика */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div style={{ padding: '1rem', backgroundColor: 'var(--bg-card)', borderRadius: '8px', boxShadow: 'var(--shadow)' }}>
          <h3 style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Проектов с активностью</h3>
          <p style={{ fontSize: '2rem', margin: '0.5rem 0 0', fontWeight: 'bold', color: 'var(--text-primary)' }}>{timeByProjects.length}</p>
        </div>
        <div style={{ padding: '1rem', backgroundColor: 'var(--bg-card)', borderRadius: '8px', boxShadow: 'var(--shadow)' }}>
          <h3 style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Общее время</h3>
          <p style={{ fontSize: '2rem', margin: '0.5rem 0 0', fontWeight: 'bold', color: 'var(--text-primary)' }}>
            {formatMinutes(totalMinutes)}
          </p>
        </div>
      </div>

      {/* Круговая диаграмма времени по проектам */}
      <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '8px', padding: '1rem', boxShadow: 'var(--shadow)' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Время по проектам</h2>
        {timeByProjects.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Нет данных за выбранный период</p>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={timeByProjects}
                dataKey="totalMinutes"
                nameKey="projectName"
                cx="50%"
                cy="50%"
                outerRadius={120}
                label={(entry: any) => `${entry.projectName}: ${formatMinutes(entry.totalMinutes)}`}
              >
                {timeByProjects.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatMinutes(value)} contentStyle={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} />
              <Legend wrapperStyle={{ color: 'var(--text-primary)' }} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Таблица проектов */}
      <div style={{ marginTop: '2rem', backgroundColor: 'var(--bg-card)', borderRadius: '8px', padding: '1rem', boxShadow: 'var(--shadow)' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Детализация по проектам</h2>
        {timeByProjects.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Нет данных за выбранный период</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--table-header)', borderBottom: '2px solid var(--table-border)' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left', color: 'var(--text-primary)' }}>Проект</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right', color: 'var(--text-primary)' }}>Время</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right', color: 'var(--text-primary)' }}>Доля</th>
                </tr>
              </thead>
              <tbody>
                {timeByProjects.map((project: any, index: number) => (
                  <tr key={index} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '0.75rem', color: 'var(--text-primary)' }}>{project.projectName}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'right', color: 'var(--text-primary)' }}>{formatMinutes(project.totalMinutes)}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'right', color: 'var(--text-primary)' }}>
                      {totalMinutes > 0 ? Math.round((project.totalMinutes / totalMinutes) * 100) : 0}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}