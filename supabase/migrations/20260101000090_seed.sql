-- Seed data: default expense categories.
-- Idempotent — safe to re-run.

insert into public.expense_categories (name, sort_order) values
  ('Land Acquisition', 10),
  ('Development', 20),
  ('Marketing', 30),
  ('Legal & Registration', 40),
  ('Brokerage', 50),
  ('Utilities', 60),
  ('Salaries', 70),
  ('Operations', 80),
  ('Misc', 999)
on conflict do nothing;

-- down:
--   delete from public.expense_categories where parent_id is null;
