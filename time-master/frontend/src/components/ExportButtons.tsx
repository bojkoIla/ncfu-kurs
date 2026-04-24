import { exportToCSV, exportToPDF } from '../services/exportService';

interface ExportButtonsProps {
  data: any[];
  filename: string;
  columns: { key: string; label: string }[];
  title?: string;
}

export default function ExportButtons({ data, filename, columns, title }: ExportButtonsProps) {
  const handleCSV = () => {
    exportToCSV(data, filename, columns);
  };

  const handlePDF = () => {
    exportToPDF(data, title || filename, columns);
  };

  return (
    <div style={{ display: 'flex', gap: '0.5rem' }}>
      <button
        onClick={handleCSV}
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '0.875rem',
        }}
      >
        📄 CSV
      </button>
      <button
        onClick={handlePDF}
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: '#dc3545',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '0.875rem',
        }}
      >
        📑 PDF
      </button>
    </div>
  );
}