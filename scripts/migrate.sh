#!/usr/bin/env bash
# Apply Acrely Postgres migrations against the running `db` container.
# Idempotent: each migration uses `create ... if not exists` / `on conflict do nothing`,
# and a small ledger table tracks which files have been applied.
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$HERE"

if [ ! -f .env ]; then
  echo "ERROR: .env not found. Run ./scripts/init.sh first." >&2
  exit 1
fi

echo "Waiting for db to be healthy..."
for i in $(seq 1 30); do
  status="$(docker compose ps --format '{{.Health}}' db 2>/dev/null | head -n1 || true)"
  if [ "$status" = "healthy" ]; then
    break
  fi
  sleep 2
  if [ "$i" -eq 30 ]; then
    echo "ERROR: db container did not become healthy in 60s." >&2
    docker compose ps db
    exit 1
  fi
done
echo "  ...ok"

# Create the ledger table if missing.
docker compose exec -T db psql -U postgres -d postgres -v ON_ERROR_STOP=1 <<'SQL'
create table if not exists public._acrely_migrations (
  filename text primary key,
  applied_at timestamptz not null default now()
);
SQL

echo
echo "Applying migrations from supabase/migrations/..."

for f in $(ls supabase/migrations/*.sql | sort); do
  name="$(basename "$f")"
  already="$(docker compose exec -T db psql -U postgres -d postgres -tAc \
    "select 1 from public._acrely_migrations where filename = '${name}'" 2>/dev/null | tr -d '[:space:]')"
  if [ "$already" = "1" ]; then
    echo "  • ${name} (already applied)"
    continue
  fi

  echo "  → ${name}"
  docker compose exec -T db psql -U postgres -d postgres -v ON_ERROR_STOP=1 \
    -f "/acrely-migrations/${name}"

  docker compose exec -T db psql -U postgres -d postgres -v ON_ERROR_STOP=1 -c \
    "insert into public._acrely_migrations (filename) values ('${name}') on conflict do nothing;"
done

echo
echo "✓ Migrations applied."
