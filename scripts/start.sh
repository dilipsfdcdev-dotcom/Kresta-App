#!/usr/bin/env bash
# Production mode: bring up everything in Docker, apply migrations, then the web app.
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$HERE"

if [ ! -f .env ]; then
  echo "No .env file found. Run ./scripts/init.sh first." >&2
  exit 1
fi

# Start Supabase stack first (without web) so we can migrate against an
# initialised schema before the app tries to read it.
docker compose up -d --remove-orphans \
  db auth rest realtime storage imgproxy meta studio kong inbucket

./scripts/migrate.sh

# Now build + start the web service.
docker compose up -d --build web

echo
echo "Acrely stack is up:"
echo "  • Web:              http://localhost:3000"
echo "  • Supabase API:     http://localhost:8000"
echo "  • Supabase Studio:  http://localhost:3001"
echo "  • Inbucket (dev):   http://localhost:9000"
