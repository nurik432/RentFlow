import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency, formatMonth, getMonthKey } from '../../utils/helpers';
import { CreditCard, Gauge, Receipt, MessageSquare, AlertCircle, ArrowRight, Home, Sparkles } from 'lucide-react';

export default function TenantDashboardPage() {
  const { properties, payments, utilityBills, meterReadings, notifications } = useData();
  const { user } = useAuth();
  const navigate = useNavigate();
  const currentMonth = getMonthKey();

  const myProperty = properties.find(p => p.tenantId === user?.id);
  const monthPayment = payments.find(p => p.tenantId === user?.id && p.month === currentMonth);
  const monthBill = utilityBills.find(b => b.tenantId === user?.id && b.month === currentMonth);
  const monthReading = meterReadings.find(m => m.tenantId === user?.id && m.month === currentMonth);
  const myNotifs = notifications.filter(n => n.userId === user?.id && !n.read);

  const pendingBills = utilityBills.filter(b => b.tenantId === user?.id && !b.acknowledged);

  return (
    <div className="page-container animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* Premium Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, var(--color-primary) 0%, #4f46e5 100%)',
        borderRadius: 'var(--radius-lg)',
        padding: '32px',
        color: '#ffffff',
        marginBottom: '28px',
        boxShadow: 'var(--shadow-md)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative elements */}
        <div style={{ position: 'absolute', top: '-20%', right: '-5%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '-20%', right: '15%', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%' }} />
        
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.2)', padding: '6px 12px', borderRadius: 'var(--radius-full)', width: 'fit-content', fontSize: '0.85rem', fontWeight: 600, backdropFilter: 'blur(4px)' }}>
            <Sparkles size={14} /> Личный кабинет арендатора
          </div>
          <h1 style={{ fontSize: '2rem', margin: '4px 0', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Добрый день, {user?.name?.split(' ')[0]} 👋
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.05rem', opacity: 0.9, marginTop: '4px' }}>
            <Home size={18} />
            {myProperty ? myProperty.address : 'Объект ещё не привязан'}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }}>
        
        {/* Stats Row */}
        <div>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '16px', fontWeight: 700 }}>Сводка за {formatMonth(currentMonth)}</h2>
          <div className="stats-grid">
            <div className="stat-card" onClick={() => navigate('/tenant/payments')} style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div className="stat-card-icon" style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)', width: '48px', height: '48px' }}>
                  <CreditCard size={24} />
                </div>
                {monthPayment ? (
                  <span className={`badge badge-${monthPayment.status === 'received' ? 'success' : 'warning'}`}>
                    {monthPayment.status === 'received' ? 'Оплачено' : 'Ожидается'}
                  </span>
                ) : (
                  <span className="badge badge-neutral">Нет счёта</span>
                )}
              </div>
              <div className="stat-card-label" style={{ fontSize: '0.95rem', marginBottom: '4px' }}>Арендная плата</div>
              <div className="stat-card-value" style={{ fontSize: '1.75rem' }}>{myProperty ? formatCurrency(myProperty.monthlyRent, user?.currency) : '—'}</div>
            </div>

            <div className="stat-card" onClick={() => navigate('/tenant/meters')} style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div className="stat-card-icon" style={{ background: 'var(--color-warning-light)', color: 'var(--color-warning)', width: '48px', height: '48px' }}>
                  <Gauge size={24} />
                </div>
                {monthReading ? (
                  <span className="badge badge-success">Переданы</span>
                ) : (
                  <span className="badge badge-warning">Ожидается</span>
                )}
              </div>
              <div className="stat-card-label" style={{ fontSize: '0.95rem', marginBottom: '4px' }}>Показания счётчиков</div>
              <div className="stat-card-value" style={{ fontSize: '1.75rem' }}>
                {myProperty ? `До ${myProperty.meterReadingDay} числа` : '—'}
              </div>
            </div>

            <div className="stat-card" onClick={() => navigate('/tenant/payments')} style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div className="stat-card-icon" style={{ background: 'var(--color-info-light)', color: 'var(--color-info)', width: '48px', height: '48px' }}>
                  <Receipt size={24} />
                </div>
                {monthBill && monthBill.acknowledged ? (
                  <span className="badge badge-success">Оплачено</span>
                ) : monthBill ? (
                  <span className="badge badge-warning">К оплате</span>
                ) : (
                  <span className="badge badge-neutral">Нет счёта</span>
                )}
              </div>
              <div className="stat-card-label" style={{ fontSize: '0.95rem', marginBottom: '4px' }}>Коммунальные услуги</div>
              <div className="stat-card-value" style={{ fontSize: '1.75rem' }}>{monthBill ? formatCurrency(monthBill.totalAmount, user?.currency) : '—'}</div>
            </div>
          </div>
        </div>

        {/* Info Row: 2 columns */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {pendingBills.length > 0 && (
            <div className="card animate-slide-up" style={{ 
              borderColor: 'var(--color-warning)', 
              background: 'linear-gradient(to right, var(--color-warning-light), var(--color-surface))',
              borderLeftWidth: '4px'
            }}>
              <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--color-text)' }}>
                <AlertCircle size={20} style={{ color: 'var(--color-warning)' }} /> 
                <span style={{ fontWeight: 700 }}>Требуется ваше внимание</span>
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {pendingBills.map(bill => (
                  <div key={bill.id} style={{ 
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                    padding: '16px', background: 'var(--color-surface)', borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border-light)'
                  }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '1.05rem', marginBottom: '4px' }}>Коммуналка {formatMonth(bill.month)}</div>
                      <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                        К оплате: <span style={{ fontWeight: 700, color: 'var(--color-text)' }}>{formatCurrency(bill.totalAmount, user?.currency)}</span>
                      </div>
                    </div>
                    <button className="btn btn-primary btn-sm" onClick={() => navigate('/tenant/payments')}>
                      Оплатить <ArrowRight size={14} style={{ marginLeft: '4px' }} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick actions */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <h3 className="card-title" style={{ marginBottom: '20px' }}>Быстрые действия</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
              <button className="btn btn-primary btn-lg" onClick={() => navigate('/tenant/meters')} style={{ width: '100%', justifyContent: 'flex-start', padding: '16px' }}>
                <Gauge size={22} style={{ marginRight: '8px' }} /> 
                Передать показания счётчиков
              </button>
              <button className="btn btn-secondary btn-lg" onClick={() => navigate('/tenant/payments')} style={{ width: '100%', justifyContent: 'flex-start', padding: '16px' }}>
                <CreditCard size={22} style={{ marginRight: '8px' }} /> 
                История платежей
              </button>
              <button className="btn btn-ghost btn-lg" onClick={() => navigate('/tenant/chat')} style={{ width: '100%', justifyContent: 'flex-start', padding: '16px', background: 'var(--color-surface-hover)' }}>
                <MessageSquare size={22} style={{ marginRight: '8px' }} /> 
                Связаться с владельцем
              </button>
            </div>
          </div>

          {/* Recent notifications */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 className="card-title" style={{ margin: 0 }}>Уведомления</h3>
              {myNotifs.length > 0 && <span className="badge badge-primary">{myNotifs.length} новых</span>}
            </div>
            
            {myNotifs.length > 0 ? (
              <div className="flex-col gap-sm">
                {myNotifs.slice(0, 4).map(n => (
                  <div key={n.id} style={{
                    padding: '16px', borderRadius: 'var(--radius-md)',
                    background: 'var(--color-primary-light)', borderLeft: '3px solid var(--color-primary)',
                    transition: 'background 0.2s'
                  }}>
                    <div style={{ fontWeight: 600, color: 'var(--color-text)', marginBottom: '4px' }}>{n.title}</div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>{n.message}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state" style={{ padding: '32px 0' }}>
                <div style={{ background: 'var(--color-surface-hover)', padding: '16px', borderRadius: '50%', marginBottom: '16px' }}>
                  <AlertCircle size={32} color="var(--color-text-tertiary)" />
                </div>
                <p>У вас нет новых уведомлений</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
