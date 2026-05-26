-- =============================================================
-- 001_profiles.sql
-- User profiles — one row per auth.users entry.
-- Rows are created automatically by the handle_new_user trigger
-- defined in 005_triggers.sql.
-- =============================================================

-- Create profiles table
create table if not exists public.profiles (
  id          uuid        primary key references auth.users(id) on delete cascade,
  username    text        unique not null,
  avatar_url  text,
  locale      text        not null default 'en',
  created_at  timestamptz not null default now(),

  -- Only allow the 5 supported locales
  constraint profiles_locale_check
    check (locale in ('en', 'ne', 'hi', 'ru', 'zh'))
);

-- Enable RLS immediately — no queries work without an explicit policy
alter table public.profiles enable row level security;

-- ---------------------------------------------------------------
-- RLS Policies
-- DO blocks allow idempotent re-runs without errors
-- ---------------------------------------------------------------

-- Anyone (including anonymous users) can read all public profiles
do $$ begin
  create policy "anyone can read profiles"
    on public.profiles for select
    using (true);
exception when duplicate_object then null;
end $$;

-- A user can only insert their own profile row (id must match auth session)
do $$ begin
  create policy "users insert own profile"
    on public.profiles for insert
    with check (auth.uid() = id);
exception when duplicate_object then null;
end $$;

-- A user can only update their own profile row
do $$ begin
  create policy "users update own profile"
    on public.profiles for update
    using (auth.uid() = id);
exception when duplicate_object then null;
end $$;

-- ---------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------

-- Fast username lookups for search, uniqueness checks, and @mentions
create index if not exists profiles_username_idx
  on public.profiles (username);
