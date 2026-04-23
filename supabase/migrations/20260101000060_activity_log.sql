-- Activity log: append-only audit trail. Written on every significant mutation.

create table public.activity_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  project_id uuid references public.projects(id) on delete set null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index activity_log_entity_idx on public.activity_log (entity_type, entity_id);
create index activity_log_project_idx on public.activity_log (project_id, created_at desc);
create index activity_log_user_idx on public.activity_log (user_id, created_at desc);
create index activity_log_created_at_idx on public.activity_log (created_at desc);

comment on table public.activity_log is 'Append-only audit trail. Do not update or delete rows.';

-- down:
--   drop table if exists public.activity_log;
