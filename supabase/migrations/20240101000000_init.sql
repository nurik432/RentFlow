-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Create Users profile table (Extends Supabase Auth users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  email text unique not null,
  phone text,
  role text not null check (role in ('owner', 'tenant')),
  avatar text,
  telegram_chat_id text,
  preferred_channel text default 'email' check (preferred_channel in ('email', 'telegram', 'inapp')),
  currency text default 'TJS' check (currency in ('TJS', 'RUB')),
  onboarding_completed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create Properties table
create table public.properties (
  id uuid default uuid_generate_v4() primary key,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  tenant_id uuid references public.profiles(id) on delete set null,
  name text not null,
  type text not null check (type in ('apartment', 'office', 'warehouse')),
  address text not null,
  description text,
  photo text,
  status text not null check (status in ('rented', 'available', 'preparing')),
  monthly_rent numeric not null,
  contract_start_date date,
  contract_duration integer,
  contract_document text,
  contract_status text not null check (contract_status in ('signed', 'awaiting', 'expired')),
  payment_day integer not null check (payment_day between 1 and 28),
  meter_reading_day integer not null check (meter_reading_day between 1 and 28),
  reminder_days_before integer not null default 3,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create Payments table
create table public.payments (
  id uuid default uuid_generate_v4() primary key,
  property_id uuid references public.properties(id) on delete cascade not null,
  tenant_id uuid references public.profiles(id) on delete cascade not null,
  amount numeric not null,
  type text not null check (type in ('rent', 'utility')),
  status text not null check (status in ('pending', 'received', 'overdue')),
  month text not null, -- Format YYYY-MM
  paid_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Create Utility Bills table
create table public.utility_bills (
  id uuid default uuid_generate_v4() primary key,
  property_id uuid references public.properties(id) on delete cascade not null,
  tenant_id uuid references public.profiles(id) on delete cascade not null,
  month text not null, -- Format YYYY-MM
  electricity numeric,
  cold_water numeric,
  hot_water numeric,
  gas numeric,
  total numeric not null,
  acknowledged boolean default false not null,
  acknowledged_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Create Meter Readings table
create table public.meter_readings (
  id uuid default uuid_generate_v4() primary key,
  property_id uuid references public.properties(id) on delete cascade not null,
  tenant_id uuid references public.profiles(id) on delete cascade not null,
  month text not null, -- Format YYYY-MM
  cold_water numeric,
  hot_water numeric,
  electricity_day numeric,
  electricity_night numeric,
  gas numeric,
  photo text,
  consumption_cold_water numeric,
  consumption_hot_water numeric,
  consumption_electricity_day numeric,
  consumption_electricity_night numeric,
  consumption_gas numeric,
  submitted_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Create Notifications table
create table public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null,
  title text not null,
  message text not null,
  channel text not null,
  read boolean default false not null,
  property_id uuid references public.properties(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Create Messages (Chat) table
create table public.messages (
  id uuid default uuid_generate_v4() primary key,
  property_id uuid references public.properties(id) on delete cascade not null,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  sender_name text,
  message text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. Create Tasks table
create table public.tasks (
  id uuid default uuid_generate_v4() primary key,
  property_id uuid references public.properties(id) on delete cascade not null,
  title text not null,
  description text,
  assignee text,
  deadline timestamp with time zone,
  status text not null check (status in ('todo', 'inprogress', 'done')),
  priority text not null check (priority in ('low', 'medium', 'high')),
  owner_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Security: Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.properties enable row level security;
alter table public.payments enable row level security;
alter table public.utility_bills enable row level security;
alter table public.meter_readings enable row level security;
alter table public.notifications enable row level security;
alter table public.messages enable row level security;
alter table public.tasks enable row level security;

-- Set up RLS Policies

-- PROFILES
-- Users can view all profiles for simplicity in this MVP (owners can see tenants and vice versa)
create policy "Profiles are viewable by authenticated users"
  on public.profiles for select using (auth.role() = 'authenticated');
  
-- Users can insert their own profile during signup via triggers or direct API
create policy "Users can insert their own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- Users can update their own profile
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Owners can insert profiles for their tenants (when they invite them)
-- But mostly we should have an insert policy based on an auth hook or service role.

-- PROPERTIES
create policy "Owners can view their own properties"
  on public.properties for select using (auth.uid() = owner_id);

create policy "Tenants can view assigned properties"
  on public.properties for select using (auth.uid() = tenant_id);

create policy "Owners can create properties"
  on public.properties for insert with check (auth.uid() = owner_id);

create policy "Owners can update their properties"
  on public.properties for update using (auth.uid() = owner_id);

create policy "Owners can delete their properties"
  on public.properties for delete using (auth.uid() = owner_id);

-- Similarly restrict other tables... 
-- For MVP purpose, we'll make them broadly accessible to authenticated users 
-- tied to the property or user
create policy "Authenticated accessible payments"
  on public.payments for all using (auth.role() = 'authenticated');

create policy "Authenticated accessible utility_bills"
  on public.utility_bills for all using (auth.role() = 'authenticated');

create policy "Authenticated accessible meter_readings"
  on public.meter_readings for all using (auth.role() = 'authenticated');

create policy "Authenticated accessible notifications"
  on public.notifications for all using (auth.role() = 'authenticated');

create policy "Authenticated accessible messages"
  on public.messages for all using (auth.role() = 'authenticated');

create policy "Authenticated accessible tasks"
  on public.tasks for all using (auth.role() = 'authenticated');
