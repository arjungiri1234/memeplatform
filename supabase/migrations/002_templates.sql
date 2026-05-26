-- =============================================================
-- 002_templates.sql
-- Meme templates — curated by admins, read-only for end users.
-- Populated via supabase/seed/templates.sql.
-- =============================================================

create table if not exists public.templates (
  id          uuid        primary key default gen_random_uuid(),
  name        text        not null,
  image_url   text        not null,
  category    text,
  created_at  timestamptz not null default now(),

  -- Constrain to the four supported category values
  constraint templates_category_check
    check (category in ('reaction', 'animal', 'text', 'custom'))
);

-- Enable RLS immediately
alter table public.templates enable row level security;

-- ---------------------------------------------------------------
-- RLS Policies
-- ---------------------------------------------------------------

-- Anyone can browse the template gallery (public read)
do $$ begin
  create policy "anyone can read templates"
    on public.templates for select
    using (true);
exception when duplicate_object then null;
end $$;

-- No user insert / update / delete — managed via Supabase dashboard
-- or the seed script run by an admin.

-- ---------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------

-- Category filter on the template picker grid
create index if not exists templates_category_idx
  on public.templates (category);
