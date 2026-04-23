-- Rate card per project: plot category → rate per sqyd.
-- A project can have multiple rate tiers (Corner, Regular, Premium, etc.)

create table public.rate_card (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  category text not null,
  rate_per_sqyd numeric(12, 2) not null check (rate_per_sqyd >= 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, category)
);

create index rate_card_project_idx on public.rate_card (project_id);

create trigger rate_card_set_updated_at
  before update on public.rate_card
  for each row execute function public.set_updated_at();

comment on table public.rate_card is 'Per-project plot categories and their default rates per sqyd.';

-- down:
--   drop trigger if exists rate_card_set_updated_at on public.rate_card;
--   drop table if exists public.rate_card;
