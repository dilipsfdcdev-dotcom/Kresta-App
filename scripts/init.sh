#!/usr/bin/env bash
# First-time setup for Acrely.
#
# Generates secrets into your .env file if they're missing:
#   - POSTGRES_PASSWORD (32 hex chars)
#   - JWT_SECRET (64 hex chars)
#   - ANON_KEY, SERVICE_ROLE_KEY (signed JWTs derived from JWT_SECRET)
#
# Idempotent: only fills blanks. Existing values are preserved.
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$HERE"

if [ ! -f .env ]; then
  if [ -f .env.example ]; then
    cp .env.example .env
    echo "Created .env from .env.example"
  else
    echo "ERROR: .env.example not found" >&2
    exit 1
  fi
fi

get() {
  local key="$1"
  # shellcheck disable=SC2002
  cat .env | awk -F= -v k="$key" '$1==k { sub(/^[^=]*=/,""); print; exit }'
}

set_kv() {
  local key="$1" val="$2"
  if grep -qE "^${key}=" .env; then
    # macOS-compatible sed -i with empty backup arg
    if sed --version >/dev/null 2>&1; then
      sed -i "s|^${key}=.*|${key}=${val}|" .env
    else
      sed -i "" "s|^${key}=.*|${key}=${val}|" .env
    fi
  else
    printf "\n%s=%s\n" "$key" "$val" >> .env
  fi
}

# Require openssl
if ! command -v openssl >/dev/null 2>&1; then
  echo "ERROR: openssl not installed" >&2
  exit 1
fi

# Postgres password
if [ -z "$(get POSTGRES_PASSWORD)" ] || [ "$(get POSTGRES_PASSWORD)" = "change-me-strong-password" ]; then
  PG_PASS="$(openssl rand -hex 16)"
  set_kv POSTGRES_PASSWORD "$PG_PASS"
  echo "Generated POSTGRES_PASSWORD"
fi

# JWT secret
if [ -z "$(get JWT_SECRET)" ]; then
  JWT_SECRET="$(openssl rand -hex 32)"
  set_kv JWT_SECRET "$JWT_SECRET"
  echo "Generated JWT_SECRET"
fi
JWT_SECRET="$(get JWT_SECRET)"

# Dashboard password
if [ -z "$(get DASHBOARD_PASSWORD)" ] || [ "$(get DASHBOARD_PASSWORD)" = "change-me-studio-password" ]; then
  set_kv DASHBOARD_PASSWORD "$(openssl rand -hex 12)"
  echo "Generated DASHBOARD_PASSWORD"
fi

# ----------------------------------------------------------------------------
# Sign a JWT (HS256) with JWT_SECRET for the given payload.
# Pure bash + openssl, no node/python dependency.
# ----------------------------------------------------------------------------
b64url() {
  openssl base64 -A | tr '+/' '-_' | tr -d '='
}

sign_jwt() {
  local payload_json="$1"
  local header='{"alg":"HS256","typ":"JWT"}'
  local header_b64 payload_b64 sig
  header_b64="$(printf '%s' "$header" | b64url)"
  payload_b64="$(printf '%s' "$payload_json" | b64url)"
  sig="$(printf '%s.%s' "$header_b64" "$payload_b64" \
    | openssl dgst -sha256 -hmac "$JWT_SECRET" -binary \
    | b64url)"
  printf '%s.%s.%s' "$header_b64" "$payload_b64" "$sig"
}

# 10-year expiry (supabase convention for self-hosted keys)
iat=$(date +%s)
exp=$((iat + 315360000))

if [ -z "$(get ANON_KEY)" ]; then
  anon_payload="{\"role\":\"anon\",\"iss\":\"supabase\",\"iat\":${iat},\"exp\":${exp}}"
  set_kv ANON_KEY "$(sign_jwt "$anon_payload")"
  echo "Generated ANON_KEY"
fi

if [ -z "$(get SERVICE_ROLE_KEY)" ]; then
  svc_payload="{\"role\":\"service_role\",\"iss\":\"supabase\",\"iat\":${iat},\"exp\":${exp}}"
  set_kv SERVICE_ROLE_KEY "$(sign_jwt "$svc_payload")"
  echo "Generated SERVICE_ROLE_KEY"
fi

echo
echo "✓ .env initialised."
echo
echo "Next steps:"
echo "  ./scripts/dev.sh    # dev mode: Supabase in Docker + 'npm run dev' on host"
echo "  ./scripts/start.sh  # production mode: everything in Docker"
echo
echo "First login:"
echo "  Open http://localhost:3000/login, enter your email, then open the"
echo "  inbucket inbox at http://localhost:9000 to read the OTP."
