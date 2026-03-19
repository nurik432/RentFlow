import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useData } from '../../contexts/DataContext';
import {
  LayoutDashboard, Gauge, CreditCard, MessageSquare, User,
  Sun, Moon, LogOut, Bell, Menu, X, Zap
} from 'lucide-react';

const tenantNavItems = [
  { path: '/tenant', icon: LayoutDashboard, label: 'Главная' },
  { path: '/tenant/meters', icon: Gauge, label: 'Счётчики' },
  { path: '/tenant/payments', icon: CreditCard, label: 'Платежи' },
  { path: '/tenant/chat', icon: MessageSquare, label: 'Чат' },
  { path: '/tenant/profile', icon: User, label: 'Профиль' },
];

export default function TopNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { notifications } = useData();
  const navigate = useNavigate();
  const unreadCount = notifications.filter(n => !n.read && n.userId === user?.id).length;

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <>
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)',
        padding: '0 24px', height: 'var(--topbar-height)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        backdropFilter: 'blur(12px)', backgroundColor: 'rgba(var(--color-surface), 0.9)'
      }}>
        {/* Logo + Mobile Menu */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)} style={{
            background: 'none', border: 'none', color: 'var(--color-text)', cursor: 'pointer',
            display: 'none', padding: 4
          }}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
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

        {/* Desktop Nav */}
        <nav className="desktop-nav" style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          {tenantNavItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/tenant'}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 14px', borderRadius: 'var(--radius-md)',
                color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                background: isActive ? 'var(--color-primary-light)' : 'transparent',
                fontWeight: isActive ? 600 : 400, fontSize: '0.85rem',
                textDecoration: 'none', transition: 'all var(--transition-fast)',
                whiteSpace: 'nowrap'
              })}
            >
              <item.icon size={17} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ position: 'relative' }}>
            <button className="btn btn-ghost btn-icon" style={{ position: 'relative' }}>
              <Bell size={18} />
              {unreadCount > 0 && <span className="notification-dot" />}
            </button>
          </div>
          <button onClick={toggleTheme} className="btn btn-ghost btn-icon">
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <button onClick={handleLogout} className="btn btn-ghost btn-icon" title="Выйти">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div style={{
          position: 'fixed', top: 'var(--topbar-height)', left: 0, right: 0, bottom: 0,
          background: 'var(--color-surface)', zIndex: 99, padding: '16px',
          animation: 'slideDown 0.2s ease'
        }}>
          {tenantNavItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/tenant'}
              onClick={() => setMenuOpen(false)}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px',
                borderRadius: 'var(--radius-md)', marginBottom: '4px',
                color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                background: isActive ? 'var(--color-primary-light)' : 'transparent',
                fontWeight: isActive ? 600 : 400, fontSize: '1rem', textDecoration: 'none'
              })}
            >
              <item.icon size={20} />
              {item.label}
            </NavLink>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </>
  );
}
