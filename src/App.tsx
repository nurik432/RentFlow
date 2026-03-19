import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Menu, Zap } from 'lucide-react';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';

import Sidebar from './components/layout/Sidebar';
import TopNav from './components/layout/TopNav';

import LoginPage from './pages/auth/LoginPage';
import OnboardingPage from './pages/auth/OnboardingPage';

import DashboardPage from './pages/owner/DashboardPage';
import PropertiesPage from './pages/owner/PropertiesPage';
import PropertyFormPage from './pages/owner/PropertyFormPage';
import PropertyDetailPage from './pages/owner/PropertyDetailPage';
import UtilitiesPage from './pages/owner/UtilitiesPage';
import CalendarPage from './pages/owner/CalendarPage';
import AnalyticsPage from './pages/owner/AnalyticsPage';
import NotificationsPage from './pages/owner/NotificationsPage';
import OwnerChatPage from './pages/owner/ChatPage';
import TasksPage from './pages/owner/TasksPage';
import UsersPage from './pages/owner/UsersPage';

import TenantDashboardPage from './pages/tenant/TenantDashboardPage';
import MeterReadingsPage from './pages/tenant/MeterReadingsPage';
import PaymentsPage from './pages/tenant/PaymentsPage';
import TenantChatPage from './pages/tenant/ChatPage';
import ProfilePage from './pages/tenant/ProfilePage';

function ProtectedRoute({ allowedRole }: { allowedRole?: 'owner' | 'tenant' }) {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRole && user?.role !== allowedRole) {
    return <Navigate to={user?.role === 'owner' ? '/owner' : '/tenant'} replace />;
  }
  return <Outlet />;
}

function OwnerLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
      {/* Mobile Header */}
      <header className="owner-mobile-header" style={{
        position: 'sticky', top: 0, zIndex: 80,
        background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)',
        padding: '0 24px', height: 'var(--topbar-height)',
        alignItems: 'center', justifyContent: 'space-between',
        backdropFilter: 'blur(12px)', backgroundColor: 'rgba(var(--color-surface), 0.9)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={() => setMobileMenuOpen(true)} style={{
            background: 'none', border: 'none', color: 'var(--color-text)', cursor: 'pointer', padding: 4, display: 'flex'
          }}>
            <Menu size={24} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: 30, height: 30, borderRadius: 'var(--radius-sm)',
              background: 'linear-gradient(135deg, var(--color-primary) 0%, #6366f1 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Zap size={16} color="#fff" />
            </div>
            <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--color-text)' }}>RentFlow</span>
          </div>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
        <Sidebar mobileOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
        <main className="app-content">
          <Outlet />
        </main>
      </div>

      <style>{`
        .owner-mobile-header { display: none !important; }
        @media (max-width: 768px) {
          .owner-mobile-header { display: flex !important; }
        }
      `}</style>
    </div>
  );
}

function TenantLayout() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
      <TopNav />
      <main className="app-content no-sidebar" style={{ minHeight: 'calc(100vh - var(--topbar-height))' }}>
        <Outlet />
      </main>
    </div>
  );
}

function AppRoutes() {
  const { isAuthenticated, user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={
        isAuthenticated ? <Navigate to={user?.role === 'owner' ? '/owner' : '/tenant'} replace /> : <LoginPage />
      } />

      {/* Owner routes */}
      <Route element={<ProtectedRoute allowedRole="owner" />}>
        <Route element={<OwnerLayout />}>
          <Route path="/owner" element={<DashboardPage />} />
          <Route path="/owner/properties" element={<PropertiesPage />} />
          <Route path="/owner/properties/new" element={<PropertyFormPage />} />
          <Route path="/owner/properties/:id" element={<PropertyDetailPage />} />
          <Route path="/owner/properties/:id/edit" element={<PropertyFormPage />} />
          <Route path="/owner/utilities" element={<UtilitiesPage />} />
          <Route path="/owner/calendar" element={<CalendarPage />} />
          <Route path="/owner/analytics" element={<AnalyticsPage />} />
          <Route path="/owner/notifications" element={<NotificationsPage />} />
          <Route path="/owner/chat" element={<OwnerChatPage />} />
          <Route path="/owner/tasks" element={<TasksPage />} />
          <Route path="/owner/users" element={<UsersPage />} />
        </Route>
        <Route path="/onboarding" element={<OnboardingPage />} />
      </Route>

      {/* Tenant routes */}
      <Route element={<ProtectedRoute allowedRole="tenant" />}>
        <Route element={<TenantLayout />}>
          <Route path="/tenant" element={<TenantDashboardPage />} />
          <Route path="/tenant/meters" element={<MeterReadingsPage />} />
          <Route path="/tenant/payments" element={<PaymentsPage />} />
          <Route path="/tenant/chat" element={<TenantChatPage />} />
          <Route path="/tenant/profile" element={<ProfilePage />} />
        </Route>
      </Route>

      {/* Default redirect */}
      <Route path="*" element={<Navigate to={isAuthenticated ? (user?.role === 'owner' ? '/owner' : '/tenant') : '/login'} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <DataProvider>
            <div className="app-layout">
              <AppRoutes />
            </div>
          </DataProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
