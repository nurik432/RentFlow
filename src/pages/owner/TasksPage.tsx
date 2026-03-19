import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { formatDate, getStatusLabel, getStatusColor } from '../../utils/helpers';
import { Plus, ClipboardList, X, Trash2 } from 'lucide-react';
import { TaskStatus, TaskPriority } from '../../types';

export default function TasksPage() {
  const { tasks, properties, addTask, updateTask, deleteTask } = useData();
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [form, setForm] = useState({
    propertyId: '', title: '', description: '', assignee: '',
    deadline: '', status: 'todo' as TaskStatus, priority: 'medium' as TaskPriority
  });

  const filtered = tasks.filter(t => filterStatus === 'all' || t.status === filterStatus)
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addTask(form);
    setShowForm(false);
    setForm({ propertyId: '', title: '', description: '', assignee: '', deadline: '', status: 'todo', priority: 'medium' });
  };

  const u = (field: string, value: any) => setForm({ ...form, [field]: value });

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header flex-between" style={{ flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1>Задачи</h1>
          <p>{tasks.length} задач • {tasks.filter(t => t.status !== 'done').length} активных</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={18} /> Новая задача
        </button>
      </div>

      <div className="filters-bar">
        {['all', 'todo', 'inprogress', 'done'].map(s => (
          <button key={s} className={`btn ${filterStatus === s ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setFilterStatus(s)}>
            {s === 'all' ? 'Все' : getStatusLabel(s)}
          </button>
        ))}
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3>Новая задача</h3>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setShowForm(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Объект</label>
                  <select className="form-select" value={form.propertyId} onChange={e => u('propertyId', e.target.value)}>
                    <option value="">Выберите объект</option>
                    {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Название *</label>
                  <input className="form-input" required value={form.title} onChange={e => u('title', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Описание</label>
                  <textarea className="form-textarea" value={form.description} onChange={e => u('description', e.target.value)} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Исполнитель</label>
                    <input className="form-input" value={form.assignee} onChange={e => u('assignee', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Дедлайн</label>
                    <input type="date" className="form-input" value={form.deadline} onChange={e => u('deadline', e.target.value)} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Приоритет</label>
                    <select className="form-select" value={form.priority} onChange={e => u('priority', e.target.value as TaskPriority)}>
                      <option value="low">Низкий</option>
                      <option value="medium">Средний</option>
                      <option value="high">Высокий</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Статус</label>
                    <select className="form-select" value={form.status} onChange={e => u('status', e.target.value as TaskStatus)}>
                      <option value="todo">К выполнению</option>
                      <option value="inprogress">В работе</option>
                      <option value="done">Выполнено</option>
                    </select>
                  </div>
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

      {filtered.length > 0 ? (
        <div className="flex-col gap-sm">
          {filtered.map(task => {
            const prop = properties.find(p => p.id === task.propertyId);
            return (
              <div key={task.id} className="card" style={{ padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 4 }}>
                      <span style={{ fontWeight: 600 }}>{task.title}</span>
                      <span className={`badge badge-${getStatusColor(task.priority)}`}>{getStatusLabel(task.priority)}</span>
                    </div>
                    {task.description && <div className="text-sm text-muted" style={{ marginBottom: 4 }}>{task.description}</div>}
                    <div className="text-sm text-muted">
                      {prop?.name} • {task.assignee} • до {formatDate(task.deadline)}
                    </div>
                  </div>
                  <select className="form-select" value={task.status} onChange={e => updateTask(task.id, { status: e.target.value as TaskStatus })}
                    style={{ width: 'auto', minWidth: 140 }}>
                    <option value="todo">К выполнению</option>
                    <option value="inprogress">В работе</option>
                    <option value="done">Выполнено</option>
                  </select>
                  <button className="btn btn-ghost btn-icon btn-sm" onClick={() => deleteTask(task.id)} title="Удалить">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon"><ClipboardList size={36} /></div>
          <h3>Нет задач</h3>
          <p>Создайте задачу для отслеживания ремонта или администрирования</p>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            <Plus size={18} /> Создать
          </button>
        </div>
      )}
    </div>
  );
}
