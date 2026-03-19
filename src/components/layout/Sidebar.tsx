import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useData } from '../../contexts/DataContext';
import {
  LayoutDashboard, Building2, Receipt, CalendarDays, BarChart3,
  Bell, MessageSquare, ClipboardList, Users,
  Sun, Moon, LogOut, Menu, X, Zap,
} from 'lucide-react';

const navItems = [
  { path: '/owner',                icon: LayoutDashboard, label: 'Дашборд'     },
  { path: '/owner/properties',     icon: Building2,       label: 'Объекты'      },
  { path: '/owner/utilities',      icon: Receipt,         label: 'Коммуналка'   },
  { path: '/owner/calendar',       icon: CalendarDays,    label: 'Календарь'    },
  { path: '/owner/analytics',      icon: BarChart3,       label: 'Аналитика'    },
  { path: '/owner/notifications',  icon: Bell,            label: 'Уведомления'  },
  { path: '/owner/chat',           icon: MessageSquare,   label: 'Чат'          },
  { path: '/owner/tasks',          icon: ClipboardList,   label: 'Задачи'       },
  { path: '/owner/users',          icon: Users,           label: 'Польз.'       },
];

export default function Sidebar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { notifications } = useData();
  const navigate = useNavigate();

  const unreadCount = notifications.filter(n => !n.read && n.userId === user?.id).length;

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    navigate('/login');
  };

  return (
    <>
      <header className="owner-topnav">
        {/* Logo */}
        <div className="owner-topnav__logo">
          <div className="owner-topnav__logo-icon">
            <Zap size={16} color="#fff" />
          </div>
          <span className="owner-topnav__logo-text">RentFlow</span>
        </div>

        {/* Desktop nav */}
        <nav className="owner-topnav__nav">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/owner'}
              className={({ isActive }) =>
                'owner-topnav__link' + (isActive ? ' owner-topnav__link--active' : '')
              }
            >
              <item.icon size={15} />
              {item.label}
              {item.path === '/owner/notifications' && unreadCount > 0 && (
                <span className="owner-topnav__badge">{unreadCount}</span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Actions */}
        <div className="owner-topnav__actions">
          <button onClick={toggleTheme} className="btn btn-ghost btn-icon" title="Сменить тему">
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <button onClick={handleLogout} className="btn btn-ghost btn-icon" title="Выйти">
            <LogOut size={18} />
          </button>
          {/* Hamburger — mobile only */}
          <button
            className="owner-topnav__hamburger"
            onClick={() => setMenuOpen(v => !v)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      {menuOpen && (
        <>
          <div
            className="owner-topnav__backdrop"
            onClick={() => setMenuOpen(false)}
          />
          <div className="owner-topnav__drawer">
            {navItems.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/owner'}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  'owner-topnav__drawer-link' + (isActive ? ' owner-topnav__drawer-link--active' : '')
                }
              >
                <item.icon size={20} />
                {item.label}
                {item.path === '/owner/notifications' && unreadCount > 0 && (
                  <span className="owner-topnav__badge" style={{ marginLeft: 'auto' }}>{unreadCount}</span>
                )}
              </NavLink>
            ))}
            <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '8px 0' }} />
            <button
              onClick={toggleTheme}
              className="owner-topnav__drawer-link"
              style={{ width: '100%', cursor: 'pointer', background: 'none', border: 'none', textAlign: 'left', fontFamily: 'inherit' }}
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              {theme === 'light' ? 'Тёмная тема' : 'Светлая тема'}
            </button>
            <button
              onClick={handleLogout}
              className="owner-topnav__drawer-link"
              style={{ width: '100%', cursor: 'pointer', background: 'none', border: 'none', textAlign: 'left', color: 'var(--color-error)', fontFamily: 'inherit' }}
            >
              <LogOut size={20} />
              Выйти
            </button>
          </div>
        </>
      )}

      <style>{`
        /* ── Top nav bar ── */
        .owner-topnav {
          position: sticky;
          top: 0;
          z-index: 100;
          height: var(--topbar-height);
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 0 20px;
          background: var(--color-surface);
          border-bottom: 1px solid var(--color-border);
          box-shadow: var(--shadow-xs);
        }

        /* Logo */
        .owner-topnav__logo {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
          margin-right: 8px;
        }
        .owner-topnav__logo-icon {
          width: 30px; height: 30px;
          border-radius: var(--radius-sm);
          background: linear-gradient(135deg, var(--color-primary) 0%, #6366f1 100%);
          display: flex; align-items: center; justify-content: center;
        }
        .owner-topnav__logo-text {
          font-weight: 700;
          font-size: 1.1rem;
          color: var(--color-text);
          white-space: nowrap;
        }

        /* Desktop nav links */
        .owner-topnav__nav {
          display: flex;
          align-items: center;
          gap: 2px;
          flex: 1;
          overflow-x: auto;
          scrollbar-width: none;
        }
        .owner-topnav__nav::-webkit-scrollbar { display: none; }

        .owner-topnav__link {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 7px 11px;
          border-radius: var(--radius-md);
          font-size: 0.82rem;
          font-weight: 400;
          color: var(--color-text-secondary);
          text-decoration: none;
          white-space: nowrap;
          transition: all var(--transition-fast);
          position: relative;
        }
        .owner-topnav__link:hover {
          background: var(--color-surface-hover);
          color: var(--color-text);
        }
        .owner-topnav__link--active {
          background: var(--color-primary-light);
          color: var(--color-primary);
          font-weight: 600;
        }

        /* Unread badge */
        .owner-topnav__badge {
          background: var(--color-error);
          color: #fff;
          font-size: 0.6rem;
          font-weight: 700;
          padding: 1px 5px;
          border-radius: var(--radius-full);
          min-width: 16px;
          text-align: center;
          line-height: 1.4;
        }

        /* Right actions */
        .owner-topnav__actions {
          display: flex;
          align-items: center;
          gap: 4px;
          flex-shrink: 0;
        }

        /* Hamburger — hidden on desktop */
        .owner-topnav__hamburger {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          color: var(--color-text);
          padding: 6px;
          border-radius: var(--radius-md);
        }
        .owner-topnav__hamburger:hover {
          background: var(--color-surface-hover);
        }

        /* Mobile backdrop */
        .owner-topnav__backdrop {
          position: fixed;
          inset: 0;
          top: var(--topbar-height);
          background: rgba(0,0,0,0.4);
          z-index: 98;
          backdrop-filter: blur(2px);
          animation: fadeIn 0.15s ease;
        }

        /* Mobile drawer */
        .owner-topnav__drawer {
          position: fixed;
          top: var(--topbar-height);
          left: 0; right: 0;
          background: var(--color-surface);
          border-bottom: 1px solid var(--color-border);
          padding: 8px 12px 16px;
          z-index: 99;
          box-shadow: var(--shadow-lg);
          animation: slideDown 0.2s ease;
        }

        .owner-topnav__drawer-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          border-radius: var(--radius-md);
          font-size: 0.95rem;
          font-weight: 400;
          color: var(--color-text-secondary);
          text-decoration: none;
          transition: all var(--transition-fast);
          margin-bottom: 2px;
        }
        .owner-topnav__drawer-link:hover {
          background: var(--color-surface-hover);
          color: var(--color-text);
        }
        .owner-topnav__drawer-link--active {
          background: var(--color-primary-light);
          color: var(--color-primary);
          font-weight: 600;
        }

        /* ── Mobile: show hamburger, hide desktop nav ── */
        @media (max-width: 768px) {
          .owner-topnav__nav { display: none; }
          .owner-topnav__hamburger { display: flex; }
          .owner-topnav__actions .btn-icon:not(.owner-topnav__hamburger) {
            display: none;
          }
        }
      `}</style>
    </>
  );
}