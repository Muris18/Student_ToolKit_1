-- Run this once in your Supabase project's SQL editor
-- (Dashboard -> SQL Editor -> New query -> paste -> Run).

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  bio text,
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

-- Each user can only see and change their own profile row.
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);
