-- Projects: top-level layout projects (Meadow Breeze is #1).
-- Future projects plug in here without schema changes.

create type public.project_status as enum ('Planning', 'Acquiring', 'Selling', 'Completed');

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  location text,
  total_extent_acres numeric(10, 2),
  status public.project_status not null default 'Planning',
  start_date date,
  cover_image_url text,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null
);

create index projects_status_idx on public.projects (status);
create index projects_created_at_idx on public.projects (created_at desc);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger projects_set_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

comment on table public.projects is 'Top-level real estate layout projects. One row per project site.';

-- down:
--   drop trigger if exists projects_set_updated_at on public.projects;
--   drop table if exists public.projects;
--   drop function if exists public.set_updated_at();
--   drop type if exists public.project_status;
