import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Экспорт в CSV
export const exportToCSV = (data: any[], filename: string, columns: { key: string; label: string }[]) => {
  // Заголовки
  const headers = columns.map(col => col.label);

  // Строки данных
  const rows = data.map(item =>
    columns.map(col => {
      let value = item[col.key];
      // Форматирование даты
      if (col.key.includes('Date') || col.key.includes('date') || col.key === 'dueDate') {
        value = value ? new Date(value).toLocaleDateString() : '';
      }
      // Форматирование времени
      if (col.key === 'durationMinutes' && value) {
        const hours = Math.floor(value / 60);
        const mins = value % 60;
        value = `${hours}ч ${mins}м`;
      }
      return value;
    })
  );

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Экспорт в PDF
export const exportToPDF = (data: any[], title: string, columns: { key: string; label: string }[]) => {
  const doc = new jsPDF();

  // Заголовок
  doc.setFontSize(18);
  doc.text(title, 14, 20);
  doc.setFontSize(10);
  doc.text(`Дата экспорта: ${new Date().toLocaleString()}`, 14, 30);

  // Подготовка данных для таблицы
  const tableData = data.map(item =>
    columns.map(col => {
      let value = item[col.key];
      if (col.key.includes('Date') || col.key.includes('date') || col.key === 'dueDate') {
        value = value ? new Date(value).toLocaleDateString() : '';
      }
      if (col.key === 'durationMinutes' && value) {
        const hours = Math.floor(value / 60);
        const mins = value % 60;
        value = `${hours}ч ${mins}м`;
      }
      return value || '';
    })
  );

  // Создание таблицы
  autoTable(doc, {
    head: [columns.map(col => col.label)],
    body: tableData,
    startY: 40,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    alternateRowStyles: { fillColor: [240, 240, 240] },
  });

  doc.save(`${title}.pdf`);
};

// Экспорт отчёта по проектам
export const exportProjectsReport = (projects: any[], totalMinutes: number) => {
  const columns = [
    { key: 'projectName', label: 'Проект' },
    { key: 'totalMinutes', label: 'Время' },
    { key: 'percentage', label: 'Доля' },
  ];

  const data = projects.map(p => ({
    projectName: p.projectName,
    totalMinutes: p.totalMinutes,
    percentage: totalMinutes > 0 ? `${Math.round((p.totalMinutes / totalMinutes) * 100)}%` : '0%',
  }));

  return { columns, data };
};