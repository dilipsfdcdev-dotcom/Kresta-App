-- Bank accounts — shared across projects. Used by land_payments (from_account),
-- customer_payments (to_account), and expenses (from_account).

create type public.account_type as enum ('Savings', 'Current', 'CashOnHand', 'Other');

create table public.accounts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  bank text,
  account_no text,
  ifsc text,
  type public.account_type not null default 'Savings',
  is_active boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index accounts_active_idx on public.accounts (is_active);

create trigger accounts_set_updated_at
  before update on public.accounts
  for each row execute function public.set_updated_at();

comment on table public.accounts is 'Bank / cash accounts. Each payment references an account.';

-- down:
--   drop trigger if exists accounts_set_updated_at on public.accounts;
--   drop table if exists public.accounts;
--   drop type if exists public.account_type;
