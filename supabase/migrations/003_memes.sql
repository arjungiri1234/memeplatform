-- =============================================================
-- 003_memes.sql
-- User-generated memes — the core content table.
-- Depends on profiles (001) and templates (002).
-- =============================================================

create table if not exists public.memes (
  id           uuid        primary key default gen_random_uuid(),
  user_id      uuid        not null references public.profiles(id) on delete cascade,
  template_id  uuid        references public.templates(id) on delete set null,
  title        text,
  image_url    text        not null,
  language     text        not null default 'en',
  view_count   int         not null default 0,
  created_at   timestamptz not null default now(),

  -- Language must be one of the 5 supported locales
  constraint memes_language_check
    check (language in ('en', 'ne', 'hi', 'ru', 'zh')),

  -- Prevent negative view counts
  constraint memes_view_count_positive
    check (view_count >= 0)
);

-- Enable RLS immediately
alter table public.memes enable row level security;

-- ---------------------------------------------------------------
-- RLS Policies
-- ---------------------------------------------------------------

-- Anyone (including anonymous) can read the public feed
do $$ begin
  create policy "anyone can read memes"
    on public.memes for select
    using (true);
exception when duplicate_object then null;
end $$;

-- Authenticated users can publish memes under their own user_id
do $$ begin
  create policy "auth users insert own memes"
    on public.memes for insert
    with check (auth.uid() = user_id);
exception when duplicate_object then null;
end $$;

-- Users can only delete their own memes
do $$ begin
  create policy "users delete own memes"
    on public.memes for delete
    using (auth.uid() = user_id);
exception when duplicate_object then null;
end $$;

-- ---------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------

-- Profile page: all memes by a specific user (sorted client-side or with created_at)
create index if not exists memes_user_id_idx
  on public.memes (user_id);

-- Feed pagination: cursor-based newest-first (WHERE created_at < cursor ORDER BY created_at DESC)
create index if not exists memes_created_at_desc_idx
  on public.memes (created_at desc);

-- Language filter on the feed (future: "show me Hindi memes only")
create index if not exists memes_language_idx
  on public.memes (language);
