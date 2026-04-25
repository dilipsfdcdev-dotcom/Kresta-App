-- Supabase service roles + ownership transfer.
--
-- Idempotent. Applied by scripts/migrate.sh after the db is healthy.
--
-- The supabase/postgres image pre-creates the service roles AND the auth /
-- storage schemas, but:
--   1) doesn't set passwords on the roles, so services like GoTrue and
--      storage-api fail with "password authentication failed".
--   2) leaves the auth / storage schemas owned by `postgres`, so when each
--      service runs its migrations as its own admin role it hits "must be
--      owner of function uid" / "must be owner of table users" errors.
--
-- This file fixes both problems in one pass.

\set pgpass `echo "$POSTGRES_PASSWORD"`

do $$
declare
  v_pass text := :'pgpass';
  r record;
  role_name text;
  roles_to_update text[] := array[
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
begin
  -- ---- 1. Set passwords on every service role that exists ------------------
  foreach role_name in array roles_to_update loop
    if exists (select 1 from pg_roles where rolname = role_name) then
      execute format('alter role %I with password %L', role_name, v_pass);
    end if;
  end loop;

  -- The authenticator role must be able to assume the JWT-granted roles.
  if exists (select 1 from pg_roles where rolname = 'authenticator') then
    grant anon, authenticated, service_role to authenticator;
  end if;

  -- ---- 2. Transfer auth schema ownership to supabase_auth_admin ------------
  if exists (select 1 from pg_namespace where nspname = 'auth')
     and exists (select 1 from pg_roles where rolname = 'supabase_auth_admin') then
    execute 'alter schema auth owner to supabase_auth_admin';

    for r in select p.oid::regprocedure::text as obj from pg_proc p
             join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'auth' loop
      execute 'alter function ' || r.obj || ' owner to supabase_auth_admin';
    end loop;
    for r in select tablename from pg_tables where schemaname = 'auth' loop
      execute format('alter table auth.%I owner to supabase_auth_admin', r.tablename);
    end loop;
    for r in select sequencename from pg_sequences where schemaname = 'auth' loop
      execute format('alter sequence auth.%I owner to supabase_auth_admin', r.sequencename);
    end loop;
  end if;

  -- ---- 3. Transfer storage schema ownership to supabase_storage_admin ------
  if exists (select 1 from pg_namespace where nspname = 'storage')
     and exists (select 1 from pg_roles where rolname = 'supabase_storage_admin') then
    execute 'alter schema storage owner to supabase_storage_admin';

    for r in select p.oid::regprocedure::text as obj from pg_proc p
             join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'storage' loop
      execute 'alter function ' || r.obj || ' owner to supabase_storage_admin';
    end loop;
    for r in select tablename from pg_tables where schemaname = 'storage' loop
      execute format('alter table storage.%I owner to supabase_storage_admin', r.tablename);
    end loop;
    for r in select sequencename from pg_sequences where schemaname = 'storage' loop
      execute format('alter sequence storage.%I owner to supabase_storage_admin', r.sequencename);
    end loop;
  end if;
end $$;

-- The realtime publication needs to exist before the realtime service migrates.
create publication if not exists supabase_realtime;
