import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { formatMonth, getMonthKey } from '../../utils/helpers';
import { Send, Upload, Gauge, Check, Camera } from 'lucide-react';

export default function MeterReadingsPage() {
  const { properties, meterReadings, addMeterReading } = useData();
  const { user } = useAuth();
  const currentMonth = getMonthKey();

  const myProperty = properties.find(p => p.tenantId === user?.id);
  const prevReadings = meterReadings
    .filter(m => m.tenantId === user?.id)
    .sort((a, b) => b.month.localeCompare(a.month));
  const lastReading = prevReadings[0];
  const currentReading = meterReadings.find(m => m.tenantId === user?.id && m.month === currentMonth);

  const [form, setForm] = useState({
    coldWater: '', hotWater: '', electricityDay: '', electricityNight: '', gas: '', photo: ''
  });
  const [submitted, setSubmitted] = useState(!!currentReading);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!myProperty || !user) return;

    const current = {
      coldWater: +form.coldWater || undefined,
      hotWater: +form.hotWater || undefined,
      electricityDay: +form.electricityDay || undefined,
      electricityNight: +form.electricityNight || undefined,
      gas: +form.gas || undefined,
    };

    const consumption = {
      coldWater: current.coldWater && lastReading?.coldWater ? current.coldWater - lastReading.coldWater : undefined,
      hotWater: current.hotWater && lastReading?.hotWater ? current.hotWater - lastReading.hotWater : undefined,
      electricityDay: current.electricityDay && lastReading?.electricityDay ? current.electricityDay - lastReading.electricityDay : undefined,
      electricityNight: current.electricityNight && lastReading?.electricityNight ? current.electricityNight - lastReading.electricityNight : undefined,
      gas: current.gas && lastReading?.gas ? current.gas - lastReading.gas : undefined,
    };

    addMeterReading({
      propertyId: myProperty.id, tenantId: user.id, month: currentMonth,
      ...current, photo: form.photo || undefined,
      submittedAt: new Date().toISOString(), consumption
    });
    setSubmitted(true);
  };

  const u = (field: string, value: string) => setForm({ ...form, [field]: value });

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <h1>Показания счётчиков</h1>
        <p>{myProperty?.name || 'Ваш объект'} • {formatMonth(currentMonth)}</p>
      </div>

      {submitted || currentReading ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px', maxWidth: 500, margin: '0 auto' }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%', margin: '0 auto 16px',
            background: 'var(--color-success-light)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: 'var(--color-success)'
          }}>
            <Check size={32} />
          </div>
          <h2>Показания переданы ✅</h2>
          <p style={{ marginTop: 8 }}>Спасибо! Показания за {formatMonth(currentMonth)} успешно отправлены владельцу.</p>

          {(currentReading || lastReading) && (
            <div className="card mt-lg" style={{ textAlign: 'left', background: 'var(--color-bg-secondary)' }}>
              <h4 style={{ marginBottom: 12 }}>Переданные данные</h4>
              <div style={{ display: 'grid', gap: 8 }}>
                {[
                  ['Холодная вода', currentReading?.coldWater, currentReading?.consumption?.coldWater],
                  ['Горячая вода', currentReading?.hotWater, currentReading?.consumption?.hotWater],
                  ['Электро (день)', currentReading?.electricityDay, currentReading?.consumption?.electricityDay],
                  ['Электро (ночь)', currentReading?.electricityNight, currentReading?.consumption?.electricityNight],
                  ['Газ', currentReading?.gas, currentReading?.consumption?.gas],
                ].filter(([, v]) => v != null).map(([label, value, diff]) => (
                  <div key={label as string} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                    <span className="text-muted">{label}</span>
                    <span style={{ fontWeight: 500 }}>
                      {value} {diff != null && <span className="text-success text-sm">(+{diff})</span>}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="card" style={{ maxWidth: 560, margin: '0 auto' }}>
          <div style={{ marginBottom: '16px', padding: '12px', borderRadius: 'var(--radius-md)', background: 'var(--color-info-light)', fontSize: '0.85rem', color: 'var(--color-info)' }}>
            <Gauge size={16} style={{ verticalAlign: '-3px', marginRight: 6 }} />
            Введите текущие показания ваших счётчиков. Расход будет рассчитан автоматически.
          </div>

          {lastReading && (
            <div style={{ marginBottom: '16px', fontSize: '0.8rem', color: 'var(--color-text-tertiary)' }}>
              Предыдущие показания ({formatMonth(lastReading.month)}):
              {lastReading.coldWater && ` ХВ: ${lastReading.coldWater}`}
              {lastReading.hotWater && ` ГВ: ${lastReading.hotWater}`}
              {lastReading.electricityDay && ` Эд: ${lastReading.electricityDay}`}
              {lastReading.electricityNight && ` Эн: ${lastReading.electricityNight}`}
              {lastReading.gas && ` Газ: ${lastReading.gas}`}
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Холодная вода</label>
              <input className="form-input" type="number" step="0.01" placeholder="Показание" value={form.coldWater} onChange={e => u('coldWater', e.target.value)} />
              {form.coldWater && lastReading?.coldWater && (
                <div className="form-hint text-success">Расход: +{(+form.coldWater - lastReading.coldWater).toFixed(2)}</div>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Горячая вода</label>
              <input className="form-input" type="number" step="0.01" placeholder="Показание" value={form.hotWater} onChange={e => u('hotWater', e.target.value)} />
              {form.hotWater && lastReading?.hotWater && (
                <div className="form-hint text-success">Расход: +{(+form.hotWater - lastReading.hotWater).toFixed(2)}</div>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Электричество (день)</label>
              <input className="form-input" type="number" step="0.01" placeholder="Показание" value={form.electricityDay} onChange={e => u('electricityDay', e.target.value)} />
              {form.electricityDay && lastReading?.electricityDay && (
                <div className="form-hint text-success">Расход: +{(+form.electricityDay - lastReading.electricityDay).toFixed(2)}</div>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Электричество (ночь)</label>
              <input className="form-input" type="number" step="0.01" placeholder="Показание" value={form.electricityNight} onChange={e => u('electricityNight', e.target.value)} />
              {form.electricityNight && lastReading?.electricityNight && (
                <div className="form-hint text-success">Расход: +{(+form.electricityNight - lastReading.electricityNight).toFixed(2)}</div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Газ</label>
            <input className="form-input" type="number" step="0.01" placeholder="Показание" value={form.gas} onChange={e => u('gas', e.target.value)} style={{ maxWidth: '50%' }} />
            {form.gas && lastReading?.gas && (
              <div className="form-hint text-success">Расход: +{(+form.gas - lastReading.gas).toFixed(2)}</div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Фото счётчика</label>
            <label style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              padding: '20px', border: '2px dashed var(--color-border)', borderRadius: 'var(--radius-md)',
              cursor: 'pointer', color: 'var(--color-text-secondary)', fontSize: '0.9rem'
            }}>
              <Camera size={20} />
              Прикрепить фото
              <input type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={e => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = () => u('photo', reader.result as string);
                  reader.readAsDataURL(file);
                }
              }} />
            </label>
            {form.photo && <img src={form.photo} alt="Фото" style={{ marginTop: 12, maxHeight: 200, borderRadius: 'var(--radius-md)' }} />}
          </div>

          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '8px' }}>
            <Send size={18} /> Отправить показания
          </button>
        </form>
      )}

      {/* History */}
      {prevReadings.length > 0 && (
        <div className="card mt-xl">
          <h3 className="card-title" style={{ marginBottom: '12px' }}>История показаний</h3>
          <div className="table-container" style={{ border: 'none' }}>
            <table className="table">
              <thead><tr><th>Месяц</th><th>ХВ</th><th>ГВ</th><th>Эд</th><th>Эн</th><th>Газ</th></tr></thead>
              <tbody>
                {prevReadings.map(r => (
                  <tr key={r.id}>
                    <td>{formatMonth(r.month)}</td>
                    <td>{r.coldWater ?? '—'}</td>
                    <td>{r.hotWater ?? '—'}</td>
                    <td>{r.electricityDay ?? '—'}</td>
                    <td>{r.electricityNight ?? '—'}</td>
                    <td>{r.gas ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
