import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import OrdersPage from './pages/OrdersPage';
import ServingPage from './pages/ServingPage';
import PreparingPage from './pages/PreparingPage';
import MenuPage from './pages/MenuPage';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div
          className="w-16 h-16 rounded-3xl mx-auto mb-4 flex items-center justify-center animate-float"
          style={{
            background: 'rgba(99,102,241,0.15)',
            border: '1px solid rgba(99,102,241,0.20)',
            boxShadow: '0 0 40px rgba(99,102,241,0.10)',
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#818CF8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
            <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z" />
            <line x1="6" y1="2" x2="6" y2="4" /><line x1="10" y1="2" x2="10" y2="4" /><line x1="14" y1="2" x2="14" y2="4" />
          </svg>
        </div>
        <p style={{ color: '#475569', fontSize: '0.875rem', fontWeight: 500 }}>
          Đang tải...
        </p>
      </div>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

const IndexRoute = () => {
  const { user } = useAuth();
  if (user?.role === 'waiter') return <Navigate to="/serving" replace />;
  if (user?.role === 'barista') return <Navigate to="/preparing" replace />;
  return <DashboardPage />;
};

const AppRoutes = () => {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<IndexRoute />} />
        <Route path="orders" element={
          <ProtectedRoute roles={['admin']}><OrdersPage /></ProtectedRoute>
        } />
        <Route path="menu" element={
          <ProtectedRoute roles={['admin']}><MenuPage /></ProtectedRoute>
        } />
        <Route path="serving" element={
          <ProtectedRoute roles={['admin', 'waiter']}><ServingPage /></ProtectedRoute>
        } />
        <Route path="preparing" element={
          <ProtectedRoute roles={['barista', 'admin']}><PreparingPage /></ProtectedRoute>
        } />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'rgba(15,23,42,0.97)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              color: '#E2E8F0',
              border: '1px solid rgba(51,65,85,0.50)',
              borderRadius: '14px',
              boxShadow: '0 16px 48px rgba(0,0,0,0.60)',
              fontSize: '0.875rem',
              fontWeight: 500,
            },
            success: {
              iconTheme: { primary: '#818CF8', secondary: '#fff' },
            },
            error: {
              iconTheme: { primary: '#F87171', secondary: '#fff' },
            },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}
