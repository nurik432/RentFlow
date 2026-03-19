import React from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency, getMonthKey, formatMonth } from '../../utils/helpers';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { monthlyRevenue } from '../../data/mockData';
import { Download, TrendingUp, Building2, Users } from 'lucide-react';
import * as XLSX from 'xlsx';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function AnalyticsPage() {
  const { properties, payments, utilityBills } = useData();
  const { user } = useAuth();
  const currentMonth = getMonthKey();

  const totalRent = properties.filter(p => p.status === 'rented').reduce((s, p) => s + p.monthlyRent, 0);
  const yearTotal = monthlyRevenue.reduce((s, m) => s + m.amount, 0);
  const totalUtilities = utilityBills.reduce((s, u) => s + u.total, 0);

  const chartData = {
    labels: monthlyRevenue.map(m => m.month),
    datasets: [{
      label: 'Доход от аренды',
      data: monthlyRevenue.map(m => m.amount),
      backgroundColor: 'rgba(26, 86, 219, 0.85)',
      borderRadius: 6, borderSkipped: false,
    }]
  };

  const chartOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { callback: (v: any) => `${v / 1000}K` } },
      x: { grid: { display: false } }
    }
  };

  const exportToExcel = () => {
    const data = properties.filter(p => p.status === 'rented').map(prop => {
      const tenant = prop.tenantId === 'tenant-1' ? 'Мария Петрова' : 'Дмитрий Сидоров';
      const monthPay = payments.find(p => p.propertyId === prop.id && p.month === currentMonth);
      const utility = utilityBills.find(u => u.propertyId === prop.id && u.month === currentMonth);
      return {
        'Объект': prop.name,
        'Адрес': prop.address,
        'Арендатор': tenant,
        'Аренда': prop.monthlyRent,
        'Коммуналка': utility?.total || 0,
        'Статус оплаты': monthPay?.status === 'received' ? 'Получен' : 'Ожидается',
        'Месяц': formatMonth(currentMonth)
      };
    });
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Отчёт');
    XLSX.writeFile(wb, `RentFlow_Отчёт_${currentMonth}.xlsx`);
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header flex-between" style={{ flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1>Аналитика</h1>
          <p>Финансовый обзор и отчётность</p>
        </div>
        <button className="btn btn-primary" onClick={exportToExcel}>
          <Download size={18} /> Экспорт в Excel
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}><TrendingUp size={22} /></div>
          <div className="stat-card-value">{formatCurrency(yearTotal, user?.currency)}</div>
          <div className="stat-card-label">Доход за год</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: 'var(--color-success-light)', color: 'var(--color-success)' }}><Building2 size={22} /></div>
          <div className="stat-card-value">{formatCurrency(totalRent, user?.currency)}</div>
          <div className="stat-card-label">Ежемесячный доход</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: 'var(--color-warning-light)', color: 'var(--color-warning)' }}><Users size={22} /></div>
          <div className="stat-card-value">{properties.filter(p => p.status === 'rented').length}</div>
          <div className="stat-card-label">Активных арендаторов</div>
        </div>
      </div>

      <div className="card mb-lg">
        <div className="card-header">
          <h3 className="card-title">Поступления за 12 месяцев</h3>
        </div>
        <div style={{ height: 320 }}>
          <Bar data={chartData} options={chartOptions as any} />
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Сводная таблица за {formatMonth(currentMonth)}</h3>
        </div>
        <div className="table-container" style={{ border: 'none' }}>
          <table className="table">
            <thead>
              <tr><th>Объект</th><th>Арендатор</th><th>Аренда</th><th>Коммуналка</th><th>Итого</th><th>Статус</th></tr>
            </thead>
            <tbody>
              {properties.filter(p => p.status === 'rented').map(prop => {
                const tenant = prop.tenantId === 'tenant-1' ? 'Мария Петрова' : 'Дмитрий Сидоров';
                const pay = payments.find(p => p.propertyId === prop.id && p.month === currentMonth);
                const util = utilityBills.find(u => u.propertyId === prop.id && u.month === currentMonth);
                const total = prop.monthlyRent + (util?.total || 0);
                return (
                  <tr key={prop.id}>
                    <td style={{ fontWeight: 500 }}>{prop.name}</td>
                    <td>{tenant}</td>
                    <td>{formatCurrency(prop.monthlyRent, user?.currency)}</td>
                    <td>{util ? formatCurrency(util.total, user?.currency) : '—'}</td>
                    <td style={{ fontWeight: 600 }}>{formatCurrency(total, user?.currency)}</td>
                    <td>
                      <span className={`badge badge-${pay?.status === 'received' ? 'success' : 'warning'}`}>
                        {pay?.status === 'received' ? 'Получен' : 'Ожидается'}
                      </span>
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
