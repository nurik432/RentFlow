import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Building2, UserPlus, Bell, ArrowRight, ArrowLeft, Check } from 'lucide-react';

const steps = [
  { icon: Building2, title: 'Добавьте объект', desc: 'Создайте первый объект недвижимости — квартиру, офис или склад. Укажите адрес, стоимость аренды и загрузите фото.' },
  { icon: UserPlus, title: 'Пригласите арендатора', desc: 'Отправьте приглашение арендатору по email или Magic Link. Он получит доступ к своему порталу.' },
  { icon: Bell, title: 'Настройте напоминания', desc: 'Задайте даты оплаты и сдачи показаний. Система автоматически отправит напоминания.' },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const { updateUser } = useAuth();
  const navigate = useNavigate();

  const finish = () => {
    updateUser({ onboardingCompleted: true });
    navigate('/owner');
  };

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-card">
        <div className="onboarding-step-indicator">
          {steps.map((_, i) => (
            <div key={i} className={`onboarding-dot ${i === step ? 'active' : ''}`}
              style={i < step ? { background: 'var(--color-success)' } : {}} />
          ))}
        </div>

        <div className="onboarding-icon">
          {React.createElement(steps[step].icon, { size: 32 })}
        </div>

        <h2>{steps[step].title}</h2>
        <p>{steps[step].desc}</p>

        <div className="onboarding-buttons">
          {step > 0 && (
            <button className="btn btn-secondary" onClick={() => setStep(step - 1)}>
              <ArrowLeft size={16} /> Назад
            </button>
          )}
          {step < steps.length - 1 ? (
            <button className="btn btn-primary" onClick={() => setStep(step + 1)}>
              Далее <ArrowRight size={16} />
            </button>
          ) : (
            <button className="btn btn-success" onClick={finish}>
              <Check size={16} /> Начать работу
            </button>
          )}
        </div>

        <button onClick={finish} style={{
          background: 'none', border: 'none', color: 'var(--color-text-tertiary)',
          marginTop: '20px', cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'inherit'
        }}>
          Пропустить
        </button>
      </div>
    </div>
  );
}
