import { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../store/slices/authSlice';
import { useTheme } from '../context/ThemeContext';

export default function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { user } = useSelector((state: any) => state.auth);


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
    setIsOpen(false);
  };

  const handleThemeToggle = () => {
    toggleTheme();
    setIsOpen(false);
  };


  const getInitial = () => {
    if (user?.username) {
      return user.username.charAt(0).toUpperCase();
    }
    const email = localStorage.getItem('userEmail') || 'U';
    return email.charAt(0).toUpperCase();
  };

  return (
    <div ref={menuRef} style={{ position: 'relative' }}>
      {/* Кнопка профиля */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '0.25rem',
          borderRadius: '50%',
          transition: 'all 0.2s ease',
        }}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: '#007bff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '1rem',
          }}
        >
          {getInitial()}
        </div>
      </button>

      {/* Выпадающее меню */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            bottom: '100%',
            left: '0',
            marginBottom: '0.5rem',
            backgroundColor: '#fff',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            minWidth: '200px',
            overflow: 'hidden',
            zIndex: 1000,
          }}
        >
          {/* Информация о пользователе */}
          <div
            style={{
              padding: '0.75rem 1rem',
              borderBottom: '1px solid #eee',
              backgroundColor: '#f8f9fa',
            }}
          >
            <div style={{ fontWeight: 'bold', color: '#333' }}>
              {user?.username || 'Пользователь'}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.25rem' }}>
              {user?.email || localStorage.getItem('userEmail') || 'user@example.com'}
            </div>
          </div>

          {/* Переключение темы */}
          <button
            onClick={handleThemeToggle}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              width: '100%',
              padding: '0.75rem 1rem',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left',
              color: '#333',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <span style={{ fontSize: '1.25rem' }}>{theme === 'light' ? '🌙' : '☀️'}</span>
            <span>{theme === 'light' ? 'Тёмная тема' : 'Светлая тема'}</span>
          </button>

          {/* Выход */}
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              width: '100%',
              padding: '0.75rem 1rem',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left',
              color: '#dc3545',
              borderTop: '1px solid #eee',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fff5f5'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <span style={{ fontSize: '1.25rem' }}>🚪</span>
            <span>Выйти</span>
          </button>
        </div>
      )}
    </div>
  );
}