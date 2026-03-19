import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Mail, Lock, Zap, ArrowRight, Eye, EyeOff, AlertCircle, User as UserIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isLogin && !name.trim()) {
      setError('Введите имя');
      return;
    }
    if (!email.trim()) {
      setError('Введите email');
      return;
    }
    if (!password.trim()) {
      setError('Введите пароль');
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const result = await login(email, password);
        if (!result.success) {
          setError(result.error || 'Ошибка входа');
        }
        // If success, do nothing. AuthContext will update 'user' state, 
        // causing AppRoutes to re-render and trigger a <Navigate> component.
      } else {
        // Registration Flow
        const { data, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: name,
              role: 'owner'
            }
          }
        });

        if (authError) throw authError;

        if (data.user) {
          // Instead of inserting into profiles manually (which fails RLS because email isn't confirmed yet),
          // we rely on a Supabase database trigger to create the profile.
          
          // Try to login correctly
          const result = await login(email, password);
          if (!result.success) {
            setError('Аккаунт создан! Если вход не выполнен, проверьте email для подтверждения, либо отключите "Confirm email" в настройках Supabase.');
            setIsLogin(true);
          }
          // If success, AppRoutes will redirect automatically.
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Ошибка: возможно пользователь уже существует');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card animate-slide-up">
        <div className="login-logo">
          <div style={{
            width: 56, height: 56, borderRadius: 'var(--radius-lg)', margin: '0 auto 16px',
            background: 'linear-gradient(135deg, var(--color-primary) 0%, #6366f1 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Zap size={28} color="#fff" />
          </div>
          <h1>RentFlow</h1>
          <p>{isLogin ? 'Управление арендой — просто и эффективно' : 'Создание аккаунта владельца'}</p>
        </div>

        {error && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px',
            borderRadius: 'var(--radius-md)', background: 'var(--color-error-light, #fef2f2)',
            border: '1px solid var(--color-error, #ef4444)',
            color: 'var(--color-error, #ef4444)', fontSize: '0.85rem', marginBottom: '16px',
            animation: 'shake 0.4s ease-in-out'
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            {error}
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', marginBottom: '24px', background: 'var(--color-surface-hover)', borderRadius: 'var(--radius-md)', padding: '4px' }}>
          <button 
            type="button"
            onClick={() => { setIsLogin(true); setError(''); }}
            style={{ 
              flex: 1, padding: '8px', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
              background: isLogin ? 'var(--color-surface)' : 'transparent',
              color: isLogin ? 'var(--color-text)' : 'var(--color-text-secondary)',
              fontWeight: isLogin ? 600 : 400,
              boxShadow: isLogin ? 'var(--shadow-sm)' : 'none'
            }}>Вход</button>
          <button 
            type="button"
            onClick={() => { setIsLogin(false); setError(''); }}
            style={{ 
              flex: 1, padding: '8px', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
              background: !isLogin ? 'var(--color-surface)' : 'transparent',
              color: !isLogin ? 'var(--color-text)' : 'var(--color-text-secondary)',
              fontWeight: !isLogin ? 600 : 400,
              boxShadow: !isLogin ? 'var(--shadow-sm)' : 'none'
            }}>Регистрация</button>
        </div>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label className="form-label">Ваше Имя</label>
              <div style={{ position: 'relative' }}>
                <UserIcon size={16} style={{
                  position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                  color: 'var(--color-text-tertiary)'
                }} />
                <input
                  type="text" className="form-input" placeholder="Иван Иванов"
                  value={name} onChange={e => { setName(e.target.value); setError(''); }}
                  style={{ paddingLeft: 38 }}
                  required={!isLogin}
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{
                position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                color: 'var(--color-text-tertiary)'
              }} />
              <input
                type="email" className="form-input" placeholder="email@example.com"
                value={email} onChange={e => { setEmail(e.target.value); setError(''); }}
                style={{ paddingLeft: 38 }}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Пароль</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{
                position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                color: 'var(--color-text-tertiary)'
              }} />
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input" placeholder="••••••••"
                value={password} onChange={e => { setPassword(e.target.value); setError(''); }}
                style={{ paddingLeft: 38, paddingRight: 42 }}
                required
                autoComplete="current-password"
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
                  color: 'var(--color-text-tertiary)', display: 'flex', alignItems: 'center'
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {!isLogin && <div style={{ fontSize: '0.8rem', color: 'var(--color-text-tertiary)', marginTop: '4px' }}>Минимум 6 символов</div>}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '8px', opacity: loading ? 0.7 : 1 }}
            disabled={loading}
          >
            {loading ? 'Загрузка...' : (isLogin ? 'Войти' : 'Зарегистрироваться')} {!loading && <ArrowRight size={18} />}
          </button>
        </form>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
      `}</style>
    </div>
  );
}
