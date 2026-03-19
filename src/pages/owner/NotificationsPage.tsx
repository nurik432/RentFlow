import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { formatDateTime } from '../../utils/helpers';
import { Bell, CheckCheck, Filter, CreditCard, Gauge, Receipt, MessageSquare, Info } from 'lucide-react';

const typeIcons: Record<string, any> = {
  payment_reminder: CreditCard, meter_request: Gauge, utility_bill: Receipt,
  meter_submitted: Gauge, payment_received: CreditCard, general: Info, chat: MessageSquare
};

const typeLabels: Record<string, string> = {
  payment_reminder: 'Оплата', meter_request: 'Показания', utility_bill: 'Коммуналка',
  meter_submitted: 'Показания', payment_received: 'Оплата', general: 'Общее', chat: 'Чат'
};

export default function NotificationsPage() {
  const { notifications, markNotificationRead, markAllNotificationsRead, properties } = useData();
  const { user } = useAuth();
  const [filterType, setFilterType] = useState('all');

  const userNotifs = notifications
    .filter(n => n.userId === user?.id)
    .filter(n => filterType === 'all' || n.type === filterType)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const unreadCount = notifications.filter(n => !n.read && n.userId === user?.id).length;

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header flex-between" style={{ flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1>Уведомления</h1>
          <p>{unreadCount > 0 ? `${unreadCount} непрочитанных` : 'Все прочитаны'}</p>
        </div>
        {unreadCount > 0 && (
          <button className="btn btn-secondary" onClick={markAllNotificationsRead}>
            <CheckCheck size={18} /> Прочитать все
          </button>
        )}
      </div>

      <div className="filters-bar">
        <select className="form-select" value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="all">Все типы</option>
          <option value="payment_reminder">Оплата</option>
          <option value="meter_request">Запрос показаний</option>
          <option value="meter_submitted">Показания получены</option>
          <option value="utility_bill">Коммуналка</option>
          <option value="payment_received">Платёж получен</option>
        </select>
      </div>

      {userNotifs.length > 0 ? (
        <div className="flex-col gap-sm">
          {userNotifs.map(n => {
            const Icon = typeIcons[n.type] || Bell;
            const prop = properties.find(p => p.id === n.propertyId);
            return (
              <div key={n.id} onClick={() => markNotificationRead(n.id)} style={{
                display: 'flex', alignItems: 'flex-start', gap: '14px', padding: '16px',
                borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)',
                background: n.read ? 'var(--color-surface)' : 'var(--color-primary-50)',
                cursor: 'pointer', transition: 'all var(--transition-fast)'
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 'var(--radius-full)', flexShrink: 0,
                  background: n.type.includes('payment') ? 'var(--color-success-light)' :
                    n.type.includes('meter') ? 'var(--color-info-light)' : 'var(--color-warning-light)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: n.type.includes('payment') ? 'var(--color-success)' :
                    n.type.includes('meter') ? 'var(--color-info)' : 'var(--color-warning)'
                }}>
                  <Icon size={18} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 4 }}>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{n.title}</span>
                    <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>{typeLabels[n.type]}</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>{n.message}</div>
                  <div style={{ display: 'flex', gap: '12px', marginTop: 6 }}>
                    <span className="text-sm text-muted">{formatDateTime(n.createdAt)}</span>
                    {prop && <span className="text-sm text-muted">• {prop.name}</span>}
                  </div>
                </div>
                {!n.read && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-primary)', marginTop: 6, flexShrink: 0 }} />}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon"><Bell size={36} /></div>
          <h3>Нет уведомлений</h3>
          <p>Здесь будут появляться ваши уведомления</p>
        </div>
      )}
    </div>
  );
}
