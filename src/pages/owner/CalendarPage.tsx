import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { getDaysInMonth, getFirstDayOfMonth, getMonthKey } from '../../utils/helpers';
import { ChevronLeft, ChevronRight, CreditCard, Gauge } from 'lucide-react';

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const MONTHS_RU = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

export default function CalendarPage() {
  const { properties, payments } = useData();
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(3); // March

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() + 1 === month;
  const monthKey = `${year}-${String(month).padStart(2, '0')}`;

  const rentedProps = properties.filter(p => p.status === 'rented');

  // Build events
  const events: { day: number; type: 'payment' | 'meter'; label: string; status: string }[] = [];
  rentedProps.forEach(prop => {
    const payment = payments.find(p => p.propertyId === prop.id && p.month === monthKey);
    events.push({
      day: prop.paymentDay, type: 'payment',
      label: `Оплата: ${prop.name}`,
      status: payment?.status || 'pending'
    });
    events.push({
      day: prop.meterReadingDay, type: 'meter',
      label: `Показания: ${prop.name}`,
      status: 'pending'
    });
  });

  const prev = () => { if (month === 1) { setMonth(12); setYear(year - 1); } else setMonth(month - 1); };
  const next = () => { if (month === 12) { setMonth(1); setYear(year + 1); } else setMonth(month + 1); };

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header flex-between" style={{ flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1>Платёжный календарь</h1>
          <p>Расписание оплат и подачи показаний</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="btn btn-ghost btn-icon" onClick={prev}><ChevronLeft size={20} /></button>
          <span style={{ fontWeight: 600, fontSize: '1.1rem', minWidth: 160, textAlign: 'center' }}>
            {MONTHS_RU[month - 1]} {year}
          </span>
          <button className="btn btn-ghost btn-icon" onClick={next}><ChevronRight size={20} /></button>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {[
          { color: 'var(--color-primary-light)', border: 'var(--color-primary)', label: 'Оплата аренды' },
          { color: 'var(--color-warning-light)', border: 'var(--color-warning)', label: 'Показания' },
          { color: 'var(--color-success-light)', border: 'var(--color-success)', label: 'Получено' },
          { color: 'var(--color-error-light)', border: 'var(--color-error)', label: 'Просрочено' },
        ].map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: l.color, border: `1px solid ${l.border}` }} />
            {l.label}
          </div>
        ))}
      </div>

      <div className="calendar-grid">
        {WEEKDAYS.map(d => (
          <div key={d} className="calendar-header-cell">{d}</div>
        ))}
        {cells.map((day, i) => {
          const dayEvents = day ? events.filter(e => e.day === day) : [];
          const isToday = isCurrentMonth && day === today.getDate();
          return (
            <div key={i} className={`calendar-cell ${!day ? 'other-month' : ''} ${isToday ? 'today' : ''}`}>
              {day && (
                <>
                  <div className="calendar-day" style={isToday ? { color: 'var(--color-primary)', fontWeight: 700 } : {}}>
                    {day}
                  </div>
                  {dayEvents.map((ev, ei) => (
                    <div key={ei} className={`calendar-event ${ev.type === 'payment' ? (ev.status === 'received' ? 'payment' : ev.status === 'overdue' ? 'overdue' : 'payment') : 'meter'}`}>
                      {ev.type === 'payment' ? <CreditCard size={10} style={{ marginRight: 3, verticalAlign: '-1px' }} /> : <Gauge size={10} style={{ marginRight: 3, verticalAlign: '-1px' }} />}
                      {ev.label.length > 20 ? ev.label.substring(0, 20) + '…' : ev.label}
                    </div>
                  ))}
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Upcoming events list */}
      <div className="card mt-xl">
        <h3 className="card-title" style={{ marginBottom: '16px' }}>Ближайшие события</h3>
        <div className="flex-col gap-sm">
          {rentedProps.map(prop => {
            const payment = payments.find(p => p.propertyId === prop.id && p.month === monthKey);
            const tenantName = prop.tenantId === 'tenant-1' ? 'Мария Петрова' : 'Дмитрий Сидоров';
            return (
              <React.Fragment key={prop.id}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', borderRadius: 'var(--radius-md)', background: 'var(--color-bg-secondary)' }}>
                  <CreditCard size={16} style={{ color: 'var(--color-primary)' }} />
                  <div style={{ flex: 1 }}>
                    <span style={{ fontWeight: 500 }}>Оплата: {prop.name}</span>
                    <span className="text-sm text-muted" style={{ marginLeft: 8 }}>{tenantName} • {prop.paymentDay}-е число</span>
                  </div>
                  <span className={`badge badge-${payment?.status === 'received' ? 'success' : payment?.status === 'overdue' ? 'error' : 'warning'}`}>
                    {payment?.status === 'received' ? 'Получен' : payment?.status === 'overdue' ? 'Просрочен' : 'Ожидается'}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', borderRadius: 'var(--radius-md)', background: 'var(--color-bg-secondary)' }}>
                  <Gauge size={16} style={{ color: 'var(--color-warning)' }} />
                  <div style={{ flex: 1 }}>
                    <span style={{ fontWeight: 500 }}>Показания: {prop.name}</span>
                    <span className="text-sm text-muted" style={{ marginLeft: 8 }}>{tenantName} • {prop.meterReadingDay}-е число</span>
                  </div>
                  <span className="badge badge-warning">Ожидается</span>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
