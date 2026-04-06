export type UserRole = 'owner' | 'tenant';
export type PropertyType = 'apartment' | 'office' | 'warehouse';
export type PropertyStatus = 'rented' | 'available' | 'preparing';
export type PaymentStatus = 'pending' | 'received' | 'overdue';
export type ContractStatus = 'signed' | 'awaiting' | 'expired';
export type NotificationChannel = 'email' | 'telegram' | 'inapp';
export type TaskStatus = 'todo' | 'inprogress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  telegramChatId?: string;
  preferredChannel: NotificationChannel;
  currency: 'TJS' | 'RUB';
  createdAt: string;
  onboardingCompleted: boolean;
}

export interface Property {
  id: string;
  name: string;
  type: PropertyType;
  address: string;
  description: string;
  photo?: string;
  status: PropertyStatus;
  monthlyRent: number;
  contractStartDate: string;
  contractDuration: number; // months
  contractDocument?: string;
  contractStatus: ContractStatus;
  ownerId: string;
  tenantId?: string;
  paymentDay: number; // day of month
  meterReadingDay: number; // day of month
  reminderDaysBefore: number;
  createdAt: string;
}

export interface Payment {
  id: string;
  propertyId: string;
  tenantId: string;
  amount: number;
  type: 'rent' | 'utility';
  status: PaymentStatus;
  month: string; // YYYY-MM
  paidAt?: string | null;
  createdAt: string;
}

export interface UtilityBill {
  id: string;
  propertyId: string;
  tenantId: string;
  month: string; // YYYY-MM
  electricityAmount: number;
  coldWaterAmount: number;
  hotWaterAmount: number;
  waterDischargeAmount: number;
  totalAmount: number;
  acknowledged: boolean;
  acknowledgedAt?: string;
  createdAt: string;
}

export interface MeterReading {
  id: string;
  propertyId: string;
  tenantId: string;
  month: string; // YYYY-MM
  coldWater?: number;
  hotWater?: number;
  electricity?: number;
  photo?: string;
  submittedAt: string;
  consumption?: {
    coldWater?: number;
    hotWater?: number;
    electricity?: number;
  };
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'payment_reminder' | 'meter_request' | 'utility_bill' | 'meter_submitted' | 'payment_received' | 'general' | 'chat';
  channel: NotificationChannel;
  read: boolean;
  propertyId?: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  propertyId: string;
  senderId: string;
  senderName: string;
  message: string;
  createdAt: string;
}

export interface PropertyTask {
  id: string;
  propertyId: string;
  title: string;
  description: string;
  assignee: string;
  deadline: string;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  propertyId: string;
  propertyName: string;
  tenantName: string;
  type: 'payment' | 'meter_reading';
  date: string;
  status: PaymentStatus;
}
