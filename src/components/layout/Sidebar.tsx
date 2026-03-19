import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useData } from '../../contexts/DataContext';
import {
  LayoutDashboard, Building2, Receipt, CalendarDays, BarChart3,
  Bell, MessageSquare, ClipboardList, Users, LogOut,
  ChevronLeft, ChevronRight, Sun, Moon, Zap,
} from 'lucide-react';

const navItems = [
  { path: '/owner',                  icon: LayoutDashboard, label: 'Дашборд'        },
  { path: '/owner/properties',       icon: Building2,       label: 'Объекты'         },
  { path: '/owner/utilities',        icon: Receipt,         label: 'Коммуналка'      },
  { path: '/owner/calendar',         icon: CalendarDays,    label: 'Календарь'       },
  { path: '/owner/analytics',        icon: BarChart3,       label: 'Аналитика'       },
  { path: '/owner/notifications',    icon: Bell,            label: 'Уведомления'     },
  { path: '/owner/chat',             icon: MessageSquare,   label: 'Чат'             },
  { path: '/owner/tasks',            icon: ClipboardList,   label: 'Задачи'          },
  { path: '/owner/users',            icon: Users,           label: 'Пользователи'    },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ mobileOpen = false, onClose = () => {} }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { notifications } = useData();
  const navigate = useNavigate();

  const unreadCount = notifications.filter(n => !n.read && n.userId === user?.id).length;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            zIndex: 90, backdropFilter: 'blur(2px)',
          }}
        />
      )}

      <aside
        className={`sidebar${mobileOpen ? ' sidebar--open' : ''}`}
        style={{
          width: collapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)',
        }}
      >
        {/* Logo */}
        <div className="sidebar-logo">
          <div style={{
            width: 36, height: 36, borderRadius: 'var(--radius-md)', flexShrink: 0,
            background: 'linear-gradient(135deg, var(--color-primary) 0%, #6366f1 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Zap size={20} color="#fff" />
          </div>
          {!collapsed && (
            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text)', whiteSpace: 'nowrap' }}>
              RentFlow
            </span>
          )}
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/owner'}
              onClick={() => { if (mobileOpen) onClose(); }}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
                borderRadius: 'var(--radius-md)', marginBottom: 2, textDecoration: 'none',
                fontWeight: isActive ? 600 : 400, fontSize: '0.9rem', whiteSpace: 'nowrap',
                color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                background: isActive ? 'var(--color-primary-light)' : 'transparent',
                transition: 'all var(--transition-fast)',
              })}
            >
              <item.icon size={20} style={{ flexShrink: 0 }} />
              {!collapsed && item.label}
              {item.path === '/owner/notifications' && unreadCount > 0 && !collapsed && (
                <span style={{
                  marginLeft: 'auto', background: 'var(--color-error)', color: '#fff',
                  fontSize: '0.65rem', fontWeight: 700, padding: '1px 6px',
                  borderRadius: 'var(--radius-full)', minWidth: 18, textAlign: 'center',
                }}>
                  {unreadCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom actions */}
        <div style={{ padding: '12px 8px', borderTop: '1px solid var(--color-border)' }}>
          <button
            onClick={toggleTheme}
            className="btn btn-ghost"
            style={{
              width: '100%', gap: 12, padding: '10px 12px', fontSize: '0.9rem',
              justifyContent: collapsed ? 'center' : 'flex-start',
            }}
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            {!collapsed && (theme === 'light' ? 'Тёмная тема' : 'Светлая тема')}
          </button>
          <button
            onClick={handleLogout}
            className="btn btn-ghost"
            style={{
              width: '100%', gap: 12, padding: '10px 12px', fontSize: '0.9rem',
              justifyContent: collapsed ? 'center' : 'flex-start',
              color: 'var(--color-error)',
            }}
          >
            <LogOut size={20} />
            {!collapsed && 'Выйти'}
          </button>
        </div>

        {/* Desktop collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="sidebar-collapse-btn"
          title={collapsed ? 'Развернуть' : 'Свернуть'}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </aside>

      <style>{`
        /* ── Sidebar base (always fixed) ── */
        .sidebar {
          position: fixed;
          top: 0; left: 0; bottom: 0;
          z-index: 100;
          display: flex;
          flex-direction: column;
          background: var(--color-surface);
          border-right: 1px solid var(--color-border);
          transition: width var(--transition-slow), transform var(--transition-slow);
          overflow: hidden;
        }

        .sidebar-logo {
          padding: 20px 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          border-bottom: 1px solid var(--color-border);
          min-height: 64px;
        }

        /* ── Desktop collapse button ── */
        .sidebar-collapse-btn {
          position: absolute;
          top: 24px; right: -14px;
          width: 28px; height: 28px;
          border-radius: var(--radius-full);
          border: 1px solid var(--color-border);
          background: var(--color-surface);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: var(--color-text-secondary);
          box-shadow: var(--shadow-sm);
          z-index: 101;
        }

        /* ── Mobile header (hidden on desktop) ── */
        .owner-mobile-header {
          display: none;
          position: sticky;
          top: 0;
          z-index: 80;
          height: var(--topbar-height);
          padding: 0 16px;
          align-items: center;
          justify-content: space-between;
          background: var(--color-surface);
          border-bottom: 1px solid var(--color-border);
        }

        /* ── Mobile breakpoint ── */
        @media (max-width: 768px) {
          /* Show the mobile header */
          .owner-mobile-header {
            display: flex;
          }

          /* Sidebar slides off-screen; slides back in when open */
          .sidebar {
            transform: translateX(-100%);
            width: var(--sidebar-width) !important; /* always full width on mobile */
          }
          .sidebar.sidebar--open {
            transform: translateX(0);
          }

          /* Hide the desktop collapse button on mobile */
          .sidebar-collapse-btn {
            display: none;
          }

          /* Content fills the full width (no sidebar margin) */
          .app-content {
            margin-left: 0 !important;
          }
        }
      `}</style>
    </>
  );
}