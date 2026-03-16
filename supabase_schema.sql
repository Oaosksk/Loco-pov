-- ================================================
-- Loco App — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor
-- ================================================

-- Notes table
create table notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  title text not null,
  body text,
  tag text default 'personal',
  is_public boolean default false,
  share_token text unique,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Goals table
create table goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  title text not null,
  progress float default 0,
  target float not null,
  unit text default '%',
  due date,
  status text default 'active',
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table notes enable row level security;
alter table goals enable row level security;

-- Notes policies
create policy "users own notes" on notes
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "public notes readable" on notes
  for select using (is_public = true);

-- Goals policy
create policy "users own goals" on goals
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Auto-update updated_at on notes
create or replace function handle_note_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger notes_updated_at
  before update on notes
  for each row
  execute function handle_note_updated_at();
