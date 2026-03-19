import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { User, UserRole } from '../../types';
import {
  Users, UserPlus, Trash2, Search, Shield, Key, X, AlertCircle, Check,
  Mail, Phone, ChevronDown
} from 'lucide-react';

export default function UsersPage() {
  const { getAllUsers, registerUser, removeUser, user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [filterRole, setFilterRole] = useState<'all' | UserRole>('all');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: '', role: 'tenant' as UserRole
  });

  const refreshUsers = () => setUsers(getAllUsers());

  useEffect(() => { refreshUsers(); }, []);

  const filtered = users.filter(u => {
    if (filterRole !== 'all' && u.role !== filterRole) return false;
    if (search) {
      const s = search.toLowerCase();
      return u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s);
    }
    return true;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      setFormError('Заполните все обязательные поля');
      return;
    }
    if (formData.password.length < 6) {
      setFormError('Пароль должен быть не менее 6 символов');
      return;
    }

    const result = await registerUser(formData);
    if (result.success) {
      setFormSuccess(`Пользователь ${formData.name} успешно создан`);
      setFormData({ name: '', email: '', phone: '', password: '', role: 'tenant' });
      refreshUsers();
      setTimeout(() => {
        setShowForm(false);
        setFormSuccess('');
      }, 1500);
    } else {
      setFormError(result.error || 'Ошибка создания');
    }
  };

  const handleDelete = async (id: string) => {
    if (await removeUser(id)) {
      refreshUsers();
      setDeleteConfirm(null);
    }
  };

  const getRoleBadge = (role: UserRole) => {
    const isOwner = role === 'owner';
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: '4px',
        padding: '3px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 600,
        background: isOwner ? 'var(--color-primary-light)' : 'var(--color-success-light, #ecfdf5)',
        color: isOwner ? 'var(--color-primary)' : 'var(--color-success, #10b981)',
      }}>
        <Shield size={12} />
        {isOwner ? 'Владелец' : 'Арендатор'}
      </span>
    );
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Users size={28} /> Пользователи
          </h1>
          <p className="page-subtitle">
            Управление учётными записями — {users.length} пользователей
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowForm(true); setFormError(''); setFormSuccess(''); }}>
          <UserPlus size={18} /> Добавить
        </button>
      </div>

      {/* Filters */}
      <div className="card" style={{ display: 'flex', gap: '12px', padding: '12px 16px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-tertiary)' }} />
          <input
            className="form-input" placeholder="Поиск по имени или email..."
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 36 }}
          />
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {[
            { value: 'all', label: 'Все' },
            { value: 'owner', label: '🏠 Владельцы' },
            { value: 'tenant', label: '🔑 Арендаторы' },
          ].map(tab => (
            <button
              key={tab.value}
              className={`btn ${filterRole === tab.value ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setFilterRole(tab.value as any)}
              style={{ fontSize: '0.85rem', padding: '6px 14px' }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Users table */}
      <div className="card" style={{ overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
              {['Пользователь', 'Email', 'Телефон', 'Роль', 'Дата регистрации', ''].map((h, i) => (
                <th key={i} style={{
                  padding: '12px 16px', textAlign: 'left', fontWeight: 600,
                  fontSize: '0.8rem', color: 'var(--color-text-tertiary)', textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id} style={{
                borderBottom: '1px solid var(--color-border)',
                transition: 'background var(--transition-fast)'
              }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-surface-hover, var(--color-bg))')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: 'var(--radius-full)',
                      background: 'linear-gradient(135deg, var(--color-primary) 0%, #6366f1 100%)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0
                    }}>
                      {u.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                    </div>
                    <span style={{ fontWeight: 500 }}>{u.name}</span>
                  </div>
                </td>
                <td style={{ padding: '14px 16px', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <Mail size={14} /> {u.email}
                  </span>
                </td>
                <td style={{ padding: '14px 16px', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                  {u.phone ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <Phone size={14} /> {u.phone}
                    </span>
                  ) : '—'}
                </td>
                <td style={{ padding: '14px 16px' }}>
                  {getRoleBadge(u.role)}
                </td>
                <td style={{ padding: '14px 16px', color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
                  {new Date(u.createdAt).toLocaleDateString('ru-RU')}
                </td>
                <td style={{ padding: '14px 16px' }}>
                  {u.id !== currentUser?.id && (
                    deleteConfirm === u.id ? (
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          className="btn btn-ghost"
                          onClick={() => handleDelete(u.id)}
                          style={{ color: 'var(--color-error)', padding: '4px 10px', fontSize: '0.8rem' }}
                        >
                          <Check size={14} /> Да
                        </button>
                        <button
                          className="btn btn-ghost"
                          onClick={() => setDeleteConfirm(null)}
                          style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                        >
                          Нет
                        </button>
                      </div>
                    ) : (
                      <button
                        className="btn btn-ghost"
                        onClick={() => setDeleteConfirm(u.id)}
                        style={{ color: 'var(--color-error)', padding: '6px' }}
                        title="Удалить пользователя"
                      >
                        <Trash2 size={16} />
                      </button>
                    )
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-tertiary)' }}>
                  Пользователи не найдены
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add user modal */}
      {showForm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }} onClick={e => { if (e.target === e.currentTarget) setShowForm(false); }}>
          <div className="card animate-slide-up" style={{ width: '100%', maxWidth: '480px', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UserPlus size={22} /> Новый пользователь
              </h2>
              <button onClick={() => setShowForm(false)} className="btn btn-ghost" style={{ padding: '6px' }}>
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px',
                borderRadius: 'var(--radius-md)', background: 'var(--color-error-light, #fef2f2)',
                border: '1px solid var(--color-error)', color: 'var(--color-error)',
                fontSize: '0.85rem', marginBottom: '16px'
              }}>
                <AlertCircle size={16} /> {formError}
              </div>
            )}
            {formSuccess && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px',
                borderRadius: 'var(--radius-md)', background: 'var(--color-success-light, #ecfdf5)',
                border: '1px solid var(--color-success, #10b981)', color: 'var(--color-success, #10b981)',
                fontSize: '0.85rem', marginBottom: '16px'
              }}>
                <Check size={16} /> {formSuccess}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Роль</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {([
                    { value: 'tenant', label: '🔑 Арендатор' },
                    { value: 'owner', label: '🏠 Владелец' },
                  ] as { value: UserRole; label: string }[]).map(r => (
                    <button
                      key={r.value} type="button"
                      onClick={() => setFormData({ ...formData, role: r.value })}
                      style={{
                        padding: '10px', borderRadius: 'var(--radius-md)', border: '2px solid',
                        borderColor: formData.role === r.value ? 'var(--color-primary)' : 'var(--color-border)',
                        background: formData.role === r.value ? 'var(--color-primary-light)' : 'var(--color-surface)',
                        color: formData.role === r.value ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                        cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
                        transition: 'all var(--transition-fast)', fontFamily: 'inherit'
                      }}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Имя *</label>
                <input
                  className="form-input" placeholder="Иванов Иван"
                  value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email *</label>
                <input
                  type="email" className="form-input" placeholder="user@email.com"
                  value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Телефон</label>
                <input
                  className="form-input" placeholder="+992 900 000000"
                  value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Пароль *</label>
                <div style={{ position: 'relative' }}>
                  <Key size={16} style={{
                    position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                    color: 'var(--color-text-tertiary)'
                  }} />
                  <input
                    type="password" className="form-input" placeholder="Минимум 6 символов"
                    value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })}
                    style={{ paddingLeft: 38 }}
                    required minLength={6}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)} style={{ flex: 1 }}>
                  Отмена
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  <UserPlus size={16} /> Создать
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
