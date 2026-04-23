#!/usr/bin/env bash
# Dev mode: start the Supabase stack in Docker + apply Acrely migrations.
# Run `npm run dev` on the host for hot reload on the Next.js app.
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$HERE"

if [ ! -f .env ]; then
  echo "No .env file found. Run ./scripts/init.sh first." >&2
  exit 1
fi

# Bring up every service EXCEPT the Acrely web service.
docker compose up -d --remove-orphans \
  db auth rest realtime storage imgproxy meta studio kong inbucket

# Apply Acrely migrations once the db is healthy.
./scripts/migrate.sh

echo
echo "Supabase stack is up:"
echo "  • Kong gateway:     http://localhost:8000"
echo "  • Supabase Studio:  http://localhost:3001"
echo "  • Inbucket (email): http://localhost:9000"
echo
echo "Now start the Next.js app on the host:"
echo "  npm install"
echo "  npm run dev"
echo
echo "Then open http://localhost:3000"
