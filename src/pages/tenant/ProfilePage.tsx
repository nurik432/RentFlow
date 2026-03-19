import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { User, Save, Mail, Bell } from 'lucide-react';
import { NotificationChannel } from '../../types';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [telegram, setTelegram] = useState(user?.telegramChatId || '');
  const [channel, setChannel] = useState<NotificationChannel>(user?.preferredChannel || 'email');
  const [currency, setCurrency] = useState(user?.currency || 'TJS');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateUser({ name, email, phone, telegramChatId: telegram, preferredChannel: channel, currency: currency as 'TJS' | 'RUB' });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <h1>Профиль</h1>
        <p>Настройки аккаунта и уведомлений</p>
      </div>

      <div className="card" style={{ maxWidth: 560 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid var(--color-border)' }}>
          <div className="avatar avatar-lg" style={{ width: 56, height: 56, fontSize: '1.25rem' }}>
            {user?.name?.charAt(0)}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{user?.name}</div>
            <div className="text-sm text-muted">{user?.role === 'owner' ? 'Владелец' : 'Арендатор'}</div>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Имя</label>
            <input className="form-input" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Телефон</label>
            <input className="form-input" value={phone} onChange={e => setPhone(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Telegram Chat ID</label>
            <input className="form-input" placeholder="123456789" value={telegram} onChange={e => setTelegram(e.target.value)} />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Канал уведомлений</label>
            <select className="form-select" value={channel} onChange={e => setChannel(e.target.value as NotificationChannel)}>
              <option value="email">Email</option>
              <option value="telegram">Telegram</option>
              <option value="inapp">Только в приложении</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Валюта</label>
            <select className="form-select" value={currency} onChange={e => setCurrency(e.target.value)}>
              <option value="TJS">TJS (Сомони)</option>
              <option value="RUB">RUB (Рубль)</option>
            </select>
          </div>
        </div>

        <button className="btn btn-primary mt-md" onClick={handleSave}>
          <Save size={18} /> Сохранить
        </button>
        {saved && <span className="text-success" style={{ marginLeft: 12, fontSize: '0.85rem' }}>✓ Сохранено</span>}
      </div>
    </div>
  );
}
