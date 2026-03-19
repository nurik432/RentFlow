import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency, formatMonth, getMonthKey } from '../../utils/helpers';
import {
  Bar
} from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend
} from 'chart.js';
import {
  TrendingUp, AlertCircle, CalendarDays, Building2,
  ArrowRight, CreditCard, Gauge, Bell
} from 'lucide-react';
import { monthlyRevenue } from '../../data/mockData';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function DashboardPage() {
  const { properties, payments, utilityBills, notifications, meterReadings } = useData();
  const { user } = useAuth();
  const navigate = useNavigate();
  const currentMonth = getMonthKey();

  const rentedProps = properties.filter(p => p.status === 'rented');
  const monthPayments = payments.filter(p => p.month === currentMonth);
  const receivedTotal = monthPayments.filter(p => p.status === 'received').reduce((s, p) => s + p.amount, 0);
  const pendingTotal = monthPayments.filter(p => p.status === 'pending').reduce((s, p) => s + p.amount, 0);
  const totalExpected = rentedProps.reduce((s, p) => s + p.monthlyRent, 0);
  const overduePayments = payments.filter(p => p.status === 'pending' && p.month < currentMonth);
  const unreadNotifs = notifications.filter(n => !n.read && n.userId === user?.id);

  const chartData = {
    labels: monthlyRevenue.map(m => m.month),
    datasets: [{
      label: 'Поступления',
      data: monthlyRevenue.map(m => m.amount),
      backgroundColor: 'rgba(26, 86, 219, 0.8)',
      borderRadius: 6,
      borderSkipped: false,
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: any) => formatCurrency(ctx.raw, user?.currency || 'TJS')
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: { callback: (v: any) => `${v / 1000}K` }
      },
      x: { grid: { display: false } }
    }
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header flex-between">
        <div>
          <h1>Добро пожаловать 👋</h1>
          <p>Обзор вашей недвижимости за {formatMonth(currentMonth)}</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="stats-grid">
        <div className="stat-card" onClick={() => navigate('/owner/properties')} style={{ cursor: 'pointer' }}>
          <div className="stat-card-icon" style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
            <Building2 size={22} />
          </div>
          <div className="stat-card-value">{properties.length}</div>
          <div className="stat-card-label">Объектов • {rentedProps.length} сдано</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: 'var(--color-success-light)', color: 'var(--color-success)' }}>
            <TrendingUp size={22} />
          </div>
          <div className="stat-card-value">{formatCurrency(receivedTotal, user?.currency)}</div>
          <div className="stat-card-label">Получено в этом месяце</div>
        </div>

        <div className="stat-card" onClick={() => navigate('/owner/calendar')} style={{ cursor: 'pointer' }}>
          <div className="stat-card-icon" style={{ background: 'var(--color-warning-light)', color: 'var(--color-warning)' }}>
            <CreditCard size={22} />
          </div>
          <div className="stat-card-value">{formatCurrency(pendingTotal, user?.currency)}</div>
          <div className="stat-card-label">Ожидается к оплате</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: overduePayments.length > 0 ? 'var(--color-error-light)' : 'var(--color-bg-tertiary)', color: overduePayments.length > 0 ? 'var(--color-error)' : 'var(--color-text-tertiary)' }}>
            <AlertCircle size={22} />
          </div>
          <div className="stat-card-value" style={{ color: overduePayments.length > 0 ? 'var(--color-error)' : undefined }}>
            {overduePayments.length}
          </div>
          <div className="stat-card-label">Просроченных платежей</div>
        </div>
      </div>

      <div className="grid-2" style={{ gap: '24px' }}>
        {/* Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Поступления за 12 месяцев</h3>
          </div>
          <div style={{ height: 280 }}>
            <Bar data={chartData} options={chartOptions as any} />
          </div>
        </div>

        {/* Recent events */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Последние уведомления</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/owner/notifications')}>
              Все <ArrowRight size={14} />
            </button>
          </div>
          <div className="flex-col gap-sm">
            {notifications.filter(n => n.userId === user?.id).slice(0, 5).map(n => (
              <div key={n.id} style={{
                display: 'flex', alignItems: 'flex-start', gap: '12px',
                padding: '10px', borderRadius: 'var(--radius-md)',
                background: n.read ? 'transparent' : 'var(--color-primary-50)',
                transition: 'background var(--transition-fast)'
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 'var(--radius-full)', flexShrink: 0,
                  background: n.type === 'payment_received' ? 'var(--color-success-light)' :
                    n.type === 'meter_submitted' ? 'var(--color-info-light)' : 'var(--color-warning-light)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: n.type === 'payment_received' ? 'var(--color-success)' :
                    n.type === 'meter_submitted' ? 'var(--color-info)' : 'var(--color-warning)'
                }}>
                  {n.type === 'payment_received' ? <CreditCard size={14} /> :
                    n.type === 'meter_submitted' ? <Gauge size={14} /> : <Bell size={14} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--color-text)' }}>{n.title}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: 2 }}>{n.message}</div>
                </div>
                {!n.read && <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-primary)', marginTop: 6, flexShrink: 0 }} />}
              </div>
            ))}
            {notifications.filter(n => n.userId === user?.id).length === 0 && (
              <p style={{ textAlign: 'center', padding: '20px', color: 'var(--color-text-tertiary)' }}>
                Нет уведомлений
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Summary table */}
      <div className="card mt-xl">
        <div className="card-header">
          <h3 className="card-title">Сводная таблица</h3>
        </div>
        <div className="table-container" style={{ border: 'none' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Объект</th>
                <th>Арендатор</th>
                <th>Аренда</th>
                <th>Коммуналка</th>
                <th>Статус оплаты</th>
                <th>Показания</th>
              </tr>
            </thead>
            <tbody>
              {rentedProps.map(prop => {
                const payment = payments.find(p => p.propertyId === prop.id && p.month === currentMonth);
                const utility = utilityBills.find(u => u.propertyId === prop.id && u.month === currentMonth);
                const meter = meterReadings.find(m => m.propertyId === prop.id && m.month === currentMonth);
                const tenantName = prop.tenantId ? (prop.tenantId === 'tenant-1' ? 'Мария Петрова' : 'Дмитрий Сидоров') : '—';
                return (
                  <tr key={prop.id} onClick={() => navigate(`/owner/properties/${prop.id}`)} style={{ cursor: 'pointer' }}>
                    <td style={{ fontWeight: 500 }}>{prop.name}</td>
                    <td>{tenantName}</td>
                    <td>{formatCurrency(prop.monthlyRent, user?.currency)}</td>
                    <td>{utility ? formatCurrency(utility.total, user?.currency) : '—'}</td>
                    <td>
                      <span className={`badge badge-${payment?.status === 'received' ? 'success' : payment?.status === 'overdue' ? 'error' : 'warning'}`}>
                        {payment?.status === 'received' ? 'Получен' : payment?.status === 'overdue' ? 'Просрочен' : 'Ожидается'}
                      </span>
                    </td>
                    <td>
                      {meter ? (
                        <span className="badge badge-success">Переданы</span>
                      ) : (
                        <span className="badge badge-warning">Ожидаются</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
