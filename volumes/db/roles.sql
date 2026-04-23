-- Supabase service roles. Supabase's base image already creates most of these,
-- but this ensures they exist in case of an older image or fresh init.

-- anon, authenticated, service_role are created by PostgREST.
-- supabase_admin, supabase_auth_admin, supabase_storage_admin, authenticator
-- are created by the Supabase Postgres image's init.

-- If you need to grant extra roles, do it here.

-- Ensure authenticator can assume all needed roles
do $$ begin
  if exists (select 1 from pg_roles where rolname = 'authenticator') then
    grant anon, authenticated, service_role to authenticator;
  end if;
end $$;
