-- ================================================
-- Loco App — Full Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor
-- ================================================

-- 1. Profiles (extends auth.users)
create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text,
  avatar_url text,
  currency text default 'INR',
  timezone text default 'Asia/Kolkata',
  monthly_budget numeric default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Notes — one row per day per user
create table if not exists notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  note_date date not null default current_date,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, note_date)
);

-- 3. Note Entries — individual parsed lines
create table if not exists note_entries (
  id uuid primary key default gen_random_uuid(),
  note_id uuid references notes(id) on delete cascade,
  user_id uuid references auth.users not null,
  note_date date not null default current_date,
  raw_text text not null,
  parsed_type text not null default 'casual',
  parsed_data jsonb default '{}',
  entry_time timestamptz default now(),
  is_edited boolean default false,
  created_at timestamptz default now()
);

-- 4. Expenses — from @e tags
create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  note_entry_id uuid references note_entries(id) on delete set null,
  description text not null,
  amount numeric not null default 0,
  category text default 'other',
  date date not null default current_date,
  created_at timestamptz default now()
);

-- 5. Subscriptions — recurring expenses
create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  note_entry_id uuid references note_entries(id) on delete set null,
  name text not null,
  amount numeric not null default 0,
  cycle text not null default 'monthly',
  next_due date,
  remind_days_before int default 3,
  created_at timestamptz default now()
);

-- 6. Health Logs — from @h tags
create table if not exists health_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  note_entry_id uuid references note_entries(id) on delete set null,
  metric text not null default 'custom',
  value numeric,
  unit text default '',
  note text default '',
  date date not null default current_date,
  created_at timestamptz default now()
);

-- 7. Goals — checklist goals
create table if not exists goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  title text not null,
  progress float default 0,
  target float not null default 100,
  unit text default '%',
  due date,
  status text default 'active',
  created_at timestamptz default now()
);

-- 8. Goal Tasks — sub-tasks per goal
create table if not exists goal_tasks (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid references goals(id) on delete cascade not null,
  user_id uuid references auth.users not null,
  title text not null,
  done boolean default false,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- 9. Reminders — from @R tags
create table if not exists reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  note_entry_id uuid references note_entries(id) on delete set null,
  title text not null,
  remind_at timestamptz not null,
  push_sent boolean default false,
  created_at timestamptz default now()
);

-- 10. Push Subscriptions — browser push endpoint per device
create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  endpoint text not null,
  p256dh text,
  auth_key text,
  created_at timestamptz default now()
);

-- 11. Uploads — file metadata
create table if not exists uploads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  note_entry_id uuid references note_entries(id) on delete set null,
  filename text not null,
  storage_path text not null,
  mime_type text,
  size_bytes bigint,
  created_at timestamptz default now()
);

-- 12. Streaks — current + longest per category
create table if not exists streaks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  category text not null,
  current_streak int default 0,
  longest_streak int default 0,
  last_logged_date date,
  updated_at timestamptz default now(),
  unique(user_id, category)
);

-- ================================================
-- Enable Row Level Security on ALL tables
-- ================================================
alter table profiles enable row level security;
alter table notes enable row level security;
alter table note_entries enable row level security;
alter table expenses enable row level security;
alter table subscriptions enable row level security;
alter table health_logs enable row level security;
alter table goals enable row level security;
alter table goal_tasks enable row level security;
alter table reminders enable row level security;
alter table push_subscriptions enable row level security;
alter table uploads enable row level security;
alter table streaks enable row level security;

-- ================================================
-- RLS Policies — all scoped to auth.uid()
-- ================================================

-- Profiles
create policy "users own profiles" on profiles
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Notes
create policy "users own notes" on notes
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Note Entries
create policy "users own note_entries" on note_entries
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Expenses
create policy "users own expenses" on expenses
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Subscriptions
create policy "users own subscriptions" on subscriptions
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Health Logs
create policy "users own health_logs" on health_logs
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Goals
create policy "users own goals" on goals
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Goal Tasks
create policy "users own goal_tasks" on goal_tasks
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Reminders
create policy "users own reminders" on reminders
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Push Subscriptions
create policy "users own push_subscriptions" on push_subscriptions
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Uploads
create policy "users own uploads" on uploads
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Streaks
create policy "users own streaks" on streaks
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ================================================
-- Views
-- ================================================

-- Monthly expense summary
create or replace view monthly_expense_summary as
select
  user_id,
  date_trunc('month', date) as month,
  sum(amount) as total,
  count(*) as count
from expenses
group by user_id, date_trunc('month', date);

-- Weekly expense summary
create or replace view weekly_expense_summary as
select
  user_id,
  date_trunc('week', date) as week,
  sum(amount) as total,
  count(*) as count
from expenses
group by user_id, date_trunc('week', date);

-- Subscription monthly cost equivalent
create or replace view subscription_monthly_cost as
select
  user_id,
  sum(
    case cycle
      when 'weekly' then amount * 4.33
      when 'monthly' then amount
      when 'quarterly' then amount / 3.0
      when 'yearly' then amount / 12.0
      else amount
    end
  ) as monthly_total,
  count(*) as count
from subscriptions
group by user_id;

-- ================================================
-- Triggers
-- ================================================

-- Auto-update updated_at on notes
create or replace function handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger notes_updated_at
  before update on notes
  for each row
  execute function handle_updated_at();

create trigger profiles_updated_at
  before update on profiles
  for each row
  execute function handle_updated_at();

-- Auto-create profile on user signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function handle_new_user();
