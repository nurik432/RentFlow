import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { User, UserRole, NotificationChannel } from '../types';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; role?: UserRole }>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<boolean>;
  registerUser: (data: {
    name: string;
    email: string;
    phone?: string;
    role: UserRole;
    password: string;
    preferredChannel?: NotificationChannel;
  }) => Promise<{ success: boolean; error?: string; user?: User }>;
  removeUser: (id: string) => Promise<boolean>;
  getAllUsers: () => User[];
}

const AuthContext = createContext<AuthContextType>({
  user: null, isAuthenticated: false, isLoading: true,
  login: async () => ({ success: false }),
  logout: async () => {},
  updateUser: async () => false,
  registerUser: async () => ({ success: false }),
  removeUser: async () => false,
  getAllUsers: () => [],
});

// Маппинг строки БД -> объект User
const mapProfile = (data: any): User => ({
  id: data.id,
  name: data.name,
  email: data.email,
  phone: data.phone,
  role: data.role as UserRole,
  avatar: data.avatar,
  telegramChatId: data.telegram_chat_id,
  preferredChannel: data.preferred_channel as NotificationChannel,
  currency: data.currency,
  createdAt: data.created_at,
  onboardingCompleted: data.onboarding_completed,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [allUsersCache, setAllUsersCache] = useState<User[]>([]);

  // Флаг: login() сейчас работает — onAuthStateChange не должен дублировать работу
  const loginInProgressRef = useRef(false);

  const fetchProfile = async (userId: string): Promise<User | null> => {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (error || !data) return null;
    return mapProfile(data);
  };

  // Повторные попытки: триггер Supabase может запоздать на 300–700 мс
  const fetchProfileWithRetry = async (userId: string, retries = 5, delayMs = 400): Promise<User | null> => {
    for (let i = 0; i < retries; i++) {
      const profile = await fetchProfile(userId);
      if (profile) return profile;
      if (i < retries - 1) await new Promise(r => setTimeout(r, delayMs));
    }
    return null;
  };

  const fetchAllUsers = async () => {
    const { data } = await supabase.from('profiles').select('*');
    if (data) setAllUsersCache(data.map(mapProfile));
  };

  const clearCorruptedStorage = () => {
    try {
      for (const key of Object.keys(localStorage)) {
        if (key.startsWith('sb-')) localStorage.removeItem(key);
      }
      sessionStorage.clear();
    } catch (_) {}
  };

  useEffect(() => {
    // Восстановление сессии при загрузке
    const checkUser = async () => {
      try {
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Session timeout')), 5000)
        );

        const { data: { session }, error } = await Promise.race([sessionPromise, timeoutPromise]) as any;
        if (error) throw error;

        if (session?.user) {
          const profile = await fetchProfileWithRetry(session.user.id);
          if (profile) {
            setUser(profile);
            await fetchAllUsers();
          } else {
            // Сессия есть, профиля нет — сломанное состояние, чистим
            await supabase.auth.signOut();
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Auth check error:', err);
        clearCorruptedStorage();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();

    // onAuthStateChange нужен для: TOKEN_REFRESHED, выхода из другой вкладки,
    // и SIGNED_IN из внешних источников (не через login())
    let authListener: any;
    try {
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          // Пропускаем если login() уже обрабатывает этот SIGNED_IN
          if (loginInProgressRef.current) return;

          // Это вход из другой вкладки или восстановление сессии
          setUser(prev => {
            // Если пользователь уже установлен — не дёргаем
            if (prev?.id === session.user.id) return prev;
            return prev;
          });
          // Асинхронно обновляем профиль если нужно
          const profile = await fetchProfileWithRetry(session.user.id);
          if (profile) {
            setUser(prev => prev?.id === profile.id ? prev : profile);
            fetchAllUsers();
          } else {
            await supabase.auth.signOut();
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setAllUsersCache([]);
        } else if (event === 'TOKEN_REFRESHED' && session) {
          // Сессия обновлена — пользователь остаётся прежним
        }
      });
      authListener = data;
    } catch (e) {
      console.error('Auth listener setup failed:', e);
    }

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string; role?: UserRole }> => {
    if (!email || !password) return { success: false, error: 'Введите email и пароль' };

    loginInProgressRef.current = true;
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          return { success: false, error: 'Неверный email или пароль' };
        }
        if (error.message.includes('Email not confirmed')) {
          return { success: false, error: 'Email не подтверждён. Проверьте почту или отключите подтверждение в настройках Supabase.' };
        }
        return { success: false, error: error.message };
      }

      // Ждём профиль (триггер может запоздать)
      const profile = await fetchProfileWithRetry(data.user.id);
      if (profile) {
        setUser(profile);
        await fetchAllUsers();
        return { success: true, role: profile.role };
      }
      return { success: false, error: 'Профиль не найден' };
    } catch (e: any) {
      console.error('Login error:', e);
      return { success: false, error: e.message || 'Ошибка входа' };
    } finally {
      loginInProgressRef.current = false;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setAllUsersCache([]);
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!user) return false;

    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
    if (updates.avatar !== undefined) dbUpdates.avatar = updates.avatar;
    if (updates.telegramChatId !== undefined) dbUpdates.telegram_chat_id = updates.telegramChatId;
    if (updates.preferredChannel !== undefined) dbUpdates.preferred_channel = updates.preferredChannel;
    if (updates.currency !== undefined) dbUpdates.currency = updates.currency;
    if (updates.onboardingCompleted !== undefined) dbUpdates.onboarding_completed = updates.onboardingCompleted;

    const { error } = await supabase.from('profiles').update(dbUpdates).eq('id', user.id);
    if (!error) {
      setUser({ ...user, ...updates });
      return true;
    }
    return false;
  };

  const registerUser = async (data: {
    name: string; email: string; phone?: string; role: UserRole; password: string; preferredChannel?: NotificationChannel;
  }) => {
    try {
      // Создаём отдельный клиент чтобы не затронуть сессию текущего владельца.
      // Используем фиксированный ключ хранилища (не Date.now()) — иначе накапливается мусор.
      const { createClient } = await import('@supabase/supabase-js');
      const tempSupabase = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY,
        {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false,
            storage: {
              // Храним только в памяти — никакого localStorage
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {},
            },
          },
        }
      );

      const { data: authData, error } = await tempSupabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: { name: data.name, role: data.role },
        },
      });

      if (error) {
        if (error.message.includes('already registered')) {
          return { success: false, error: 'Пользователь с таким email уже существует' };
        }
        throw error;
      }

      if (!authData.user) {
        return { success: false, error: 'Пользователь не создан. Возможно, email уже зарегистрирован.' };
      }

      // Ждём пока триггер создаст профиль (до 3 секунд)
      let profile: User | null = null;
      for (let i = 0; i < 6; i++) {
        await new Promise(r => setTimeout(r, 500));
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authData.user.id)
          .single();
        if (profileData) {
          profile = mapProfile(profileData);
          break;
        }
      }

      // Обновляем телефон и канал если указаны (профиль уже создан триггером)
      if (profile && (data.phone || data.preferredChannel)) {
        const updates: any = {};
        if (data.phone) updates.phone = data.phone;
        if (data.preferredChannel) updates.preferred_channel = data.preferredChannel;
        await supabase.from('profiles').update(updates).eq('id', authData.user.id);
      }

      await fetchAllUsers();
      return { success: true, user: profile ?? undefined };
    } catch (e: any) {
      console.error('RegisterUser error:', e);
      return { success: false, error: e.message || 'Ошибка регистрации' };
    }
  };

  const removeUser = async (_id: string): Promise<boolean> => {
    // Требует Admin API (service_role key) — недоступно с клиента
    return false;
  };

  const getAllUsers = (): User[] => allUsersCache;

  return (
    <AuthContext.Provider value={{
      user, isAuthenticated: !!user, isLoading, login, logout, updateUser,
      registerUser, removeUser, getAllUsers,
    }}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);