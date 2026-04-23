-- Expense categories (master list). Hierarchical (parent_id self-ref).
-- is_income flag supports future use for income-like categories.

create table public.expense_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  parent_id uuid references public.expense_categories(id) on delete restrict,
  is_income boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index expense_categories_parent_idx on public.expense_categories (parent_id);
create unique index expense_categories_name_parent_unique
  on public.expense_categories (coalesce(parent_id::text, ''), lower(name));

comment on table public.expense_categories is 'Hierarchical expense category master.';

-- down:
--   drop table if exists public.expense_categories;
