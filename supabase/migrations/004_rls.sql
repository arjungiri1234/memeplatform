-- =============================================================
-- 004_rls.sql
-- Verify RLS is active on all tables + Supabase Storage policies.
-- Run after 001–003. ALTER TABLE ... ENABLE ROW LEVEL SECURITY
-- is a no-op if already enabled, so these are safe to re-run.
-- =============================================================

-- ---------------------------------------------------------------
-- Verify RLS on all three tables
-- ---------------------------------------------------------------

alter table public.profiles  enable row level security;
alter table public.templates enable row level security;
alter table public.memes     enable row level security;

-- ---------------------------------------------------------------
-- Storage object policies
-- Buckets must exist first — see supabase/storage/buckets.sql.
-- Path convention:
--   memes/     → {user_id}/{filename}
--   avatars/   → {user_id}/avatar
--   templates/ → {filename}  (admin-managed)
--
-- storage.foldername(name) returns an array of path segments,
-- so foldername(name)[1] is the first folder = user_id.
-- ---------------------------------------------------------------

-- ==============================================================
-- MEMES BUCKET
-- ==============================================================

-- Public read — the feed shows images to everyone
do $$ begin
  create policy "memes bucket public read"
    on storage.objects for select
    using (bucket_id = 'memes');
exception when duplicate_object then null;
end $$;

-- Authenticated users can upload to their own folder only
do $$ begin
  create policy "memes bucket auth insert"
    on storage.objects for insert
    to authenticated
    with check (
      bucket_id = 'memes'
      and auth.uid()::text = (storage.foldername(name))[1]
    );
exception when duplicate_object then null;
end $$;

-- Users can delete their own uploads (e.g. when they delete a meme)
do $$ begin
  create policy "memes bucket auth delete own"
    on storage.objects for delete
    to authenticated
    using (
      bucket_id = 'memes'
      and auth.uid()::text = (storage.foldername(name))[1]
    );
exception when duplicate_object then null;
end $$;

-- ==============================================================
-- AVATARS BUCKET
-- ==============================================================

-- Public read — avatars shown on profile pages and meme cards
do $$ begin
  create policy "avatars bucket public read"
    on storage.objects for select
    using (bucket_id = 'avatars');
exception when duplicate_object then null;
end $$;

-- Users can upload their own avatar
do $$ begin
  create policy "avatars bucket auth insert own"
    on storage.objects for insert
    to authenticated
    with check (
      bucket_id = 'avatars'
      and auth.uid()::text = (storage.foldername(name))[1]
    );
exception when duplicate_object then null;
end $$;

-- Users can replace / update their own avatar
do $$ begin
  create policy "avatars bucket auth update own"
    on storage.objects for update
    to authenticated
    using (
      bucket_id = 'avatars'
      and auth.uid()::text = (storage.foldername(name))[1]
    );
exception when duplicate_object then null;
end $$;

-- ==============================================================
-- TEMPLATES BUCKET
-- ==============================================================

-- Public read only — template images are served to all users
do $$ begin
  create policy "templates bucket public read"
    on storage.objects for select
    using (bucket_id = 'templates');
exception when duplicate_object then null;
end $$;

-- No user insert / update / delete — admin-managed via dashboard only
