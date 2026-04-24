import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store/store';
import { ThemeProvider } from './context/ThemeContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProjectsPage from './pages/ProjectsPage';
import TasksPage from './pages/TasksPage';
import TaskDetailPage from './pages/TaskDetailPage';
import ReportsPage from './pages/ReportsPage';
import NotesPage from './pages/NotesPage';
import GlobalTimer from './components/GlobalTimer';
import NotificationBell from './components/NotificationBell';
import Sidebar from './components/Sidebar';

function PrivateRoute({ children }: { children: JSX.Element }) {
  const token = useSelector((state: any) => state.auth.token);
  return token ? children : <Navigate to="/login" />;
}

function AppContent() {
  const token = useSelector((state: any) => state.auth.token);
  const isAuthenticated = !!token;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {isAuthenticated && <Sidebar />}

      <div style={{
        flex: 1,
        marginLeft: isAuthenticated ? '260px' : 0,
        transition: 'margin-left 0.3s ease',
      }}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          } />
          <Route path="/projects" element={
            <PrivateRoute>
              <ProjectsPage />
            </PrivateRoute>
          } />
          <Route path="/tasks" element={
            <PrivateRoute>
              <TasksPage />
            </PrivateRoute>
          } />
          <Route path="/tasks/:id" element={
            <PrivateRoute>
              <TaskDetailPage />
            </PrivateRoute>
          } />
          <Route path="/reports" element={
            <PrivateRoute>
              <ReportsPage />
            </PrivateRoute>
          } />
          <Route path="/notes" element={
            <PrivateRoute>
              <NotesPage />
            </PrivateRoute>
          } />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </div>

      {isAuthenticated && <GlobalTimer />}
      <Toaster position="top-right" />
      {isAuthenticated && <NotificationBell onTaskClick={(taskId) => window.location.href = `/tasks/${taskId}`} />}
    </div>
  );
}

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  );
}

export default App;