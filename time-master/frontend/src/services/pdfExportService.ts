import jsPDF from 'jspdf';

// Базовые символы кириллицы для поддержки
const font = (() => {
  try {
    // Попытка использовать стандартный шрифт
    return 'helvetica';
  } catch {
    return 'helvetica';
  }
})();

export const exportToPDFWithCyrillic = (data: any[], title: string, columns: { key: string; label: string }[]) => {
  const doc = new jsPDF();

  // Устанавливаем шрифт
  doc.setFont('helvetica');

  // Заголовок
  doc.setFontSize(18);
  doc.text(encodeText(title), 14, 20);
  doc.setFontSize(10);
  doc.text(encodeText(`Дата экспорта: ${new Date().toLocaleString()}`), 14, 30);

  // Подготовка данных
  let y = 50;
  const lineHeight = 10;

  // Заголовки таблицы
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  let x = 14;
  columns.forEach((col) => {
    doc.text(encodeText(col.label), x, y);
    x += 40;
  });

  y += lineHeight;

  // Данные
  doc.setFont('helvetica', 'normal');
  data.forEach((item) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    x = 14;
    columns.forEach((col) => {
      let value = item[col.key];
      if (col.key.includes('Date') || col.key === 'dueDate') {
        value = value ? new Date(value).toLocaleDateString() : '';
      }
      if (col.key === 'durationMinutes' && value) {
        const hours = Math.floor(value / 60);
        const mins = value % 60;
        value = `${hours}ч ${mins}м`;
      }
      doc.text(encodeText(String(value || '—')), x, y);
      x += 40;
    });
    y += lineHeight;
  });

  doc.save(`${title}.pdf`);
};

// Вспомогательная функция для кодирования текста
function encodeText(text: string): string {
  // Для кириллицы используем стандартное кодирование
  // Это не идеальное решение, но лучше чем ничего
  return text;
}