-- ─── Enable UUID extension ───────────────────────────────────────────────────
create extension if not exists "pgcrypto";

-- ─── notes (one per day per user) ────────────────────────────────────────────
create table if not exists notes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  note_date   date not null,
  created_at  timestamptz default now(),
  unique (user_id, note_date)
);
alter table notes enable row level security;
create policy "notes: own rows" on notes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─── note_entries ─────────────────────────────────────────────────────────────
create table if not exists note_entries (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  note_id      uuid references notes(id) on delete set null,
  note_date    date not null default current_date,
  raw_text     text not null,
  parsed_type  text not null default 'casual',
  parsed_data  jsonb default '{}',
  entry_time   timestamptz default now(),
  is_edited    boolean default false,
  created_at   timestamptz default now()
);
alter table note_entries enable row level security;
create policy "note_entries: own rows" on note_entries for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─── goals ───────────────────────────────────────────────────────────────────
create table if not exists goals (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  title       text not null,
  progress    numeric default 0,
  target      numeric default 100,
  unit        text default '%',
  due         date,
  status      text default 'active' check (status in ('active', 'completed', 'paused')),
  created_at  timestamptz default now()
);
alter table goals enable row level security;
create policy "goals: own rows" on goals for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─── goal_tasks ───────────────────────────────────────────────────────────────
create table if not exists goal_tasks (
  id          uuid primary key default gen_random_uuid(),
  goal_id     uuid not null references goals(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  title       text not null,
  done        boolean default false,
  sort_order  int default 0,
  created_at  timestamptz default now()
);
alter table goal_tasks enable row level security;
create policy "goal_tasks: own rows" on goal_tasks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─── expenses ────────────────────────────────────────────────────────────────
create table if not exists expenses (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  note_entry_id   uuid references note_entries(id) on delete set null,
  description     text not null,
  amount          numeric not null default 0,
  category        text default 'other',
  date            date not null default current_date,
  created_at      timestamptz default now()
);
alter table expenses enable row level security;
create policy "expenses: own rows" on expenses for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─── health_logs ─────────────────────────────────────────────────────────────
create table if not exists health_logs (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  note_entry_id   uuid references note_entries(id) on delete set null,
  metric          text not null,
  value           numeric,
  unit            text default '',
  note            text default '',
  date            date not null default current_date,
  created_at      timestamptz default now()
);
alter table health_logs enable row level security;
create policy "health_logs: own rows" on health_logs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─── reminders ───────────────────────────────────────────────────────────────
create table if not exists reminders (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  note_entry_id   uuid references note_entries(id) on delete set null,
  title           text not null,
  remind_at       timestamptz,
  push_sent       boolean default false,
  created_at      timestamptz default now()
);
alter table reminders enable row level security;
create policy "reminders: own rows" on reminders for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─── subscriptions ───────────────────────────────────────────────────────────
create table if not exists subscriptions (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users(id) on delete cascade,
  note_entry_id       uuid references note_entries(id) on delete set null,
  name                text not null,
  amount              numeric not null default 0,
  cycle               text default 'monthly' check (cycle in ('weekly','monthly','quarterly','yearly')),
  next_due            date,
  remind_days_before  int default 3,
  created_at          timestamptz default now()
);
alter table subscriptions enable row level security;
create policy "subscriptions: own rows" on subscriptions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
