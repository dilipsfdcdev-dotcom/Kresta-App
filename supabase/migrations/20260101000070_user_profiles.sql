-- User profiles: prepared for future multi-user with roles. For now every
-- authenticated user gets role='owner'. RLS policies will later gate on this.

create type public.user_role as enum ('owner', 'admin', 'staff', 'viewer');

create table public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role public.user_role not null default 'owner',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger user_profiles_set_updated_at
  before update on public.user_profiles
  for each row execute function public.set_updated_at();

-- Auto-create a profile row whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.user_profiles (id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)), 'owner')
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

comment on table public.user_profiles is 'Per-user profile + role. Created automatically on signup.';

-- down:
--   drop trigger if exists on_auth_user_created on auth.users;
--   drop function if exists public.handle_new_user();
--   drop trigger if exists user_profiles_set_updated_at on public.user_profiles;
--   drop table if exists public.user_profiles;
--   drop type if exists public.user_role;
