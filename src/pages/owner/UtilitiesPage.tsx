import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency, formatMonth, getMonthKey } from '../../utils/helpers';
import { Plus, Receipt, Check, X, Edit } from 'lucide-react';
import { UtilityBill } from '../../types';

type BillForm = { propertyId: string; month: string; electricity: number; coldWater: number; hotWater: number; gas: number };

const emptyForm: BillForm = { propertyId: '', month: getMonthKey(), electricity: 0, coldWater: 0, hotWater: 0, gas: 0 };

export default function UtilitiesPage() {
  const { properties, utilityBills, addUtilityBill, updateUtilityBill } = useData();
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingBill, setEditingBill] = useState<UtilityBill | null>(null);
  const [filterProperty, setFilterProperty] = useState('all');
  const [filterMonth, setFilterMonth] = useState('');
  const [form, setForm] = useState<BillForm>({ ...emptyForm });

  const rentedProps = properties.filter(p => p.status === 'rented');

  const filteredBills = utilityBills.filter(b => {
    if (filterProperty !== 'all' && b.propertyId !== filterProperty) return false;
    if (filterMonth && b.month !== filterMonth) return false;
    return true;
  }).sort((a, b) => b.month.localeCompare(a.month));

  const openAdd = () => {
    setEditingBill(null);
    setForm({ ...emptyForm });
    setShowForm(true);
  };

  const openEdit = (bill: UtilityBill) => {
    setEditingBill(bill);
    setForm({
      propertyId: bill.propertyId,
      month: bill.month,
      electricity: bill.electricity || 0,
      coldWater: bill.coldWater || 0,
      hotWater: bill.hotWater || 0,
      gas: bill.gas || 0,
    });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const total = (form.electricity || 0) + (form.coldWater || 0) + (form.hotWater || 0) + (form.gas || 0);

    if (editingBill) {
      // Update existing
      updateUtilityBill(editingBill.id, {
        month: form.month,
        electricity: form.electricity || undefined,
        coldWater: form.coldWater || undefined,
        hotWater: form.hotWater || undefined,
        gas: form.gas || undefined,
        total,
      });
    } else {
      // Create new
      const prop = properties.find(p => p.id === form.propertyId);
      if (!prop || !prop.tenantId) return;
      addUtilityBill({
        propertyId: form.propertyId, tenantId: prop.tenantId, month: form.month,
        electricity: form.electricity || undefined, coldWater: form.coldWater || undefined,
        hotWater: form.hotWater || undefined, gas: form.gas || undefined,
        total, acknowledged: false
      });
    }
    setShowForm(false);
    setEditingBill(null);
    setForm({ ...emptyForm });
  };

  const u = (field: string, value: any) => setForm({ ...form, [field]: value });

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header flex-between" style={{ flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1>Коммунальные платежи</h1>
          <p>Начисления за коммунальные услуги по объектам</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <Plus size={18} /> Добавить начисление
        </button>
      </div>

      <div className="filters-bar">
        <select className="form-select" value={filterProperty} onChange={e => setFilterProperty(e.target.value)}>
          <option value="all">Все объекты</option>
          {rentedProps.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <input type="month" className="form-input" value={filterMonth} onChange={e => setFilterMonth(e.target.value)}
          style={{ width: 'auto' }} />
      </div>

      {/* Add/Edit modal */}
      {showForm && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3>{editingBill ? 'Редактировать начисление' : 'Новое начисление'}</h3>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setShowForm(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {!editingBill && (
                  <div className="form-group">
                    <label className="form-label">Объект *</label>
                    <select className="form-select" required value={form.propertyId} onChange={e => u('propertyId', e.target.value)}>
                      <option value="">Выберите объект</option>
                      {rentedProps.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label">Месяц *</label>
                  <input type="month" className="form-input" required value={form.month} onChange={e => u('month', e.target.value)} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Электричество</label>
                    <input type="number" className="form-input" placeholder="0" value={form.electricity || ''} onChange={e => u('electricity', +e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Газ</label>
                    <input type="number" className="form-input" placeholder="0" value={form.gas || ''} onChange={e => u('gas', +e.target.value)} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Холодная вода</label>
                    <input type="number" className="form-input" placeholder="0" value={form.coldWater || ''} onChange={e => u('coldWater', +e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Горячая вода</label>
                    <input type="number" className="form-input" placeholder="0" value={form.hotWater || ''} onChange={e => u('hotWater', +e.target.value)} />
                  </div>
                </div>
                <div className="card" style={{ background: 'var(--color-bg-secondary)', marginTop: '8px' }}>
                  <div className="flex-between">
                    <span style={{ fontWeight: 600 }}>Итого:</span>
                    <span style={{ fontWeight: 700, fontSize: '1.125rem', color: 'var(--color-primary)' }}>
                      {formatCurrency((form.electricity || 0) + (form.coldWater || 0) + (form.hotWater || 0) + (form.gas || 0), user?.currency)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Отмена</button>
                <button type="submit" className="btn btn-primary">{editingBill ? 'Сохранить изменения' : 'Сохранить'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {filteredBills.length > 0 ? (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Месяц</th>
                <th>Объект</th>
                <th>Электро</th>
                <th>Хол. вода</th>
                <th>Гор. вода</th>
                <th>Газ</th>
                <th>Итого</th>
                <th>Подтверждено</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredBills.map(bill => {
                const prop = properties.find(p => p.id === bill.propertyId);
                return (
                  <tr key={bill.id}>
                    <td>{formatMonth(bill.month)}</td>
                    <td style={{ fontWeight: 500 }}>{prop?.name || '—'}</td>
                    <td>{bill.electricity ? formatCurrency(bill.electricity, user?.currency) : '—'}</td>
                    <td>{bill.coldWater ? formatCurrency(bill.coldWater, user?.currency) : '—'}</td>
                    <td>{bill.hotWater ? formatCurrency(bill.hotWater, user?.currency) : '—'}</td>
                    <td>{bill.gas ? formatCurrency(bill.gas, user?.currency) : '—'}</td>
                    <td style={{ fontWeight: 600 }}>{formatCurrency(bill.total, user?.currency)}</td>
                    <td>
                      {bill.acknowledged ? (
                        <span className="badge badge-success"><Check size={12} /> Да</span>
                      ) : (
                        <span className="badge badge-warning">Ожидает</span>
                      )}
                    </td>
                    <td>
                      <button className="btn btn-ghost btn-sm btn-icon" onClick={() => openEdit(bill)} title="Редактировать">
                        <Edit size={15} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon"><Receipt size={36} /></div>
          <h3>Нет начислений</h3>
          <p>Добавьте первое начисление за коммунальные услуги</p>
          <button className="btn btn-primary" onClick={openAdd}>
            <Plus size={18} /> Добавить
          </button>
        </div>
      )}
    </div>
  );
}
