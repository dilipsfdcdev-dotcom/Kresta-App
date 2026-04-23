#!/usr/bin/env bash
# Bring the Postgres schema to a state where Acrely and the Supabase services
# are both happy. Does three things, idempotently:
#
#   1) Bootstrap: set service-role passwords + create _realtime schema.
#      These were supposed to run via /docker-entrypoint-initdb.d but the
#      stock Postgres initdb doesn't recurse into subdirectories.
#   2) Apply Acrely migrations from supabase/migrations/.
#   3) Record applied filenames in public._acrely_migrations so re-runs are no-ops.
#
# Safe to run multiple times.
set -euo pipefail

# Git Bash / MSYS on Windows rewrites arguments that look like absolute Unix
# paths (e.g. /acrely-migrations/...) to Windows paths before the command
# executes — breaking paths that are meant to resolve INSIDE the container.
export MSYS_NO_PATHCONV=1
export MSYS2_ARG_CONV_EXCL="*"

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

psql_exec() {
  docker compose exec -T db psql -U postgres -d postgres -v ON_ERROR_STOP=1 "$@"
}

# ---------------------------------------------------------------------------
# 1. Bootstrap SQL — role passwords + schemas the Supabase services need.
# ---------------------------------------------------------------------------
echo
echo "Applying stack bootstrap..."

for f in roles.sql realtime.sql jwt.sql; do
  if [ -f "volumes/db/${f}" ]; then
    echo "  → volumes/db/${f}"
    psql_exec -f "/db-bootstrap/${f}"
  fi
done

# ---------------------------------------------------------------------------
# 2. Acrely migrations ledger.
# ---------------------------------------------------------------------------
psql_exec <<'SQL'
create table if not exists public._acrely_migrations (
  filename text primary key,
  applied_at timestamptz not null default now()
);
SQL

echo
echo "Applying Acrely migrations..."
for f in $(ls supabase/migrations/*.sql | sort); do
  name="$(basename "$f")"
  already="$(docker compose exec -T db psql -U postgres -d postgres -tAc \
    "select 1 from public._acrely_migrations where filename = '${name}'" 2>/dev/null | tr -d '[:space:]')"
  if [ "$already" = "1" ]; then
    echo "  • ${name} (already applied)"
    continue
  fi

  echo "  → ${name}"
  psql_exec -f "/acrely-migrations/${name}"
  psql_exec -c "insert into public._acrely_migrations (filename) values ('${name}') on conflict do nothing;"
done

echo
echo "✓ Stack bootstrapped and migrations applied."
echo
echo "If auth / rest / storage / realtime / kong are still in restart loops,"
echo "give them a nudge now that the db is ready:"
echo "  docker compose restart kong auth rest storage realtime"
