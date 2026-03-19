import { User, UserRole, NotificationChannel } from '../types';
import { generateId } from '../utils/helpers';

export interface StoredUser extends User {
  passwordHash: string;
}

// Simple hash function for demo purposes (no crypto dependency)
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36) + str.length.toString(36) + 
    str.split('').reduce((a, c) => a + c.charCodeAt(0), 0).toString(36);
}

const STORAGE_KEY = 'rentflow-users';

const defaultUsers: StoredUser[] = [
  {
    id: 'owner-1',
    name: 'Алексей Владимиров',
    email: 'owner@rentflow.com',
    phone: '+992 900 123456',
    role: 'owner',
    preferredChannel: 'email',
    currency: 'TJS',
    createdAt: '2025-01-15',
    onboardingCompleted: true,
    passwordHash: simpleHash('owner123'),
  },
  {
    id: 'tenant-1',
    name: 'Мария Петрова',
    email: 'maria@email.com',
    phone: '+992 900 654321',
    role: 'tenant',
    telegramChatId: '123456',
    preferredChannel: 'telegram',
    currency: 'TJS',
    createdAt: '2025-03-01',
    onboardingCompleted: true,
    passwordHash: simpleHash('tenant123'),
  },
  {
    id: 'tenant-2',
    name: 'Дмитрий Сидоров',
    email: 'dmitry@email.com',
    phone: '+992 900 111222',
    role: 'tenant',
    preferredChannel: 'email',
    currency: 'TJS',
    createdAt: '2025-06-15',
    onboardingCompleted: true,
    passwordHash: simpleHash('tenant123'),
  },
];

function loadUsers(): StoredUser[] {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    return JSON.parse(saved);
  }
  // First run — save defaults
  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultUsers));
  return defaultUsers;
}

function saveUsers(users: StoredUser[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

export function getUsers(): StoredUser[] {
  return loadUsers();
}

export function getUsersPublic(): User[] {
  return loadUsers().map(({ passwordHash, ...user }) => user);
}

export function authenticateUser(email: string, password: string): User | null {
  const users = loadUsers();
  const hash = simpleHash(password);
  const found = users.find(
    u => u.email.toLowerCase() === email.toLowerCase() && u.passwordHash === hash
  );
  if (!found) return null;
  const { passwordHash, ...user } = found;
  return user;
}

export function addUser(data: {
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  password: string;
  preferredChannel?: NotificationChannel;
  currency?: 'TJS' | 'RUB';
}): { success: boolean; error?: string; user?: User } {
  const users = loadUsers();

  // Check duplicate email
  if (users.some(u => u.email.toLowerCase() === data.email.toLowerCase())) {
    return { success: false, error: 'Пользователь с таким email уже существует' };
  }

  const newUser: StoredUser = {
    id: generateId(),
    name: data.name,
    email: data.email,
    phone: data.phone,
    role: data.role,
    preferredChannel: data.preferredChannel || 'email',
    currency: data.currency || 'TJS',
    createdAt: new Date().toISOString(),
    onboardingCompleted: true,
    passwordHash: simpleHash(data.password),
  };

  users.push(newUser);
  saveUsers(users);

  const { passwordHash, ...user } = newUser;
  return { success: true, user };
}

export function updateUserData(
  id: string,
  updates: Partial<Omit<StoredUser, 'id' | 'passwordHash'>>
): boolean {
  const users = loadUsers();
  const index = users.findIndex(u => u.id === id);
  if (index === -1) return false;
  users[index] = { ...users[index], ...updates };
  saveUsers(users);
  return true;
}

export function changePassword(id: string, newPassword: string): boolean {
  const users = loadUsers();
  const index = users.findIndex(u => u.id === id);
  if (index === -1) return false;
  users[index].passwordHash = simpleHash(newPassword);
  saveUsers(users);
  return true;
}

export function deleteUser(id: string): boolean {
  const users = loadUsers();
  const filtered = users.filter(u => u.id !== id);
  if (filtered.length === users.length) return false;
  saveUsers(filtered);
  return true;
}
