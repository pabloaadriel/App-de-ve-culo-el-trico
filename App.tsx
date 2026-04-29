import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppStore } from './store/useAppStore';
import { Login } from './pages/Login';
import { DriverDashboard } from './pages/DriverDashboard';
import { Cars } from './pages/Cars';
import { Stations } from './pages/Stations';
import { Payments } from './pages/Payments';
import { AdminDashboard } from './pages/AdminDashboard';
import { Sidebar } from './components/layout/Sidebar';

const ProtectedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAppStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-hidden flex flex-col" style={{ background: 'var(--surface-900)' }}>
        {children}
      </main>
    </div>
  );
};

const AdminGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAppStore();
  if (currentUser?.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

function App() {
  const { isAuthenticated } = useAppStore();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/dashboard" element={<ProtectedLayout><DriverDashboard /></ProtectedLayout>} />
        <Route path="/cars" element={<ProtectedLayout><Cars /></ProtectedLayout>} />
        <Route path="/stations" element={<ProtectedLayout><Stations /></ProtectedLayout>} />
        <Route path="/payments" element={<ProtectedLayout><Payments /></ProtectedLayout>} />
        <Route path="/admin" element={
          <ProtectedLayout>
            <AdminGuard><AdminDashboard /></AdminGuard>
          </ProtectedLayout>
        } />
        <Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
