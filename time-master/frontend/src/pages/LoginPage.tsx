import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../store/slices/authSlice';
import logo from '../assets/logo.jpg';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const result = await dispatch(login({ email, password }) as any);

    if (result.meta.requestStatus === 'fulfilled') {
      navigate('/dashboard');
    } else {
      setError('Неверный email или пароль');
    }
    setIsLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '1rem',
    }}>
      <div style={{
        backgroundColor: 'var(--bg-card)',
        borderRadius: '24px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        width: '100%',
        maxWidth: '450px',
        overflow: 'hidden',
      }}>
        {/* Верхняя часть с логотипом */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '2rem',
          textAlign: 'center',
        }}>
          <img
            src={logo}
            alt="Logo"
            style={{
              width: '70px',
              height: '70px',
              objectFit: 'contain',
              margin: '0 auto 1rem auto',
              display: 'block',
            }}
          />
          <h1 style={{
            color: 'white',
            fontSize: '1.75rem',
            margin: 0,
            fontWeight: 'bold',
          }}>Добро пожаловать!</h1>
          <p style={{
            color: 'rgba(255,255,255,0.8)',
            marginTop: '0.5rem',
            fontSize: '0.875rem',
          }}>Войдите в свой аккаунт</p>
        </div>

        {/* Форма входа */}
        <div style={{ padding: '2rem' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: 'var(--text-primary)',
                fontWeight: '500',
                fontSize: '0.875rem',
              }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="example@mail.com"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '2px solid var(--border)',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  transition: 'all 0.2s',
                  backgroundColor: 'var(--input-bg)',
                  color: 'var(--input-text)',
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#667eea'}
                onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: 'var(--text-primary)',
                fontWeight: '500',
                fontSize: '0.875rem',
              }}>
                Пароль
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '2px solid var(--border)',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  transition: 'all 0.2s',
                  backgroundColor: 'var(--input-bg)',
                  color: 'var(--input-text)',
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#667eea'}
                onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
              />
            </div>

            {error && (
              <div style={{
                backgroundColor: '#fee2e2',
                color: '#dc2626',
                padding: '0.75rem',
                borderRadius: '12px',
                marginBottom: '1rem',
                fontSize: '0.875rem',
                textAlign: 'center',
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
                opacity: isLoading ? 0.7 : 1,
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#5a67d8'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#667eea'}
            >
              {isLoading ? 'Вход...' : 'Войти'}
            </button>
          </form>

          <div style={{
            marginTop: '1.5rem',
            textAlign: 'center',
            paddingTop: '1rem',
            borderTop: '1px solid var(--border)',
          }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Нет аккаунта?{' '}
              <Link to="/register" style={{
                color: '#667eea',
                textDecoration: 'none',
                fontWeight: '600',
              }}>
                Зарегистрироваться
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}