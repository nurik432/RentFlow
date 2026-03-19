import React, { useState, useRef, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Send, MessageSquare } from 'lucide-react';

export default function ChatPage() {
  const { properties, chatMessages, addChatMessage } = useData();
  const { user } = useAuth();
  const [selectedProp, setSelectedProp] = useState(properties.find(p => p.status === 'rented')?.id || '');
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isOwner = user?.role === 'owner';

  const filteredMessages = chatMessages
    .filter(m => m.propertyId === selectedProp)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [filteredMessages.length]);

  const handleSend = () => {
    if (!message.trim() || !selectedProp || !user) return;
    addChatMessage({
      propertyId: selectedProp,
      senderId: user.id,
      senderName: user.name,
      message: message.trim()
    });
    setMessage('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const rentedProps = properties.filter(p => p.status === 'rented');

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <h1>Чат</h1>
        <p>Общение с {isOwner ? 'арендаторами' : 'владельцем'} по объектам</p>
      </div>

      {isOwner && (
        <div className="filters-bar" style={{ marginBottom: '16px' }}>
          <select className="form-select" value={selectedProp} onChange={e => setSelectedProp(e.target.value)}>
            {rentedProps.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      )}

      <div className="chat-container">
        <div className="chat-messages">
          {filteredMessages.length > 0 ? (
            filteredMessages.map(msg => (
              <div key={msg.id}>
                <div className={`chat-bubble ${msg.senderId === user?.id ? 'sent' : 'received'}`}>
                  {msg.senderId !== user?.id && (
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: 4, opacity: 0.8 }}>
                      {msg.senderName}
                    </div>
                  )}
                  {msg.message}
                  <div className="chat-bubble-time">
                    {new Date(msg.createdAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state" style={{ padding: '48px 16px' }}>
              <div className="empty-state-icon"><MessageSquare size={32} /></div>
              <h3>Нет сообщений</h3>
              <p>Начните общение по этому объекту</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-area">
          <input className="form-input" placeholder="Введите сообщение..."
            value={message} onChange={e => setMessage(e.target.value)} onKeyDown={handleKeyDown} />
          <button className="btn btn-primary btn-icon" onClick={handleSend} disabled={!message.trim()}>
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
