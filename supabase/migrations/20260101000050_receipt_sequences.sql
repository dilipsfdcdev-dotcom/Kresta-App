-- Receipt sequences: per project per year, collision-safe.
-- Format returned: <PROJECT_CODE>-<YEAR>-<NNNN>, e.g., MB-2026-0001

create table public.receipt_sequences (
  project_id uuid not null references public.projects(id) on delete cascade,
  year int not null,
  last_number int not null default 0,
  primary key (project_id, year)
);

comment on table public.receipt_sequences is
  'Tracks last receipt number per project per year. Access via public.next_receipt_number().';

-- Collision-safe next-number function. Uses row-level lock via INSERT ... ON CONFLICT
-- with a returning clause, then an UPDATE that SELECT...FOR UPDATEs the row.
create or replace function public.next_receipt_number(
  p_project_id uuid,
  p_project_code text,
  p_year int
) returns text
language plpgsql
as $$
declare
  v_next int;
begin
  -- Upsert the (project, year) row and atomically increment. The unique key
  -- guarantees one row; the FOR UPDATE locks it against concurrent callers.
  insert into public.receipt_sequences (project_id, year, last_number)
  values (p_project_id, p_year, 0)
  on conflict (project_id, year) do nothing;

  update public.receipt_sequences
     set last_number = last_number + 1
   where project_id = p_project_id
     and year = p_year
   returning last_number into v_next;

  return format('%s-%s-%s', upper(p_project_code), p_year, lpad(v_next::text, 4, '0'));
end $$;

comment on function public.next_receipt_number is
  'Returns the next receipt number for a project/year. Collision-safe via row lock.';

-- down:
--   drop function if exists public.next_receipt_number(uuid, text, int);
--   drop table if exists public.receipt_sequences;
