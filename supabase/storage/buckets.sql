-- =============================================================
-- storage/buckets.sql
-- Create the three Supabase Storage buckets.
--
-- Run this BEFORE 004_rls.sql (which adds object policies).
-- Execute via:
--   supabase db execute --file supabase/storage/buckets.sql
-- Or paste into the Supabase dashboard SQL editor.
--
-- ON CONFLICT DO NOTHING makes this safe to re-run.
-- =============================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'memes',
    'memes',
    true,        -- publicly readable (access enforced by RLS in 004_rls.sql)
    10485760,    -- 10 MB per file
    array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  ),
  (
    'avatars',
    'avatars',
    true,        -- publicly readable
    2097152,     -- 2 MB per file
    array['image/jpeg', 'image/png', 'image/webp']
  ),
  (
    'templates',
    'templates',
    true,        -- publicly readable, no user uploads
    10485760,    -- 10 MB per file
    array['image/jpeg', 'image/png', 'image/webp']
  )
on conflict (id) do nothing;
