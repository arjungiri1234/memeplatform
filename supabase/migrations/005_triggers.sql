-- =============================================================
-- 005_triggers.sql
-- Auto-create a profiles row when a new auth.users row is inserted.
--
-- Edge cases handled:
--   1. Google OAuth — raw_user_meta_data.name is present
--   2. Email auth — derive username from local part of email
--   3. Social auth with no email — use a prefix of the user UUID
--   4. Username collision — append a random 4-digit suffix
--   5. Special characters in name — sanitize to [a-z0-9_] only
-- =============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
-- Lock search_path to prevent search-path injection attacks
set search_path = public
as $$
declare
  v_base     text;
  v_username text;
  v_suffix   int := 0;
begin
  -- ----------------------------------------------------------
  -- Step 1: derive a base username from auth metadata
  -- ----------------------------------------------------------

  if new.raw_user_meta_data->>'name' is not null
     and trim(new.raw_user_meta_data->>'name') <> ''
  then
    -- Google / social OAuth provides a display name
    v_base := trim(new.raw_user_meta_data->>'name');

  elsif new.email is not null then
    -- Standard email auth: use the local part before @
    v_base := split_part(new.email, '@', 1);

  else
    -- Social provider with no email and no name (e.g. anonymous upgrade)
    -- Use the first 8 characters of the UUID (no dashes)
    v_base := 'user_' || substr(replace(new.id::text, '-', ''), 1, 8);
  end if;

  -- ----------------------------------------------------------
  -- Step 2: sanitize
  --   - lowercase everything
  --   - replace any non-alphanumeric character with underscore
  --   - collapse consecutive underscores
  --   - strip leading / trailing underscores
  -- ----------------------------------------------------------

  v_base := lower(regexp_replace(v_base, '[^a-zA-Z0-9]', '_', 'g'));
  v_base := regexp_replace(v_base, '_+', '_', 'g');
  v_base := trim('_' from v_base);

  -- Fallback if sanitization produced an empty string
  if v_base is null or v_base = '' then
    v_base := 'user_' || substr(replace(new.id::text, '-', ''), 1, 8);
  end if;

  -- ----------------------------------------------------------
  -- Step 3: resolve username collisions
  --   First attempt: raw base (e.g. "arjun")
  --   On collision: append random 4-digit number (e.g. "arjun_4271")
  --   Further collisions: increment the suffix numerically
  -- ----------------------------------------------------------

  v_username := v_base;

  while exists (
    select 1 from public.profiles where username = v_username
  ) loop
    v_suffix := v_suffix + 1;

    if v_suffix = 1 then
      -- First retry: random 4-digit suffix (1000–9999)
      v_username := v_base || '_'
        || lpad((floor(random() * 9000 + 1000)::int)::text, 4, '0');
    else
      -- Further retries: deterministic incrementing suffix
      v_username := v_base || '_' || lpad(v_suffix::text, 4, '0');
    end if;
  end loop;

  -- ----------------------------------------------------------
  -- Step 4: insert the profile row
  -- ----------------------------------------------------------

  insert into public.profiles (id, username, locale)
  values (
    new.id,
    v_username,
    -- Google passes locale in metadata (e.g. "ne", "hi"); fall back to 'en'
    case
      when new.raw_user_meta_data->>'locale' in ('en', 'ne', 'hi', 'ru', 'zh')
        then new.raw_user_meta_data->>'locale'
      else 'en'
    end
  );

  return new;
end;
$$;

-- Drop existing trigger before recreating to keep this file idempotent
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
