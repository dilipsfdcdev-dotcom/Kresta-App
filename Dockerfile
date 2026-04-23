# syntax=docker/dockerfile:1.7
# Acrely — Next.js 15 production Dockerfile.
# Multi-stage build with standalone output for a small runtime image.
#
# IMPORTANT: Next.js inlines NEXT_PUBLIC_* env vars into the client bundle at
# BUILD time. They must be passed as build args for the browser to see them.
# Server-only env (SUPABASE_SERVICE_ROLE_KEY, SUPABASE_URL_INTERNAL, etc.) is
# read at runtime and comes from docker-compose's `environment:` block.

# ---- deps stage ----
FROM node:20-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json* ./
RUN \
  if [ -f package-lock.json ]; then npm ci; \
  else npm install; fi

# ---- builder stage ----
FROM node:20-alpine AS builder
WORKDIR /app

# Build args → env vars visible during `next build`.
ARG NEXT_PUBLIC_SUPABASE_URL=http://localhost:8000
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder
ARG NEXT_PUBLIC_APP_NAME=Acrely
ARG NEXT_PUBLIC_COMPANY_NAME="Kresta Infra & Developers"
ENV NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
ENV NEXT_PUBLIC_APP_NAME=${NEXT_PUBLIC_APP_NAME}
ENV NEXT_PUBLIC_COMPANY_NAME=${NEXT_PUBLIC_COMPANY_NAME}
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---- runner stage ----
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs \
 && apk add --no-cache wget

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]
