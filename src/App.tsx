import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Menu, Zap, Loader2 } from 'lucide-react';
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

// ─── Loading screen shown while Supabase checks the session ─────────────────
function LoadingScreen() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: 16, background: 'var(--color-bg)',
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 'var(--radius-lg)',
        background: 'linear-gradient(135deg, var(--color-primary) 0%, #6366f1 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Zap size={24} color="#fff" />
      </div>
      <Loader2 size={20} color="var(--color-text-tertiary)"
        style={{ animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─── Route guard ─────────────────────────────────────────────────────────────
function ProtectedRoute({ allowedRole }: { allowedRole?: 'owner' | 'tenant' }) {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRole && user?.role !== allowedRole) {
    return <Navigate to={user?.role === 'owner' ? '/owner' : '/tenant'} replace />;
  }
  return <Outlet />;
}

// ─── Owner layout (desktop sidebar + mobile drawer) ──────────────────────────
function OwnerLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile-only top bar */}
      <header className="owner-mobile-header">
        <button
          onClick={() => setMobileMenuOpen(true)}
          style={{ background: 'none', border: 'none', color: 'var(--color-text)', cursor: 'pointer', padding: 4, display: 'flex' }}
        >
          <Menu size={24} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 'var(--radius-sm)',
            background: 'linear-gradient(135deg, var(--color-primary) 0%, #6366f1 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Zap size={16} color="#fff" />
          </div>
          <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--color-text)' }}>RentFlow</span>
        </div>
        {/* Placeholder to balance the flex layout */}
        <div style={{ width: 32 }} />
      </header>

      <Sidebar mobileOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      <main className="app-content">
        <Outlet />
      </main>
    </>
  );
}

// ─── Tenant layout ────────────────────────────────────────────────────────────
function TenantLayout() {
  return (
    <>
      <TopNav />
      <main className="app-content no-sidebar">
        <Outlet />
      </main>
    </>
  );
}

// ─── Routes (must be inside AuthProvider to use useAuth) ─────────────────────
function AppRoutes() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) return <LoadingScreen />;

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated
            ? <Navigate to={user?.role === 'owner' ? '/owner' : '/tenant'} replace />
            : <LoginPage />
        }
      />

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

      <Route
        path="*"
        element={
          <Navigate to={isAuthenticated ? (user?.role === 'owner' ? '/owner' : '/tenant') : '/login'} replace />
        }
      />
    </Routes>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
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