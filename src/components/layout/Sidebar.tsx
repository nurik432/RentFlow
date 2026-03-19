import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useData } from '../../contexts/DataContext';
import {
  LayoutDashboard, Building2, Receipt, CalendarDays, BarChart3,
  Bell, MessageSquare, ClipboardList, Users, Settings, LogOut, ChevronLeft,
  ChevronRight, Sun, Moon, Zap
} from 'lucide-react';

const navItems = [
  { path: '/owner', icon: LayoutDashboard, label: 'Дашборд' },
  { path: '/owner/properties', icon: Building2, label: 'Объекты' },
  { path: '/owner/utilities', icon: Receipt, label: 'Коммуналка' },
  { path: '/owner/calendar', icon: CalendarDays, label: 'Календарь' },
  { path: '/owner/analytics', icon: BarChart3, label: 'Аналитика' },
  { path: '/owner/notifications', icon: Bell, label: 'Уведомления' },
  { path: '/owner/chat', icon: MessageSquare, label: 'Чат' },
  { path: '/owner/tasks', icon: ClipboardList, label: 'Задачи' },
  { path: '/owner/users', icon: Users, label: 'Пользователи' },
];

export default function Sidebar({ mobileOpen = false, onClose = () => {} }: { mobileOpen?: boolean; onClose?: () => void }) {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { notifications } = useData();
  const navigate = useNavigate();
  const unreadCount = notifications.filter(n => !n.read && n.userId === user?.id).length;

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <>
      {mobileOpen && (
        <div 
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', 
            zIndex: 90, backdropFilter: 'blur(2px)', animation: 'fadeIn 0.2s ease'
          }}
        />
      )}
      
      <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`} style={{
        width: collapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)',
        position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 100,
        background: 'var(--color-surface)', borderRight: '1px solid var(--color-border)',
        display: 'flex', flexDirection: 'column', transition: 'all var(--transition-slow)',
        overflow: 'hidden'
      }}>
        {/* Logo */}
        <div style={{
          padding: '20px 16px', display: 'flex', alignItems: 'center', gap: '12px',
          borderBottom: '1px solid var(--color-border)', minHeight: '64px'
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, var(--color-primary) 0%, #6366f1 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
            <Zap size={20} color="#fff" />
          </div>
          {!collapsed && (
            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text)', whiteSpace: 'nowrap' }}>
              RentFlow
            </span>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/owner'}
              onClick={() => { if (mobileOpen) onClose(); }}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px',
                borderRadius: 'var(--radius-md)', marginBottom: '2px',
                color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                background: isActive ? 'var(--color-primary-light)' : 'transparent',
                fontWeight: isActive ? 600 : 400, fontSize: '0.9rem', textDecoration: 'none',
                transition: 'all var(--transition-fast)', position: 'relative', whiteSpace: 'nowrap'
              })}
            >
              <item.icon size={20} style={{ flexShrink: 0 }} />
              {!collapsed && item.label}
              {item.path === '/owner/notifications' && unreadCount > 0 && (
                <span style={{
                  marginLeft: 'auto', background: 'var(--color-error)', color: '#fff',
                  fontSize: '0.65rem', fontWeight: 700, padding: '1px 6px',
                  borderRadius: 'var(--radius-full)', minWidth: 18, textAlign: 'center'
                }}>
                  {unreadCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div style={{ padding: '12px 8px', borderTop: '1px solid var(--color-border)' }}>
          <button onClick={toggleTheme} className="btn btn-ghost" style={{
            width: '100%', justifyContent: collapsed ? 'center' : 'flex-start', gap: '12px',
            padding: '10px 12px', fontSize: '0.9rem'
          }}>
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            {!collapsed && (theme === 'light' ? 'Тёмная тема' : 'Светлая тема')}
          </button>
          <button onClick={handleLogout} className="btn btn-ghost" style={{
            width: '100%', justifyContent: collapsed ? 'center' : 'flex-start', gap: '12px',
            padding: '10px 12px', fontSize: '0.9rem', color: 'var(--color-error)'
          }}>
            <LogOut size={20} />
            {!collapsed && 'Выйти'}
          </button>
        </div>

        {/* Collapse toggle */}
        <button onClick={() => setCollapsed(!collapsed)} className="desktop-only" style={{
          position: 'absolute', top: 24, right: -14, width: 28, height: 28,
          borderRadius: 'var(--radius-full)', border: '1px solid var(--color-border)',
          background: 'var(--color-surface)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', cursor: 'pointer', color: 'var(--color-text-secondary)',
          boxShadow: 'var(--shadow-sm)', zIndex: 101
        }}>
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </aside>

      <style>{`
        @media (max-width: 768px) {
          .sidebar {
            transform: translateX(-100%);
            width: var(--sidebar-width) !important;
          }
          .sidebar.mobile-open {
            transform: translateX(0);
          }
          .desktop-only {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}
