-- Supabase service roles + passwords.
-- The supabase/postgres image creates these roles as part of its own init,
-- but does NOT set their passwords. Each Supabase service (auth, rest,
-- storage, realtime) connects as one of these roles, so passwords must match
-- POSTGRES_PASSWORD or the services crash with `password authentication failed`.

-- :'POSTGRES_PASSWORD' is substituted by psql from the POSTGRES_PASSWORD env
-- var that the db container already has set.
\set pgpass `echo "$POSTGRES_PASSWORD"`

do $$
declare
  v_pass text := :'pgpass';
  r record;
  roles text[] := array[
    'authenticator',
    'supabase_admin',
    'supabase_auth_admin',
    'supabase_storage_admin',
    'supabase_realtime_admin',
    'supabase_functions_admin',
    'pgbouncer',
    'anon',
    'authenticated',
    'service_role',
    'dashboard_user'
  ];
  role_name text;
begin
  foreach role_name in array roles loop
    if exists (select 1 from pg_roles where rolname = role_name) then
      execute format('alter role %I with password %L', role_name, v_pass);
    end if;
  end loop;

  -- authenticator needs to be able to assume the JWT-granted roles.
  if exists (select 1 from pg_roles where rolname = 'authenticator') then
    grant anon, authenticated, service_role to authenticator;
  end if;
end $$;
