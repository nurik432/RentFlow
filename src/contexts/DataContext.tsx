import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Property, Payment, UtilityBill, MeterReading, AppNotification, ChatMessage, PropertyTask } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface DataContextType {
  properties: Property[];
  payments: Payment[];
  utilityBills: UtilityBill[];
  meterReadings: MeterReading[];
  notifications: AppNotification[];
  chatMessages: ChatMessage[];
  tasks: PropertyTask[];
  isLoading: boolean;
  addProperty: (p: Omit<Property, 'id' | 'createdAt'>) => Promise<void>;
  updateProperty: (id: string, updates: Partial<Property>) => Promise<void>;
  deleteProperty: (id: string) => Promise<void>;
  addPayment: (p: Omit<Payment, 'id' | 'createdAt'>) => Promise<void>;
  updatePayment: (id: string, updates: Partial<Payment>) => Promise<void>;
  addUtilityBill: (b: Omit<UtilityBill, 'id' | 'createdAt'>) => Promise<void>;
  acknowledgeUtilityBill: (id: string) => Promise<void>;
  addMeterReading: (r: Omit<MeterReading, 'id'>) => Promise<void>;
  addNotification: (n: Omit<AppNotification, 'id' | 'createdAt'>) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  addChatMessage: (m: Omit<ChatMessage, 'id' | 'createdAt'>) => Promise<void>;
  addTask: (t: Omit<PropertyTask, 'id' | 'createdAt'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<PropertyTask>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  getTenantName: (tenantId: string) => string;
  getPropertyName: (propertyId: string) => string;
}

const DataContext = createContext<DataContextType>({} as DataContextType);

// Helper function to map DB rows to frontend types
const mapToCamelCase = (row: any) => {
  if (!row) return row;
  const newObj: any = {};
  for (const key in row) {
    if (Object.prototype.hasOwnProperty.call(row, key)) {
      const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
      newObj[camelKey] = row[key];
    }
  }
  return newObj;
};

const mapToSnakeCase = (obj: any) => {
  if (!obj) return obj;
  const newObj: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      newObj[snakeKey] = obj[key];
    }
  }
  return newObj;
};

export function DataProvider({ children }: { children: ReactNode }) {
  const { user, getAllUsers } = useAuth();
  
  const [properties, setProperties] = useState<Property[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [utilityBills, setUtilityBills] = useState<UtilityBill[]>([]);
  const [meterReadings, setMeterReadings] = useState<MeterReading[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [tasks, setTasks] = useState<PropertyTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAllData = async () => {
    if (!user) {
      setProperties([]);
      setPayments([]);
      setUtilityBills([]);
      setMeterReadings([]);
      setNotifications([]);
      setChatMessages([]);
      setTasks([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const results = await Promise.all([
        supabase.from('properties').select('*'),
        supabase.from('payments').select('*'),
        supabase.from('utility_bills').select('*'),
        supabase.from('meter_readings').select('*'),
        supabase.from('notifications').select('*').order('created_at', { ascending: false }),
        supabase.from('messages').select('*').order('created_at', { ascending: true }),
        supabase.from('tasks').select('*')
      ]);

      setProperties((results[0].data || []).map(mapToCamelCase));
      setPayments((results[1].data || []).map(mapToCamelCase));
      setUtilityBills((results[2].data || []).map(mapToCamelCase));
      setMeterReadings((results[3].data || []).map(mapToCamelCase));
      setNotifications((results[4].data || []).map(mapToCamelCase));
      setChatMessages((results[5].data || []).map(mapToCamelCase));
      setTasks((results[6].data || []).map(mapToCamelCase));
    } catch (e) {
      console.error('Error fetching data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [user]);

  const addProperty = async (p: Omit<Property, 'id' | 'createdAt'>) => {
    const dbObj = mapToSnakeCase(p);
    const { data, error } = await supabase.from('properties').insert(dbObj).select().single();
    if (!error && data) {
      setProperties([...properties, mapToCamelCase(data)]);
    }
  };

  const updateProperty = async (id: string, updates: Partial<Property>) => {
    const dbObj = mapToSnakeCase(updates);
    const { error } = await supabase.from('properties').update(dbObj).eq('id', id);
    if (!error) {
      setProperties(properties.map(p => p.id === id ? { ...p, ...updates } : p));
    }
  };

  const deleteProperty = async (id: string) => {
    const { error } = await supabase.from('properties').delete().eq('id', id);
    if (!error) {
      setProperties(properties.filter(p => p.id !== id));
    }
  };

  const addPayment = async (p: Omit<Payment, 'id' | 'createdAt'>) => {
    const dbObj = mapToSnakeCase(p);
    const { data, error } = await supabase.from('payments').insert(dbObj).select().single();
    if (!error && data) {
      setPayments([...payments, mapToCamelCase(data)]);
    }
  };

  const updatePayment = async (id: string, updates: Partial<Payment>) => {
    const dbObj = mapToSnakeCase(updates);
    const { error } = await supabase.from('payments').update(dbObj).eq('id', id);
    if (!error) {
      setPayments(payments.map(p => p.id === id ? { ...p, ...updates } : p));
    }
  };

  const addUtilityBill = async (b: Omit<UtilityBill, 'id' | 'createdAt'>) => {
    const dbObj = mapToSnakeCase(b);
    const { data, error } = await supabase.from('utility_bills').insert(dbObj).select().single();
    
    if (!error && data) {
      setUtilityBills([...utilityBills, mapToCamelCase(data)]);
      
      // Auto-create notification
      await addNotification({
        userId: b.tenantId,
        title: 'Коммунальные платежи',
        message: `Начислены коммунальные услуги за ${b.month}: ${b.total} TJS.${b.electricity ? ' Электричество: ' + b.electricity + ' TJS.' : ''}${b.coldWater ? ' Холодная вода: ' + b.coldWater + ' TJS.' : ''}${b.hotWater ? ' Горячая вода: ' + b.hotWater + ' TJS.' : ''}${b.gas ? ' Газ: ' + b.gas + ' TJS.' : ''}`,
        type: 'utility_bill',
        channel: 'inapp',
        read: false,
        propertyId: b.propertyId
      });
    }
  };

  const acknowledgeUtilityBill = async (id: string) => {
    const { error } = await supabase.from('utility_bills').update({ acknowledged: true, acknowledged_at: new Date().toISOString() }).eq('id', id);
    if (!error) {
      setUtilityBills(utilityBills.map(b => b.id === id ? { ...b, acknowledged: true, acknowledgedAt: new Date().toISOString() } : b));
    }
  };

  const addMeterReading = async (r: Omit<MeterReading, 'id'>) => {
    const dbObj = mapToSnakeCase(r);
    const { data, error } = await supabase.from('meter_readings').insert(dbObj).select().single();
    
    if (!error && data) {
      setMeterReadings([...meterReadings, mapToCamelCase(data)]);
      
      // Select the property's owner ID
      const prop = properties.find(p => p.id === r.propertyId);
      if (prop) {
        const tenantName = getTenantName(r.tenantId);
        await addNotification({
          userId: prop.ownerId,
          title: 'Показания получены',
          message: `${tenantName} передал показания счётчиков за ${r.month}.`,
          type: 'meter_submitted',
          channel: 'inapp',
          read: false,
          propertyId: r.propertyId
        });
      }
    }
  };

  const addNotification = async (n: Omit<AppNotification, 'id' | 'createdAt'>) => {
    const dbObj = mapToSnakeCase(n);
    const { data, error } = await supabase.from('notifications').insert(dbObj).select().single();
    if (!error && data) {
      setNotifications([mapToCamelCase(data), ...notifications]);
    }
  };

  const markNotificationRead = async (id: string) => {
    const { error } = await supabase.from('notifications').update({ read: true }).eq('id', id);
    if (!error) {
      setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    }
  };

  const markAllNotificationsRead = async () => {
    if (!user) return;
    const { error } = await supabase.from('notifications').update({ read: true }).eq('user_id', user.id).eq('read', false);
    if (!error) {
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    }
  };

  const addChatMessage = async (m: Omit<ChatMessage, 'id' | 'createdAt'>) => {
    const dbObj = mapToSnakeCase(m);
    const { data, error } = await supabase.from('messages').insert(dbObj).select().single();
    if (!error && data) {
      setChatMessages([...chatMessages, mapToCamelCase(data)]);
    }
  };

  const addTask = async (t: Omit<PropertyTask, 'id' | 'createdAt'>) => {
    const dbObj = mapToSnakeCase(t);
    const { data, error } = await supabase.from('tasks').insert(dbObj).select().single();
    if (!error && data) {
      setTasks([...tasks, mapToCamelCase(data)]);
    }
  };

  const updateTask = async (id: string, updates: Partial<PropertyTask>) => {
    const dbObj = mapToSnakeCase(updates);
    const { error } = await supabase.from('tasks').update(dbObj).eq('id', id);
    if (!error) {
      setTasks(tasks.map(t => t.id === id ? { ...t, ...updates } : t));
    }
  };

  const deleteTask = async (id: string) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (!error) {
      setTasks(tasks.filter(t => t.id !== id));
    }
  };

  const getTenantName = (tenantId: string) => {
    const allUsers = getAllUsers();
    return allUsers.find(u => u.id === tenantId)?.name || 'Не назначен';
  };
  
  const getPropertyName = (propertyId: string) => properties.find(p => p.id === propertyId)?.name || 'Объект';

  return (
    <DataContext.Provider value={{
      properties, payments, utilityBills, meterReadings, notifications, chatMessages, tasks, isLoading,
      addProperty, updateProperty, deleteProperty, addPayment, updatePayment,
      addUtilityBill, acknowledgeUtilityBill, addMeterReading,
      addNotification, markNotificationRead, markAllNotificationsRead,
      addChatMessage, addTask, updateTask, deleteTask,
      getTenantName, getPropertyName
    }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);
