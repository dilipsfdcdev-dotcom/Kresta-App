-- Row Level Security: enabled on every Phase 1 table.
-- Single-user policy for now: any authenticated user can do everything.
-- Structured so the future check becomes: is_authenticated_with_role({owner,admin,staff})

alter table public.projects enable row level security;
alter table public.accounts enable row level security;
alter table public.expense_categories enable row level security;
alter table public.rate_card enable row level security;
alter table public.receipt_sequences enable row level security;
alter table public.activity_log enable row level security;
alter table public.user_profiles enable row level security;

-- Helper: is there a session with a signed-in user? Used instead of inlining
-- (auth.uid() is not null) everywhere so we can swap to role checks later.
create or replace function public.is_authenticated()
returns boolean language sql stable security definer set search_path = public as $$
  select auth.uid() is not null
$$;

-- Generic all-access policies. One per table so each can be tightened later
-- (e.g., to a role check) without rewriting all of them.
create policy projects_auth_all on public.projects
  for all to authenticated using (public.is_authenticated()) with check (public.is_authenticated());

create policy accounts_auth_all on public.accounts
  for all to authenticated using (public.is_authenticated()) with check (public.is_authenticated());

create policy expense_categories_auth_all on public.expense_categories
  for all to authenticated using (public.is_authenticated()) with check (public.is_authenticated());

create policy rate_card_auth_all on public.rate_card
  for all to authenticated using (public.is_authenticated()) with check (public.is_authenticated());

create policy receipt_sequences_auth_all on public.receipt_sequences
  for all to authenticated using (public.is_authenticated()) with check (public.is_authenticated());

create policy activity_log_auth_all on public.activity_log
  for all to authenticated using (public.is_authenticated()) with check (public.is_authenticated());

create policy user_profiles_auth_all on public.user_profiles
  for all to authenticated using (public.is_authenticated()) with check (public.is_authenticated());

-- Grants: Supabase defaults usually handle this via default-privileges, but be
-- explicit so a fresh cluster without those events is still usable.
grant usage on schema public to anon, authenticated, service_role;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to authenticated, service_role;
grant execute on all functions in schema public to authenticated, service_role;

-- activity_log is append-only in practice. Lock it down at the grant level so
-- even an app bug can't overwrite the audit trail.
revoke update, delete on public.activity_log from authenticated;

-- down:
--   drop policy if exists projects_auth_all on public.projects; (repeat per table)
--   alter table public.projects disable row level security; (repeat per table)
--   drop function if exists public.is_authenticated();
