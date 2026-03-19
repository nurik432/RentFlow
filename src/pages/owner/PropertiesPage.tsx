import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency, getPropertyTypeLabel, getStatusLabel, getStatusColor } from '../../utils/helpers';
import { Plus, Search, Building2, MapPin, SlidersHorizontal } from 'lucide-react';

export default function PropertiesPage() {
  const { properties } = useData();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = properties.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.address.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header flex-between" style={{ flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1>Объекты недвижимости</h1>
          <p>{properties.length} объектов • {properties.filter(p => p.status === 'rented').length} сдано</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/owner/properties/new')}>
          <Plus size={18} /> Добавить объект
        </button>
      </div>

      <div className="filters-bar">
        <div style={{ position: 'relative', flex: 1, maxWidth: 360 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-tertiary)' }} />
          <input className="form-input" placeholder="Поиск по названию или адресу..."
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 38, width: '100%' }} />
        </div>
        <select className="form-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          style={{ width: 'auto', minWidth: 160 }}>
          <option value="all">Все статусы</option>
          <option value="rented">Сдан</option>
          <option value="available">Свободен</option>
          <option value="preparing">Готовится</option>
        </select>
      </div>

      {filtered.length > 0 ? (
        <div className="grid-3">
          {filtered.map(prop => (
            <div key={prop.id} className="property-card" onClick={() => navigate(`/owner/properties/${prop.id}`)}>
              <div className="property-card-image">
                {prop.photo ? (
                  <img src={prop.photo} alt={prop.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <Building2 size={40} strokeWidth={1} />
                    <span style={{ fontSize: '0.8rem' }}>{getPropertyTypeLabel(prop.type)}</span>
                  </div>
                )}
              </div>
              <div className="property-card-body">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span className={`badge badge-${getStatusColor(prop.status)}`}>
                    {getStatusLabel(prop.status)}
                  </span>
                  <span className="badge badge-neutral">{getPropertyTypeLabel(prop.type)}</span>
                </div>
                <div className="property-card-title">{prop.name}</div>
                <div className="property-card-address">
                  <MapPin size={13} style={{ display: 'inline', verticalAlign: '-2px', marginRight: 4 }} />
                  {prop.address}
                </div>
                <div className="property-card-footer">
                  <div className="property-card-price">{formatCurrency(prop.monthlyRent, user?.currency)}<span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--color-text-secondary)' }}>/мес</span></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon"><Building2 size={36} /></div>
          <h3>Нет объектов</h3>
          <p>Добавьте первый объект недвижимости, чтобы начать управление арендой</p>
          <button className="btn btn-primary" onClick={() => navigate('/owner/properties/new')}>
            <Plus size={18} /> Добавить объект
          </button>
        </div>
      )}
    </div>
  );
}
