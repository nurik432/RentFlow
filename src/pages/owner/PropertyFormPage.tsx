import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { PropertyType, PropertyStatus, ContractStatus } from '../../types';
import { Save, ArrowLeft, Upload } from 'lucide-react';

export default function PropertyFormPage() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const { properties, addProperty, updateProperty } = useData();
  const { user, getAllUsers } = useAuth();
  const navigate = useNavigate();

  // All tenants
  const tenants = getAllUsers().filter(u => u.role === 'tenant');

  const [form, setForm] = useState({
    name: '', type: 'apartment' as PropertyType, address: '', description: '',
    photo: '', status: 'available' as PropertyStatus, monthlyRent: 0,
    contractStartDate: '', contractDuration: 12, contractStatus: 'awaiting' as ContractStatus,
    tenantId: '', paymentDay: 25, meterReadingDay: 28, reminderDaysBefore: 3
  });

  useEffect(() => {
    if (isEditing) {
      const prop = properties.find(p => p.id === id);
      if (prop) {
        setForm(prop as typeof form);
      } else {
        navigate('/owner/properties');
      }
    }
  }, [id, isEditing, properties, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      updateProperty(id!, form);
    } else {
      addProperty({ ...form, ownerId: user!.id });
    }
    navigate('/owner/properties');
  };

  const u = (field: string, value: any) => setForm({ ...form, [field]: value });

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button className="btn btn-ghost btn-icon" onClick={() => navigate('/owner/properties')}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1>{isEditing ? 'Редактировать объект' : 'Новый объект'}</h1>
          <p>{isEditing ? 'Измените данные объекта' : 'Заполните информацию об объекте недвижимости'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card" style={{ maxWidth: 720 }}>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Название *</label>
            <input className="form-input" placeholder="2-комн. квартира на Рудаки" required
              value={form.name} onChange={e => u('name', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Тип объекта</label>
            <select className="form-select" value={form.type} onChange={e => u('type', e.target.value)}>
              <option value="apartment">Квартира</option>
              <option value="office">Офис</option>
              <option value="warehouse">Склад</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Адрес *</label>
          <input className="form-input" placeholder="г. Душанбе, ул. Рудаки, 45" required
            value={form.address} onChange={e => u('address', e.target.value)} />
        </div>

        <div className="form-group">
          <label className="form-label">Описание</label>
          <textarea className="form-textarea" placeholder="Описание объекта..."
            value={form.description} onChange={e => u('description', e.target.value)} />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Сумма аренды (мес) *</label>
            <input className="form-input" type="number" placeholder="5000" required
              value={form.monthlyRent || ''} onChange={e => u('monthlyRent', +e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Статус</label>
            <select className="form-select" value={form.status} onChange={e => u('status', e.target.value)}>
              <option value="available">Свободен</option>
              <option value="rented">Сдан</option>
              <option value="preparing">Готовится к сдаче</option>
            </select>
          </div>
        </div>

        {/* Tenant Assignment Section */}
        <div className="form-group" style={{ 
          background: 'var(--color-bg)', padding: '16px', borderRadius: 'var(--radius-md)', 
          border: '1px solid var(--color-border)', marginBottom: '24px'
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '16px' }}>Привязка арендатора</h3>
          <div className="form-row">
            <div className="form-group mb-0">
              <label className="form-label">Арендатор</label>
              <select className="form-select" value={form.tenantId || ''} onChange={e => u('tenantId', e.target.value)}>
                <option value="">-- Не назначен --</option>
                {tenants.map(t => (
                  <option key={t.id} value={t.id}>{t.name} ({t.email})</option>
                ))}
              </select>
              <div className="form-hint">Выберите арендатора, привязанного к объекту.</div>
            </div>
            
            <div className="form-group mb-0">
              <label className="form-label">Статус договора</label>
              <select className="form-select" value={form.contractStatus} onChange={e => u('contractStatus', e.target.value)}>
                <option value="awaiting">Ожидает</option>
                <option value="signed">Подписан</option>
                <option value="expired">Истёк</option>
              </select>
            </div>
          </div>
          
          <div className="form-row" style={{ marginTop: '16px' }}>
            <div className="form-group mb-0">
              <label className="form-label">Дата начала договора</label>
              <input className="form-input" type="date"
                value={form.contractStartDate} onChange={e => u('contractStartDate', e.target.value)} />
            </div>
            <div className="form-group mb-0">
              <label className="form-label">Срок аренды (мес)</label>
              <input className="form-input" type="number" value={form.contractDuration}
                onChange={e => u('contractDuration', +e.target.value)} />
            </div>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">День оплаты аренды</label>
            <input className="form-input" type="number" min="1" max="28" value={form.paymentDay}
              onChange={e => u('paymentDay', +e.target.value)} />
            <div className="form-hint">Число месяца (1-28)</div>
          </div>
          <div className="form-group">
            <label className="form-label">День подачи показаний</label>
            <input className="form-input" type="number" min="1" max="28" value={form.meterReadingDay}
              onChange={e => u('meterReadingDay', +e.target.value)} />
            <div className="form-hint">Число месяца (1-28)</div>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Напоминание за N дней</label>
          <input className="form-input" type="number" min="1" max="10" value={form.reminderDaysBefore}
            onChange={e => u('reminderDaysBefore', +e.target.value)} style={{ maxWidth: 160 }} />
        </div>

        <div className="form-group">
          <label className="form-label">Фото объекта</label>
          <label style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            padding: '24px', border: '2px dashed var(--color-border)', borderRadius: 'var(--radius-md)',
            cursor: 'pointer', color: 'var(--color-text-secondary)', fontSize: '0.9rem',
            transition: 'border-color var(--transition-fast)'
          }}>
            <Upload size={20} />
            Нажмите для загрузки фото
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = () => u('photo', reader.result as string);
                reader.readAsDataURL(file);
              }
            }} />
          </label>
          {form.photo && <img src={form.photo} alt="Preview" style={{ marginTop: 12, maxHeight: 200, borderRadius: 'var(--radius-md)', objectFit: 'cover' }} />}
        </div>

        <div className="form-group">
          <label className="form-label">Договор (PDF)</label>
          <label style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            padding: '16px', border: '2px dashed var(--color-border)', borderRadius: 'var(--radius-md)',
            cursor: 'pointer', color: 'var(--color-text-secondary)', fontSize: '0.9rem'
          }}>
            <Upload size={20} />
            Загрузить PDF документ
            <input type="file" accept=".pdf" style={{ display: 'none' }} />
          </label>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
          <button type="submit" className="btn btn-primary">
            <Save size={18} /> {isEditing ? 'Сохранить изменения' : 'Создать объект'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate(isEditing ? `/owner/properties/${id}` : '/owner/properties')}>
            Отмена
          </button>
        </div>
      </form>
    </div>
  );
}
