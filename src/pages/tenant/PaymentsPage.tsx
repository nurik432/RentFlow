import React from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency, formatMonth, formatDate, getStatusLabel, getStatusColor } from '../../utils/helpers';
import { CreditCard, Check, CheckCircle } from 'lucide-react';

export default function PaymentsPage() {
  const { payments, utilityBills, acknowledgeUtilityBill, properties, updatePayment } = useData();
  const { user } = useAuth();

  const myPayments = payments.filter(p => p.tenantId === user?.id).sort((a, b) => b.month.localeCompare(a.month));
  const myBills = utilityBills.filter(b => b.tenantId === user?.id).sort((a, b) => b.month.localeCompare(a.month));
  const myProperty = properties.find(p => p.tenantId === user?.id);

  const handleMarkPaid = (paymentId: string) => {
    updatePayment(paymentId, { status: 'received', paidAt: new Date().toISOString() });
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <h1>Мои платежи</h1>
        <p>{myProperty?.name || 'Ваш объект'}</p>
      </div>

      <h3 style={{ marginBottom: '12px' }}>Аренда</h3>
      {myPayments.length > 0 ? (
        <div className="table-container mb-lg">
          <table className="table">
            <thead><tr><th>Месяц</th><th>Сумма</th><th>Статус</th><th>Дата оплаты</th><th></th></tr></thead>
            <tbody>
              {myPayments.map(p => (
                <tr key={p.id}>
                  <td>{formatMonth(p.month)}</td>
                  <td style={{ fontWeight: 500 }}>{formatCurrency(p.amount, user?.currency)}</td>
                  <td><span className={`badge badge-${getStatusColor(p.status)}`}>{getStatusLabel(p.status)}</span></td>
                  <td>{p.paidAt ? formatDate(p.paidAt) : '—'}</td>
                  <td>
                    {(p.status === 'pending' || p.status === 'overdue') && (
                      <button className="btn btn-success btn-sm" onClick={() => handleMarkPaid(p.id)}>
                        <CheckCircle size={14} /> Оплачено
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card mb-lg empty-state"><h3>Нет платежей</h3></div>
      )}

      <h3 style={{ marginBottom: '12px' }}>Коммунальные платежи</h3>
      {myBills.length > 0 ? (
        <div className="table-container">
          <table className="table">
            <thead><tr><th>Месяц</th><th>Электро</th><th>Хол. вода</th><th>Гор. вода</th><th>Водоотв.</th><th>Итого</th><th>Статус</th></tr></thead>
            <tbody>
              {myBills.map(bill => (
                <tr key={bill.id}>
                  <td>{formatMonth(bill.month)}</td>
                  <td>{bill.electricityAmount ? formatCurrency(bill.electricityAmount, user?.currency) : '—'}</td>
                  <td>{bill.coldWaterAmount ? formatCurrency(bill.coldWaterAmount, user?.currency) : '—'}</td>
                  <td>{bill.hotWaterAmount ? formatCurrency(bill.hotWaterAmount, user?.currency) : '—'}</td>
                  <td>{bill.waterDischargeAmount ? formatCurrency(bill.waterDischargeAmount, user?.currency) : '—'}</td>
                  <td style={{ fontWeight: 600 }}>{formatCurrency(bill.totalAmount, user?.currency)}</td>
                  <td>
                    {bill.acknowledged ? (
                      <span className="badge badge-success"><Check size={12} /> Подтверждено</span>
                    ) : (
                      <button className="btn btn-success btn-sm" onClick={() => acknowledgeUtilityBill(bill.id)}>
                        <Check size={14} /> Получил, понял
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card empty-state"><h3>Нет начислений</h3></div>
      )}
    </div>
  );
}
