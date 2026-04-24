import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const exportToPDFFromHTML = async (elementId: string, filename: string) => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('Element not found:', elementId);
    alert('Элемент для экспорта не найден');
    return;
  }

  try {
    // Показываем индикатор загрузки
    const loadingToast = document.createElement('div');
    loadingToast.textContent = 'Генерация PDF...';
    loadingToast.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #007bff;
      color: white;
      padding: 10px 20px;
      border-radius: 8px;
      z-index: 10000;
      font-family: Arial, sans-serif;
    `;
    document.body.appendChild(loadingToast);

    const canvas = await html2canvas(element, {
      scale: 2, // Высокое качество
      backgroundColor: '#ffffff',
      logging: false,
      useCORS: true, // Для загрузки изображений
      allowTaint: false,
    });

    const imgData = canvas.toDataURL('image/png');
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      doc.addPage();
      doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    doc.save(`${filename}.pdf`);

    // Убираем индикатор загрузки
    document.body.removeChild(loadingToast);
  } catch (error) {
    console.error('PDF export error:', error);
    alert('Ошибка при экспорте PDF. Пожалуйста, попробуйте ещё раз.');
  }
};

// Экспорт таблицы задач
export const exportTasksToPDF = async (tasks: any[], projects: any[], filename: string = 'Задачи') => {
  // Создаём временный контейнер для рендеринга
  const container = document.createElement('div');
  container.style.cssText = `
    position: fixed;
    top: -9999px;
    left: -9999px;
    width: 800px;
    background: white;
    padding: 20px;
    font-family: Arial, Helvetica, sans-serif;
    font-size: 12px;
  `;

  // Создаём HTML для экспорта
  container.innerHTML = `
    <div style="padding: 20px;">
      <h1 style="color: #333; margin-bottom: 20px;">${filename}</h1>
      <p style="color: #666; margin-bottom: 20px;">Дата экспорта: ${new Date().toLocaleString()}</p>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background-color: #007bff; color: white;">
            <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Название</th>
            <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Проект</th>
            <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Статус</th>
            <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Приоритет</th>
            <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Срок</th>
            <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Оценка (ч)</th>
          </tr>
        </thead>
        <tbody>
          ${tasks.map((task: any) => {
            const project = projects.find((p: any) => p._id === task.project);
            const statusMap: any = { todo: 'К выполнению', in_progress: 'В процессе', done: 'Выполнено' };
            const priorityMap: any = { low: 'Низкий', medium: 'Средний', high: 'Высокий' };
            return `
              <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 8px; border: 1px solid #ddd;">${task.title || '—'}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${project?.name || '—'}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${statusMap[task.status] || task.status}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${priorityMap[task.priority] || task.priority}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${task.estimatedHours || 0}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;

  document.body.appendChild(container);
  await exportToPDFFromHTML(container.id || (() => {
    const id = 'temp-export-container';
    container.id = id;
    return id;
  })(), filename);
  document.body.removeChild(container);
};

// Экспорт отчёта по проектам
export const exportReportToPDF = async (projects: any[], totalMinutes: number, period: string, filename: string = 'Отчёт_по_проектам') => {
  const container = document.createElement('div');
  container.style.cssText = `
    position: fixed;
    top: -9999px;
    left: -9999px;
    width: 600px;
    background: white;
    padding: 20px;
    font-family: Arial, Helvetica, sans-serif;
    font-size: 12px;
  `;

  const formatMinutes = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}ч ${mins}м`;
  };

  container.innerHTML = `
    <div style="padding: 20px;">
      <h1 style="color: #333; margin-bottom: 20px;">${filename}</h1>
      <p style="color: #666; margin-bottom: 10px;">Период: ${period}</p>
      <p style="color: #666; margin-bottom: 20px;">Дата экспорта: ${new Date().toLocaleString()}</p>

      <div style="margin-bottom: 30px;">
        <h2 style="color: #555; margin-bottom: 15px;">Общая статистика</h2>
        <div style="display: flex; gap: 20px;">
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; flex: 1;">
            <p style="margin: 0; color: #666;">Проектов с активностью</p>
            <p style="font-size: 24px; margin: 5px 0 0; font-weight: bold;">${projects.length}</p>
          </div>
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; flex: 1;">
            <p style="margin: 0; color: #666;">Общее время</p>
            <p style="font-size: 24px; margin: 5px 0 0; font-weight: bold;">${formatMinutes(totalMinutes)}</p>
          </div>
        </div>
      </div>

      <h2 style="color: #555; margin-bottom: 15px;">Детализация по проектам</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background-color: #007bff; color: white;">
            <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Проект</th>
            <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Время</th>
            <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Доля</th>
          </tr>
        </thead>
        <tbody>
          ${projects.map((project: any) => `
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 8px; border: 1px solid #ddd;">${project.projectName}</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${formatMinutes(project.totalMinutes)}</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${totalMinutes > 0 ? Math.round((project.totalMinutes / totalMinutes) * 100) : 0}%</td>
             </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;

  document.body.appendChild(container);
  const id = 'temp-export-container';
  container.id = id;
  await exportToPDFFromHTML(id, filename);
  document.body.removeChild(container);
};