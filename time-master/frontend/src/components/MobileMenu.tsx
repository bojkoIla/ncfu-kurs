import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { useTheme } from '../context/ThemeContext';

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const menuItems = [
    { path: '/dashboard', icon: '📊', label: 'Дашборд' },
    { path: '/projects', icon: '📁', label: 'Проекты' },
    { path: '/tasks', icon: '✅', label: 'Задачи' },
    { path: '/reports', icon: '📈', label: 'Отчёты' },
  ];

  return (
    <>
      {/* Кнопка бургер */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          top: '1rem',
          left: '1rem',
          zIndex: 201,
          background: 'var(--bg-card)',
          border: 'none',
          borderRadius: '8px',
          padding: '0.5rem',
          fontSize: '1.5rem',
          cursor: 'pointer',
          boxShadow: 'var(--shadow)',
        }}
      >
        ☰
      </button>

      {/* Затемнение */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 199,
          }}
        />
      )}

      {/* Мобильное меню */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: isOpen ? 0 : '-280px',
          width: '260px',
          height: '100vh',
          backgroundColor: 'var(--bg-sidebar)',
          transition: 'left 0.3s ease',
          zIndex: 200,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <h2 style={{ margin: 0, color: 'white' }}>⏱️ TimeMaster</h2>
        </div>

        <nav style={{ flex: 1, marginTop: '1rem' }}>
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1.5rem',
                color: 'white',
                textDecoration: 'none',
                backgroundColor: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
              })}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <button
            onClick={toggleTheme}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              width: '100%',
              padding: '0.5rem 0.75rem',
              backgroundColor: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer',
              marginBottom: '0.5rem',
            }}
          >
            <span>{theme === 'light' ? '🌙' : '☀️'}</span>
            <span>{theme === 'light' ? 'Тёмная тема' : 'Светлая тема'}</span>
          </button>

          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              width: '100%',
              padding: '0.5rem 0.75rem',
              backgroundColor: 'rgba(220,53,69,0.2)',
              border: 'none',
              borderRadius: '8px',
              color: '#dc3545',
              cursor: 'pointer',
            }}
          >
            <span>🚪</span>
            <span>Выйти</span>
          </button>
        </div>
      </div>
    </>
  );
}