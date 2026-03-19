import { User, Property, Payment, UtilityBill, MeterReading, AppNotification, ChatMessage, PropertyTask } from '../types';

const OWNER_ID = 'owner-1';
const TENANT_1_ID = 'tenant-1';
const TENANT_2_ID = 'tenant-2';
const PROP_1_ID = 'prop-1';
const PROP_2_ID = 'prop-2';
const PROP_3_ID = 'prop-3';

export const mockUsers: User[] = [
  {
    id: OWNER_ID, name: 'Алексей Владимиров', email: 'owner@rentflow.com', phone: '+992 900 123456',
    role: 'owner', preferredChannel: 'email', currency: 'TJS', createdAt: '2025-01-15', onboardingCompleted: true
  },
  {
    id: TENANT_1_ID, name: 'Мария Петрова', email: 'maria@email.com', phone: '+992 900 654321',
    role: 'tenant', telegramChatId: '123456', preferredChannel: 'telegram', currency: 'TJS', createdAt: '2025-03-01', onboardingCompleted: true
  },
  {
    id: TENANT_2_ID, name: 'Дмитрий Сидоров', email: 'dmitry@email.com', phone: '+992 900 111222',
    role: 'tenant', preferredChannel: 'email', currency: 'TJS', createdAt: '2025-06-15', onboardingCompleted: true
  }
];

export const mockProperties: Property[] = [
  {
    id: PROP_1_ID, name: '2-комн. кв. на Рудаки', type: 'apartment', address: 'пр. Рудаки, 45, кв. 12, Душанбе',
    description: 'Уютная двухкомнатная квартира в центре города с отличным ремонтом. Полностью меблирована.', 
    photo: '', status: 'rented', monthlyRent: 3500, contractStartDate: '2025-03-01', contractDuration: 12,
    contractStatus: 'signed', tenantId: TENANT_1_ID, paymentDay: 25, meterReadingDay: 28, reminderDaysBefore: 3, createdAt: '2025-02-20'
  },
  {
    id: PROP_2_ID, name: 'Офис в бизнес-центре', type: 'office', address: 'ул. Айни, 15, офис 302, Душанбе',
    description: 'Современный офис площадью 60 м² с кондиционером и интернетом.',
    photo: '', status: 'rented', monthlyRent: 5000, contractStartDate: '2025-06-01', contractDuration: 24,
    contractStatus: 'signed', tenantId: TENANT_2_ID, paymentDay: 1, meterReadingDay: 28, reminderDaysBefore: 5, createdAt: '2025-05-15'
  },
  {
    id: PROP_3_ID, name: 'Складское помещение', type: 'warehouse', address: 'промзона Гиссар, уч. 8',
    description: 'Склад 200 м² с высокими потолками и удобным подъездом.',
    photo: '', status: 'available', monthlyRent: 8000, contractStartDate: '', contractDuration: 0,
    contractStatus: 'awaiting', paymentDay: 1, meterReadingDay: 28, reminderDaysBefore: 3, createdAt: '2025-09-01'
  }
];

export const mockPayments: Payment[] = [
  { id: 'pay-1', propertyId: PROP_1_ID, tenantId: TENANT_1_ID, amount: 3500, type: 'rent', status: 'received', month: '2026-01', paidAt: '2026-01-25', createdAt: '2026-01-20' },
  { id: 'pay-2', propertyId: PROP_1_ID, tenantId: TENANT_1_ID, amount: 3500, type: 'rent', status: 'received', month: '2026-02', paidAt: '2026-02-24', createdAt: '2026-02-20' },
  { id: 'pay-3', propertyId: PROP_1_ID, tenantId: TENANT_1_ID, amount: 3500, type: 'rent', status: 'pending', month: '2026-03', createdAt: '2026-03-01' },
  { id: 'pay-4', propertyId: PROP_2_ID, tenantId: TENANT_2_ID, amount: 5000, type: 'rent', status: 'received', month: '2026-01', paidAt: '2026-01-02', createdAt: '2025-12-28' },
  { id: 'pay-5', propertyId: PROP_2_ID, tenantId: TENANT_2_ID, amount: 5000, type: 'rent', status: 'received', month: '2026-02', paidAt: '2026-02-01', createdAt: '2026-01-28' },
  { id: 'pay-6', propertyId: PROP_2_ID, tenantId: TENANT_2_ID, amount: 5000, type: 'rent', status: 'pending', month: '2026-03', createdAt: '2026-02-28' },
];

export const mockUtilityBills: UtilityBill[] = [
  { id: 'util-1', propertyId: PROP_1_ID, tenantId: TENANT_1_ID, month: '2026-01', electricity: 180, coldWater: 45, hotWater: 90, gas: 60, total: 375, acknowledged: true, acknowledgedAt: '2026-02-03', createdAt: '2026-02-01' },
  { id: 'util-2', propertyId: PROP_1_ID, tenantId: TENANT_1_ID, month: '2026-02', electricity: 200, coldWater: 50, hotWater: 95, gas: 55, total: 400, acknowledged: true, acknowledgedAt: '2026-03-02', createdAt: '2026-03-01' },
  { id: 'util-3', propertyId: PROP_2_ID, tenantId: TENANT_2_ID, month: '2026-01', electricity: 350, coldWater: 30, hotWater: 0, gas: 0, total: 380, acknowledged: true, acknowledgedAt: '2026-02-02', createdAt: '2026-02-01' },
  { id: 'util-4', propertyId: PROP_2_ID, tenantId: TENANT_2_ID, month: '2026-02', electricity: 320, coldWater: 35, hotWater: 0, gas: 0, total: 355, acknowledged: false, createdAt: '2026-03-01' },
];

export const mockMeterReadings: MeterReading[] = [
  { id: 'mr-1', propertyId: PROP_1_ID, tenantId: TENANT_1_ID, month: '2026-01', coldWater: 1245, hotWater: 890, electricityDay: 4520, electricityNight: 1890, gas: 345, submittedAt: '2026-01-28T14:30:00',
    consumption: { coldWater: 12, hotWater: 8, electricityDay: 180, electricityNight: 75, gas: 15 } },
  { id: 'mr-2', propertyId: PROP_1_ID, tenantId: TENANT_1_ID, month: '2026-02', coldWater: 1260, hotWater: 900, electricityDay: 4710, electricityNight: 1970, gas: 362, submittedAt: '2026-02-27T10:15:00',
    consumption: { coldWater: 15, hotWater: 10, electricityDay: 190, electricityNight: 80, gas: 17 } },
  { id: 'mr-3', propertyId: PROP_2_ID, tenantId: TENANT_2_ID, month: '2026-01', coldWater: 567, electricityDay: 8900, electricityNight: 3200, submittedAt: '2026-01-29T09:00:00',
    consumption: { coldWater: 8, electricityDay: 350, electricityNight: 120 } },
  { id: 'mr-4', propertyId: PROP_2_ID, tenantId: TENANT_2_ID, month: '2026-02', coldWater: 578, electricityDay: 9210, electricityNight: 3320, submittedAt: '2026-02-28T16:45:00',
    consumption: { coldWater: 11, electricityDay: 310, electricityNight: 120 } },
];

export const mockNotifications: AppNotification[] = [
  { id: 'n-1', userId: TENANT_1_ID, title: 'Напоминание об оплате', message: 'Оплата аренды за март 2026: 3 500 TJS. Срок: 25 марта.', type: 'payment_reminder', channel: 'inapp', read: false, propertyId: PROP_1_ID, createdAt: '2026-03-22T10:00:00' },
  { id: 'n-2', userId: OWNER_ID, title: 'Показания получены', message: 'Мария Петрова передала показания счётчиков за февраль.', type: 'meter_submitted', channel: 'inapp', read: true, propertyId: PROP_1_ID, createdAt: '2026-02-27T10:15:00' },
  { id: 'n-3', userId: TENANT_2_ID, title: 'Коммунальные платежи', message: 'Начислены коммунальные услуги за февраль: 355 TJS.', type: 'utility_bill', channel: 'inapp', read: false, propertyId: PROP_2_ID, createdAt: '2026-03-01T09:00:00' },
  { id: 'n-4', userId: OWNER_ID, title: 'Оплата получена', message: 'Дмитрий Сидоров оплатил аренду за февраль: 5 000 TJS.', type: 'payment_received', channel: 'inapp', read: true, propertyId: PROP_2_ID, createdAt: '2026-02-01T12:00:00' },
  { id: 'n-5', userId: TENANT_1_ID, title: 'Передайте показания', message: 'Передайте показания счётчиков до 28 марта.', type: 'meter_request', channel: 'inapp', read: false, propertyId: PROP_1_ID, createdAt: '2026-03-26T08:00:00' },
];

export const mockChatMessages: ChatMessage[] = [
  { id: 'msg-1', propertyId: PROP_1_ID, senderId: TENANT_1_ID, senderName: 'Мария Петрова', message: 'Здравствуйте! Подскажите, когда будет замена крана в ванной?', createdAt: '2026-03-15T10:30:00' },
  { id: 'msg-2', propertyId: PROP_1_ID, senderId: OWNER_ID, senderName: 'Алексей Владимиров', message: 'Добрый день! Сантехник придёт в четверг, 20 марта, с 10:00 до 12:00.', createdAt: '2026-03-15T11:15:00' },
  { id: 'msg-3', propertyId: PROP_1_ID, senderId: TENANT_1_ID, senderName: 'Мария Петрова', message: 'Отлично, спасибо! Буду дома.', createdAt: '2026-03-15T11:20:00' },
];

export const mockTasks: PropertyTask[] = [
  { id: 'task-1', propertyId: PROP_1_ID, title: 'Замена крана в ванной', description: 'Заменить кран горячей воды в ванной комнате', assignee: 'Сантехник Иванов', deadline: '2026-03-20', status: 'inprogress', priority: 'high', createdAt: '2026-03-10' },
  { id: 'task-2', propertyId: PROP_1_ID, title: 'Побелка потолка', description: 'Обновить побелку потолка в гостиной', assignee: 'Маляр Петров', deadline: '2026-04-15', status: 'todo', priority: 'low', createdAt: '2026-03-05' },
  { id: 'task-3', propertyId: PROP_2_ID, title: 'Замена кондиционера', description: 'Установить новый кондиционер в офисе', assignee: 'Климат-Сервис', deadline: '2026-03-25', status: 'todo', priority: 'medium', createdAt: '2026-03-01' },
];

export const monthlyRevenue = [
  { month: 'Апр', amount: 8500 }, { month: 'Май', amount: 8500 }, { month: 'Июн', amount: 8500 },
  { month: 'Июл', amount: 8500 }, { month: 'Авг', amount: 8500 }, { month: 'Сен', amount: 8500 },
  { month: 'Окт', amount: 8500 }, { month: 'Ноя', amount: 8500 }, { month: 'Дек', amount: 8500 },
  { month: 'Янв', amount: 8500 }, { month: 'Фев', amount: 8500 }, { month: 'Мар', amount: 3500 },
];
