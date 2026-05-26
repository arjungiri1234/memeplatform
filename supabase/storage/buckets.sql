-- =============================================================
-- storage/buckets.sql
-- Create Supabase Storage buckets and object policies.
--
-- Run via:
--   supabase db execute --file supabase/storage/buckets.sql
-- Or paste into the Supabase dashboard SQL editor.
--
-- Bucket creation uses ON CONFLICT DO NOTHING so this file is safe
-- to re-run. Storage RLS policies are PostgreSQL policies on
-- storage.objects, guarded with duplicate_object handlers for the
-- same idempotent behavior.
-- =============================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'memes',
    'memes',
    true,
    5242880,
    array['image/jpeg', 'image/png', 'image/webp']
  ),
  (
    'avatars',
    'avatars',
    true,
    2097152,
    array['image/jpeg', 'image/png', 'image/webp']
  ),
  (
    'templates',
    'templates',
    true,
    null,
    array['image/jpeg', 'image/png', 'image/webp']
  )
on conflict (id) do nothing;

alter table storage.objects enable row level security;

-- =============================================================
-- MEMES BUCKET
-- =============================================================

-- Anyone can read meme images for public feeds and shared meme pages.
do $$ begin
  create policy "memes bucket public read"
    on storage.objects for select
    using (bucket_id = 'memes');
exception when duplicate_object then null;
end $$;

-- Authenticated users can upload meme images only under their own user-id folder.
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

-- Authenticated users can delete only meme images stored under their own user-id folder.
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

-- =============================================================
-- AVATARS BUCKET
-- =============================================================

-- Anyone can read avatars for profiles, meme cards, and public user surfaces.
do $$ begin
  create policy "avatars bucket public read"
    on storage.objects for select
    using (bucket_id = 'avatars');
exception when duplicate_object then null;
end $$;

-- Authenticated users can upload avatar files only under their own user-id folder.
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

-- Authenticated users can update avatar files only when they stay under their own user-id folder.
do $$ begin
  create policy "avatars bucket auth update own"
    on storage.objects for update
    to authenticated
    using (
      bucket_id = 'avatars'
      and auth.uid()::text = (storage.foldername(name))[1]
    )
    with check (
      bucket_id = 'avatars'
      and auth.uid()::text = (storage.foldername(name))[1]
    );
exception when duplicate_object then null;
end $$;

-- =============================================================
-- TEMPLATES BUCKET
-- =============================================================

-- Anyone can read template images; writes are intentionally omitted for users.
do $$ begin
  create policy "templates bucket public read"
    on storage.objects for select
    using (bucket_id = 'templates');
exception when duplicate_object then null;
end $$;

-- No insert, update, or delete policies are created for templates.
-- Template uploads remain admin-only through trusted/server-side access.
