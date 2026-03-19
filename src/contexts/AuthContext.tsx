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
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => ({ success: false }),
  logout: async () => {},
  updateUser: async () => false,
  registerUser: async () => ({ success: false }),
  removeUser: async () => false,
  getAllUsers: () => [],
});

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
  const loginInProgressRef = useRef(false);

  const fetchProfile = async (userId: string): Promise<User | null> => {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (error || !data) return null;
      return mapProfile(data);
    } catch {
      return null;
    }
  };

  const fetchProfileWithRetry = async (userId: string, retries = 6, delayMs = 400): Promise<User | null> => {
    for (let i = 0; i < retries; i++) {
      const profile = await fetchProfile(userId);
      if (profile) return profile;
      if (i < retries - 1) await new Promise(r => setTimeout(r, delayMs));
    }
    return null;
  };

  const fetchAllUsers = async () => {
    try {
      const { data } = await supabase.from('profiles').select('*');
      if (data) setAllUsersCache(data.map(mapProfile));
    } catch { /* non-critical */ }
  };

  useEffect(() => {
    // onAuthStateChange fires INITIAL_SESSION on mount — the canonical Supabase v2 pattern.
    // Handles both "existing session" and "no session" without a separate getSession() call.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'INITIAL_SESSION') {
        if (session?.user) {
          const profile = await fetchProfileWithRetry(session.user.id);
          if (profile) {
            setUser(profile);
            fetchAllUsers();
          } else {
            await supabase.auth.signOut();
            setUser(null);
          }
        } else {
          setUser(null);
        }
        setIsLoading(false);
      } else if (event === 'SIGNED_IN' && session) {
        if (loginInProgressRef.current) return; // login() is handling this
        // Signed in from another tab
        fetchProfileWithRetry(session.user.id).then(profile => {
          if (profile) { setUser(profile); fetchAllUsers(); }
          else supabase.auth.signOut();
        });
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setAllUsersCache([]);
        setIsLoading(false);
      }
    });

    // Safety: unblock UI if INITIAL_SESSION never fires
    const fallback = setTimeout(() => setIsLoading(false), 6000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(fallback);
    };
  }, []);

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string; role?: UserRole }> => {
    if (!email || !password) return { success: false, error: 'Введите email и пароль' };

    loginInProgressRef.current = true;
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        if (error.message.includes('Invalid login credentials'))
          return { success: false, error: 'Неверный email или пароль' };
        if (error.message.includes('Email not confirmed'))
          return { success: false, error: 'Email не подтверждён. Отключите «Confirm email» в настройках Supabase.' };
        return { success: false, error: error.message };
      }

      const profile = await fetchProfileWithRetry(data.user.id);
      if (profile) {
        setUser(profile);
        fetchAllUsers();
        return { success: true, role: profile.role };
      } else {
        await supabase.auth.signOut();
        return { success: false, error: 'Профиль не найден. Проверьте что триггер handle_new_user создан в Supabase.' };
      }
    } catch (e: any) {
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

  const updateUser = async (updates: Partial<User>): Promise<boolean> => {
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
    if (!error) { setUser({ ...user, ...updates }); return true; }
    return false;
  };

  const registerUser = async (data: {
    name: string; email: string; phone?: string; role: UserRole;
    password: string; preferredChannel?: NotificationChannel;
  }): Promise<{ success: boolean; error?: string; user?: User }> => {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const tempClient = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY,
        {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false,
            storage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
          },
        }
      );

      const { data: authData, error } = await tempClient.auth.signUp({
        email: data.email,
        password: data.password,
        options: { data: { name: data.name, role: data.role } },
      });

      if (error) {
        if (error.message.toLowerCase().includes('already registered'))
          return { success: false, error: 'Пользователь с таким email уже существует' };
        return { success: false, error: error.message };
      }

      if (!authData.user)
        return { success: false, error: 'Не удалось создать пользователя.' };

      // Wait for the DB trigger to create the profile row
      const profile = await fetchProfileWithRetry(authData.user.id);

      if (data.phone || data.preferredChannel) {
        const extra: any = {};
        if (data.phone) extra.phone = data.phone;
        if (data.preferredChannel) extra.preferred_channel = data.preferredChannel;
        await supabase.from('profiles').update(extra).eq('id', authData.user.id);
      }

      await fetchAllUsers();
      return { success: true, user: profile ?? undefined };
    } catch (e: any) {
      return { success: false, error: e.message || 'Ошибка регистрации' };
    }
  };

  const removeUser = async (_id: string): Promise<boolean> => false; // requires service_role key

  const getAllUsers = (): User[] => allUsersCache;

  return (
    <AuthContext.Provider value={{
      user, isAuthenticated: !!user, isLoading,
      login, logout, updateUser, registerUser, removeUser, getAllUsers,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);