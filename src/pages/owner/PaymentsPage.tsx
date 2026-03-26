import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency, formatMonth, formatDate, getMonthKey, getStatusLabel, getStatusColor } from '../../utils/helpers';
import { Plus, CreditCard, X, Check } from 'lucide-react';

export default function PaymentsPage() {
  const { properties, payments, addPayment, updatePayment, getTenantName } = useData();
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [filterProperty, setFilterProperty] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const [form, setForm] = useState({
    propertyId: '',
    month: getMonthKey(),
    amount: 0,
    type: 'rent' as 'rent' | 'utility',
  });

  const rentedProps = properties.filter(p => p.status === 'rented');

  const filteredPayments = payments.filter(p => {
    if (filterProperty !== 'all' && p.propertyId !== filterProperty) return false;
    if (filterStatus !== 'all' && p.status !== filterStatus) return false;
    return true;
  }).sort((a, b) => b.month.localeCompare(a.month));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const prop = properties.find(p => p.id === form.propertyId);
    if (!prop || !prop.tenantId) return;
    addPayment({
      propertyId: form.propertyId,
      tenantId: prop.tenantId,
      amount: form.amount || prop.monthlyRent,
      type: form.type,
      status: 'pending',
      month: form.month,
    });
    setShowForm(false);
    setForm({ propertyId: '', month: getMonthKey(), amount: 0, type: 'rent' });
  };

  const u = (field: string, value: any) => setForm({ ...form, [field]: value });

  const selectedProp = properties.find(p => p.id === form.propertyId);

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header flex-between" style={{ flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1>Платежи</h1>
          <p>Управление арендными и коммунальными платежами</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={18} /> Создать начисление
        </button>
      </div>

      <div className="filters-bar">
        <select className="form-select" value={filterProperty} onChange={e => setFilterProperty(e.target.value)}>
          <option value="all">Все объекты</option>
          {rentedProps.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select className="form-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">Все статусы</option>
          <option value="pending">Ожидается</option>
          <option value="received">Получен</option>
          <option value="overdue">Просрочен</option>
        </select>
      </div>

      {/* Create modal */}
      {showForm && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3>Новое начисление</h3>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setShowForm(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Объект *</label>
                  <select className="form-select" required value={form.propertyId} onChange={e => u('propertyId', e.target.value)}>
                    <option value="">Выберите объект</option>
                    {rentedProps.map(p => <option key={p.id} value={p.id}>{p.name} — {getTenantName(p.tenantId || '')}</option>)}
                  </select>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Тип *</label>
                    <select className="form-select" value={form.type} onChange={e => u('type', e.target.value)}>
                      <option value="rent">Аренда</option>
                      <option value="utility">Коммуналка</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Месяц *</label>
                    <input type="month" className="form-input" required value={form.month} onChange={e => u('month', e.target.value)} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Сумма *</label>
                  <input type="number" className="form-input" required min={1}
                    placeholder={selectedProp ? `${selectedProp.monthlyRent} (по договору)` : '0'}
                    value={form.amount || ''} onChange={e => u('amount', +e.target.value)} />
                  {selectedProp && !form.amount && (
                    <span className="text-sm text-muted" style={{ marginTop: 4, display: 'block' }}>
                      Если оставить пустым, будет использована сумма по договору: {formatCurrency(selectedProp.monthlyRent, user?.currency)}
                    </span>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Отмена</button>
                <button type="submit" className="btn btn-primary">Создать</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {filteredPayments.length > 0 ? (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Месяц</th>
                <th>Объект</th>
                <th>Арендатор</th>
                <th>Тип</th>
                <th>Сумма</th>
                <th>Статус</th>
                <th>Дата оплаты</th>
                <th>Действие</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map(p => {
                const prop = properties.find(pr => pr.id === p.propertyId);
                return (
                  <tr key={p.id}>
                    <td>{formatMonth(p.month)}</td>
                    <td style={{ fontWeight: 500 }}>{prop?.name || '—'}</td>
                    <td>{getTenantName(p.tenantId)}</td>
                    <td>
                      <span className={`badge badge-${p.type === 'rent' ? 'primary' : 'info'}`}>
                        {p.type === 'rent' ? 'Аренда' : 'Коммуналка'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 500 }}>{formatCurrency(p.amount, user?.currency)}</td>
                    <td><span className={`badge badge-${getStatusColor(p.status)}`}>{getStatusLabel(p.status)}</span></td>
                    <td>{p.paidAt ? formatDate(p.paidAt) : '—'}</td>
                    <td>
                      <select
                        className="form-select"
                        value={p.status}
                        onChange={e => updatePayment(p.id, {
                          status: e.target.value as any,
                          ...(e.target.value === 'received' ? { paidAt: new Date().toISOString() } : {})
                        })}
                        style={{ fontSize: '0.8rem', padding: '4px 8px', width: 'auto', minWidth: '120px' }}
                      >
                        <option value="pending">Ожидается</option>
                        <option value="received">Получен</option>
                        <option value="overdue">Просрочен</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon"><CreditCard size={36} /></div>
          <h3>Нет платежей</h3>
          <p>Создайте первое начисление арендатору</p>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            <Plus size={18} /> Создать
          </button>
        </div>
      )}
    </div>
  );
}
