import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency, formatDate, formatMonth, getStatusLabel, getStatusColor, getPropertyTypeLabel } from '../../utils/helpers';
import {
  ArrowLeft, MapPin, Calendar, CreditCard, Gauge, FileText,
  ClipboardList, Edit, Trash2, User, CheckCircle
} from 'lucide-react';
import { PaymentStatus } from '../../types';

export default function PropertyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { properties, payments, utilityBills, meterReadings, tasks, deleteProperty, getTenantName, updatePayment } = useData();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const prop = properties.find(p => p.id === id);
  if (!prop) return (
    <div className="page-container"><div className="empty-state"><h3>Объект не найден</h3>
      <button className="btn btn-primary" onClick={() => navigate('/owner/properties')}>К списку</button>
    </div></div>
  );

  const propPayments = payments.filter(p => p.propertyId === id).sort((a, b) => b.month.localeCompare(a.month));
  const propBills = utilityBills.filter(u => u.propertyId === id).sort((a, b) => b.month.localeCompare(a.month));
  const propReadings = meterReadings.filter(m => m.propertyId === id).sort((a, b) => b.month.localeCompare(a.month));
  const propTasks = tasks.filter(t => t.propertyId === id);

  const handleDelete = () => {
    if (confirm('Удалить этот объект?')) { deleteProperty(prop.id); navigate('/owner/properties'); }
  };

  const handleChangePaymentStatus = (paymentId: string, newStatus: PaymentStatus) => {
    const updates: { status: PaymentStatus; paidAt?: string } = { status: newStatus };
    if (newStatus === 'received') {
      updates.paidAt = new Date().toISOString();
    }
    updatePayment(paymentId, updates);
  };

  const tabs = [
    { key: 'overview', label: 'Обзор', icon: FileText },
    { key: 'payments', label: 'Платежи', icon: CreditCard },
    { key: 'meters', label: 'Показания', icon: Gauge },
    { key: 'tasks', label: 'Задачи', icon: ClipboardList },
  ];

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        <button className="btn btn-ghost btn-icon" onClick={() => navigate('/owner/properties')}>
          <ArrowLeft size={20} />
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <h1 style={{ margin: 0 }}>{prop.name}</h1>
            <span className={`badge badge-${getStatusColor(prop.status)}`}>{getStatusLabel(prop.status)}</span>
            <span className="badge badge-neutral">{getPropertyTypeLabel(prop.type)}</span>
          </div>
          <p style={{ marginTop: 4 }}><MapPin size={14} style={{ display: 'inline', verticalAlign: '-2px' }} /> {prop.address}</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/owner/properties/${prop.id}/edit`)}>
            <Edit size={14} /> Редактировать
          </button>
          <button className="btn btn-danger btn-sm" onClick={handleDelete}><Trash2 size={14} /></button>
        </div>
      </div>

      <div className="tabs">
        {tabs.map(tab => (
          <button key={tab.key} className={`tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}>
            <tab.icon size={15} style={{ marginRight: 6, verticalAlign: '-2px' }} />{tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="grid-2" style={{ gap: '24px' }}>
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: '16px' }}>Информация</h3>
            <div style={{ display: 'grid', gap: '12px' }}>
              {[
                ['Тип', getPropertyTypeLabel(prop.type)],
                ['Аренда', formatCurrency(prop.monthlyRent, user?.currency) + '/мес'],
                ['Арендатор', prop.tenantId ? getTenantName(prop.tenantId) : 'Не назначен'],
                ['Договор', prop.contractStartDate ? `с ${formatDate(prop.contractStartDate)}, ${prop.contractDuration} мес.` : 'Не указано'],
                ['Статус договора', getStatusLabel(prop.contractStatus)],
                ['День оплаты', `${prop.paymentDay}-е число`],
                ['День показаний', `${prop.meterReadingDay}-е число`],
              ].map(([label, value]) => (
                <div key={label as string} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--color-border-light)' }}>
                  <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>{label}</span>
                  <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: '16px' }}>Описание</h3>
            <p style={{ lineHeight: 1.7 }}>{prop.description || 'Описание не указано'}</p>
            {prop.photo && <img src={prop.photo} alt={prop.name} style={{ width: '100%', marginTop: '16px', borderRadius: 'var(--radius-md)' }} />}
          </div>
        </div>
      )}

      {activeTab === 'payments' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Rent payments */}
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: '16px' }}>Арендная плата</h3>
            {propPayments.length > 0 ? (
              <div className="table-container" style={{ border: 'none' }}>
                <table className="table">
                  <thead><tr><th>Месяц</th><th>Сумма</th><th>Статус</th><th>Дата оплаты</th><th>Действие</th></tr></thead>
                  <tbody>
                    {propPayments.map(p => (
                      <tr key={p.id}>
                        <td>{formatMonth(p.month)}</td>
                        <td style={{ fontWeight: 500 }}>{formatCurrency(p.amount, user?.currency)}</td>
                        <td><span className={`badge badge-${getStatusColor(p.status)}`}>{getStatusLabel(p.status)}</span></td>
                        <td>{p.paidAt ? formatDate(p.paidAt) : '—'}</td>
                        <td>
                          <select
                            className="form-select"
                            value={p.status}
                            onChange={e => handleChangePaymentStatus(p.id, e.target.value as PaymentStatus)}
                            style={{ fontSize: '0.8rem', padding: '4px 8px', width: 'auto', minWidth: '120px' }}
                          >
                            <option value="pending">Ожидается</option>
                            <option value="received">Получен</option>
                            <option value="overdue">Просрочен</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state"><h3>Нет платежей</h3><p>История арендных платежей появится здесь</p></div>
            )}
          </div>

          {/* Utility bills */}
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: '16px' }}>Коммунальные платежи</h3>
            {propBills.length > 0 ? (
              <div className="table-container" style={{ border: 'none' }}>
                <table className="table">
                  <thead><tr><th>Месяц</th><th>Электро</th><th>Хол. вода</th><th>Гор. вода</th><th>Газ</th><th>Итого</th><th>Статус</th></tr></thead>
                  <tbody>
                    {propBills.map(bill => (
                      <tr key={bill.id}>
                        <td>{formatMonth(bill.month)}</td>
                        <td>{bill.electricity ? formatCurrency(bill.electricity, user?.currency) : '—'}</td>
                        <td>{bill.coldWater ? formatCurrency(bill.coldWater, user?.currency) : '—'}</td>
                        <td>{bill.hotWater ? formatCurrency(bill.hotWater, user?.currency) : '—'}</td>
                        <td>{bill.gas ? formatCurrency(bill.gas, user?.currency) : '—'}</td>
                        <td style={{ fontWeight: 600 }}>{formatCurrency(bill.total, user?.currency)}</td>
                        <td>
                          {bill.acknowledged ? (
                            <span className="badge badge-success">Подтверждено</span>
                          ) : (
                            <span className="badge badge-warning">Ожидает</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state"><h3>Нет начислений</h3><p>Коммунальные начисления появятся здесь</p></div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'meters' && (
        <div className="card">
          {propReadings.length > 0 ? (
            <div className="table-container" style={{ border: 'none' }}>
              <table className="table">
                <thead><tr><th>Месяц</th><th>Холодн. вода</th><th>Горяч. вода</th><th>Электричество</th><th>Водоотведение</th><th>Дата подачи</th></tr></thead>
                <tbody>
                  {propReadings.map(r => (
                    <tr key={r.id}>
                      <td>{formatMonth(r.month)}</td>
                      <td>{r.coldWater ?? '—'} {r.consumption?.coldWater != null && <span className="text-muted text-sm">(+{r.consumption.coldWater})</span>}</td>
                      <td>{r.hotWater ?? '—'} {r.consumption?.hotWater != null && <span className="text-muted text-sm">(+{r.consumption.hotWater})</span>}</td>
                      <td>{r.electricity ?? '—'} {r.consumption?.electricity != null && <span className="text-muted text-sm">(+{r.consumption.electricity})</span>}</td>
                      <td>{r.sewage ?? '—'} {r.consumption?.sewage != null && <span className="text-muted text-sm">(+{r.consumption.sewage})</span>}</td>
                      <td className="text-muted text-sm">{formatDate(r.submittedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state"><h3>Нет показаний</h3><p>Показания счётчиков появятся после подачи арендатором</p></div>
          )}
        </div>
      )}

      {activeTab === 'tasks' && (
        <div className="card">
          {propTasks.length > 0 ? (
            <div className="flex-col gap-sm">
              {propTasks.map(t => (
                <div key={t.id} style={{
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '12px',
                  borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-light)'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500 }}>{t.title}</div>
                    <div className="text-sm text-muted">{t.assignee} • до {formatDate(t.deadline)}</div>
                  </div>
                  <span className={`badge badge-${getStatusColor(t.status)}`}>{getStatusLabel(t.status)}</span>
                  <span className={`badge badge-${getStatusColor(t.priority)}`}>{getStatusLabel(t.priority)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state"><h3>Нет задач</h3><p>Создайте задачу для этого объекта</p></div>
          )}
        </div>
      )}
    </div>
  );
}
