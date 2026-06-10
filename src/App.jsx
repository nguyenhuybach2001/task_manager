import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { ToastProvider } from './hooks/useToast';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TaskList from './pages/TaskList';
import TaskNew from './pages/TaskNew';
import TaskDetailPage from './pages/TaskDetailPage';
import Calendar from './pages/Calendar';
import Settings from './pages/Settings';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'var(--parchment)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 16px' }} />
          <p className="loading-text">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (user) return <Navigate to="/" replace />;

  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/tasks" element={<TaskList />} />
        <Route path="/tasks/new" element={<TaskNew />} />
        <Route path="/tasks/:id" element={<TaskDetailPage />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          fontFamily: "'Quicksand', sans-serif",
          colorPrimary: '#b87333',
          colorBgBase: '#fdfbf7',
          colorTextBase: '#2c2417',
          colorBorder: '#d4c5b3',
          borderRadius: 8,
          wireframe: false,
        },
        components: {
          Card: {
            colorBgContainer: '#f4ecd8',
            borderRadiusOuter: 12,
            boxShadowTertiary: '0 4px 12px rgba(44, 36, 23, 0.05)',
          },
          Button: {
            controlHeight: 40,
            primaryShadow: 'none',
          },
          Input: {
            controlHeight: 40,
            colorBgContainer: '#fdfbf7',
          },
          Select: {
            controlHeight: 40,
            colorBgContainer: '#fdfbf7',
          },
          Menu: {
            colorItemBg: 'transparent',
            colorItemBgSelected: '#ebdaba',
          },
          Layout: {
            bodyBg: '#fdfbf7',
            headerBg: '#fdfbf7',
            siderBg: '#f4ecd8',
          }
        }
      }}
    >
      <BrowserRouter>
        <AuthProvider>
          <ToastProvider>
            <AppRoutes />
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    </ConfigProvider>
  );
}
