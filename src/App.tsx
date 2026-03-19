import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
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
  return (
    <>
      <Sidebar />
      <main className="app-content">
        <Outlet />
      </main>
    </>
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
