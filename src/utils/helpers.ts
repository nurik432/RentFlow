export function formatCurrency(amount: number, currency: string = 'TJS'): string {
  return `${amount.toLocaleString('ru-RU')} ${currency}`;
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function formatDateShort(dateStr: string): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function formatDateTime(dateStr: string): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
}

export function formatMonth(monthStr: string): string {
  if (!monthStr) return '—';
  const [year, month] = monthStr.split('-');
  const months = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
  return `${months[parseInt(month) - 1]} ${year}`;
}

export function getMonthKey(date: Date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

export function getPropertyTypeLabel(type: string): string {
  const map: Record<string, string> = { apartment: 'Квартира', office: 'Офис', warehouse: 'Склад' };
  return map[type] || type;
}

export function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    rented: 'Сдан', available: 'Свободен', preparing: 'Готовится',
    pending: 'Ожидается', received: 'Получен', overdue: 'Просрочен',
    signed: 'Подписан', awaiting: 'Ожидает', expired: 'Истёк',
    todo: 'К выполнению', inprogress: 'В работе', done: 'Выполнено',
    low: 'Низкий', medium: 'Средний', high: 'Высокий'
  };
  return map[status] || status;
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    rented: 'primary', available: 'success', preparing: 'warning',
    pending: 'warning', received: 'success', overdue: 'error',
    signed: 'success', awaiting: 'warning', expired: 'error',
    todo: 'neutral', inprogress: 'primary', done: 'success',
    low: 'neutral', medium: 'warning', high: 'error'
  };
  return map[status] || 'neutral';
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function getFirstDayOfMonth(year: number, month: number): number {
  const day = new Date(year, month - 1, 1).getDay();
  return day === 0 ? 6 : day - 1; // Monday = 0
}
