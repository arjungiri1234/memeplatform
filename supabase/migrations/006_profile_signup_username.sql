-- Preserve the username selected during email signup, including when email
-- confirmation is enabled and the new user does not receive a session yet.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_base     text;
  v_username text;
  v_suffix   int := 0;
begin
  if new.raw_user_meta_data->>'username' is not null
     and trim(new.raw_user_meta_data->>'username') <> ''
  then
    v_base := trim(new.raw_user_meta_data->>'username');
  elsif new.raw_user_meta_data->>'name' is not null
        and trim(new.raw_user_meta_data->>'name') <> ''
  then
    v_base := trim(new.raw_user_meta_data->>'name');
  elsif new.email is not null then
    v_base := split_part(new.email, '@', 1);
  else
    v_base := 'user_' || substr(replace(new.id::text, '-', ''), 1, 8);
  end if;

  v_base := lower(regexp_replace(v_base, '[^a-zA-Z0-9]', '_', 'g'));
  v_base := regexp_replace(v_base, '_+', '_', 'g');
  v_base := trim('_' from v_base);

  if v_base is null or v_base = '' then
    v_base := 'user_' || substr(replace(new.id::text, '-', ''), 1, 8);
  end if;

  v_username := v_base;

  while exists (
    select 1 from public.profiles where username = v_username
  ) loop
    v_suffix := v_suffix + 1;

    if v_suffix = 1 then
      v_username := v_base || '_'
        || lpad((floor(random() * 9000 + 1000)::int)::text, 4, '0');
    else
      v_username := v_base || '_' || lpad(v_suffix::text, 4, '0');
    end if;
  end loop;

  insert into public.profiles (id, username, locale)
  values (
    new.id,
    v_username,
    case
      when new.raw_user_meta_data->>'locale' in ('en', 'ne', 'hi', 'ru', 'zh')
        then new.raw_user_meta_data->>'locale'
      else 'en'
    end
  );

  return new;
end;
$$;
