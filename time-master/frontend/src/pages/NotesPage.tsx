import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotes, createNote, updateNote, deleteNote, togglePinNote } from '../store/slices/notesSlice';

export default function NotesPage() {
  const dispatch = useDispatch();
  const { items: notes, isLoading } = useSelector((state: any) => state.notes);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<any>(null);
  const [formData, setFormData] = useState({ title: '', content: '', tags: '' });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    dispatch(fetchNotes() as any);
  }, [dispatch]);

  const filteredNotes = notes.filter((note: any) =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedNotes = filteredNotes.filter((n: any) => n.isPinned);
  const unpinnedNotes = filteredNotes.filter((n: any) => !n.isPinned);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tags = formData.tags.split(',').map((t) => t.trim()).filter(Boolean);
    if (editingNote) {
      await dispatch(updateNote({ id: editingNote._id, data: { ...formData, tags } }) as any);
    } else {
      await dispatch(createNote({ ...formData, tags }) as any);
    }
    setIsModalOpen(false);
    setEditingNote(null);
    setFormData({ title: '', content: '', tags: '' });
  };

  const handleEdit = (note: any) => {
    setEditingNote(note);
    setFormData({
      title: note.title,
      content: note.content,
      tags: note.tags.join(', '),
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Удалить заметку?')) {
      await dispatch(deleteNote(id) as any);
    }
  };

  const handleTogglePin = async (id: string) => {
    await dispatch(togglePinNote(id) as any);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
    });
  };

  if (isLoading) {
    return <div style={{ padding: '2rem' }}>Загрузка заметок...</div>;
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1> Заметки</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <input
            type="text"
            placeholder="🔍 Поиск заметок..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ padding: '0.5rem', width: '200px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
          <button
            onClick={() => setIsModalOpen(true)}
            style={{ padding: '0.5rem 1rem', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            + Новая заметка
          </button>
        </div>
      </div>

      {filteredNotes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: '#f8f9fa', borderRadius: '12px' }}>
          <p style={{ fontSize: '1.2rem', color: '#666' }}>Нет заметок</p>
          <p>Создайте первую заметку, чтобы сохранить важную информацию</p>
        </div>
      ) : (
        <>
          {/* Закреплённые заметки */}
          {pinnedNotes.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1rem', color: '#666', marginBottom: '1rem' }}>📌 Закреплённые</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
                {pinnedNotes.map((note: any) => (
                  <NoteCard
                    key={note._id}
                    note={note}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onTogglePin={handleTogglePin}
                    formatDate={formatDate}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Обычные заметки */}
          {unpinnedNotes.length > 0 && (
            <div>
              <h2 style={{ fontSize: '1rem', color: '#666', marginBottom: '1rem' }}>Все заметки</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
                {unpinnedNotes.map((note: any) => (
                  <NoteCard
                    key={note._id}
                    note={note}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onTogglePin={handleTogglePin}
                    formatDate={formatDate}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Модальное окно для создания/редактирования */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              borderRadius: '12px',
              padding: '2rem',
              width: '500px',
              maxWidth: '90%',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>{editingNote ? 'Редактировать заметку' : 'Новая заметка'}</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.25rem' }}>Заголовок *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.25rem' }}>Содержание</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={6}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.25rem' }}>Теги (через запятую)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="важный, идея, план"
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ padding: '0.5rem 1rem', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Отмена
                </button>
                <button type="submit" style={{ padding: '0.5rem 1rem', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  {editingNote ? 'Сохранить' : 'Создать'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Компонент карточки заметки
function NoteCard({ note, onEdit, onDelete, onTogglePin, formatDate }: any) {
  return (
    <div
      style={{
        backgroundColor: 'var(--bg-card)',
        borderRadius: '12px',
        padding: '1rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        transition: 'transform 0.2s',
        border: note.isPinned ? '1px solid #ffc107' : '1px solid var(--border)',
      }}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{note.title}</h3>
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          <button
            onClick={() => onTogglePin(note._id)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' }}
            title={note.isPinned ? 'Открепить' : 'Закрепить'}
          >
            {note.isPinned ? '📌' : '📍'}
          </button>
          <button
            onClick={() => onEdit(note)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' }}
            title="Редактировать"
          >
            ✏️
          </button>
          <button
            onClick={() => onDelete(note._id)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' }}
            title="Удалить"
          >
            🗑️
          </button>
        </div>
      </div>
      {note.content && (
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.75rem', whiteSpace: 'pre-wrap' }}>
          {note.content.length > 150 ? note.content.substring(0, 150) + '...' : note.content}
        </p>
      )}
      {note.tags && note.tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginBottom: '0.5rem' }}>
          {note.tags.map((tag: string, i: number) => (
            <span key={i} style={{ fontSize: '0.7rem', backgroundColor: '#e9ecef', padding: '0.125rem 0.375rem', borderRadius: '4px', color: '#666' }}>
              #{tag}
            </span>
          ))}
        </div>
      )}
      <div style={{ fontSize: '0.7rem', color: '#999', marginTop: '0.5rem' }}>
        {formatDate(note.createdAt)}
      </div>
    </div>
  );
}