import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { useTheme } from '../context/ThemeContext';
import logo from '../assets/logo.jpg';

export default function Sidebar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { theme, toggleTheme } = useTheme();
  const { user } = useSelector((state: any) => state.auth);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
    setIsMenuOpen(false);
  };

  const handleThemeToggle = () => {
    toggleTheme();
    setIsMenuOpen(false);
  };

  const menuItems = [
    { path: '/dashboard', icon: '📊', label: 'Дашборд' },
    { path: '/projects', icon: '📁', label: 'Проекты' },
    { path: '/tasks', icon: '✅', label: 'Задачи' },
    { path: '/notes', icon: '📝', label: 'Заметки' },
    { path: '/reports', icon: '📈', label: 'Отчёты' },
  ];


  const userName = user?.username || localStorage.getItem('userName') || 'Пользователь';
  const userEmail = user?.email || localStorage.getItem('userEmail') || 'user@example.com';

  return (
    <div style={{
      width: '260px',
      height: '100vh',
      backgroundColor: '#2c3e50',
      color: 'white',
      position: 'fixed',
      left: 0,
      top: 0,
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
      zIndex: 100,
    }}>
      {/* Логотип */}
      <div style={{
        padding: '1.5rem',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        marginBottom: '1rem',
        textAlign: 'center',
        cursor: 'pointer',
      }} onClick={() => navigate('/dashboard')}>
        <img
          src={logo}
          alt="Logo"
          style={{
            width: '60px',
            height: '60px',
            objectFit: 'contain',
            margin: '0 auto 0.75rem auto',
            display: 'block',
          }}
        />
        <h2 style={{ margin: 0, fontSize: '1rem', color: 'white' }}>TimeMaster</h2>
        <p style={{ fontSize: '0.7rem', opacity: 0.7, marginTop: '0.25rem', color: 'white' }}>Планируй своё время</p>
      </div>

      {/* Меню */}
      <nav style={{ flex: 1 }}>
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1.5rem',
              color: 'white',
              textDecoration: 'none',
              backgroundColor: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
              borderLeft: isActive ? '3px solid #007bff' : '3px solid transparent',
              transition: 'all 0.2s ease',
            })}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
            }}
            onMouseLeave={(e) => {
              if (!e.currentTarget.classList.contains('active')) {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            <span style={{ fontSize: '1.25rem' }}>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Профиль пользователя */}
      <div style={{
        padding: '1rem',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        position: 'relative',
      }}>
        {/* Плашка пользователя */}
        <div
          ref={buttonRef}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'rgba(255,255,255,0.1)',
            borderRadius: '8px',
            padding: '0.75rem',
            cursor: 'pointer',
            transition: 'background 0.2s ease',
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
        >
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 'bold', color: 'white' }}>{userName}</div>
            <div style={{ fontSize: '0.7rem', opacity: 0.7, color: 'white' }}>{userEmail}</div>
          </div>
          <div style={{
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: isMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          }}>
            <span style={{ color: 'white', fontSize: '0.75rem' }}>▼</span>
          </div>
        </div>

        {/* Выпадающее меню с анимацией */}
        <div
          ref={menuRef}
          style={{
            position: 'absolute',
            bottom: 'calc(100% - 10px)',
            left: '1rem',
            right: '1rem',
            backgroundColor: '#fff',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            overflow: 'hidden',
            zIndex: 200,
            opacity: isMenuOpen ? 1 : 0,
            visibility: isMenuOpen ? 'visible' : 'hidden',
            transform: isMenuOpen ? 'translateY(0)' : 'translateY(10px)',
            transition: 'opacity 0.25s ease, transform 0.25s ease, visibility 0.25s',
          }}
        >
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
              transition: 'background 0.2s ease',
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
              transition: 'background 0.2s ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fff5f5'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <span style={{ fontSize: '1.25rem' }}>🚪</span>
            <span>Выйти</span>
          </button>
        </div>
      </div>
    </div>
  );
}