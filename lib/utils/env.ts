/**
 * Environment — one place to resolve Acrely's configuration.
 *
 * Two Supabase URLs:
 *  - `supabaseUrl`      → the BROWSER-facing URL (NEXT_PUBLIC_SUPABASE_URL).
 *                         Used in client components, e.g. http://localhost:8000
 *  - `supabaseUrlServer`→ the SERVER-facing URL. When the Next.js app runs in
 *                         Docker it needs http://kong:8000 to reach Kong by
 *                         container DNS. When running on the host (dev mode)
 *                         this is the same as `supabaseUrl`.
 *
 *   Set SUPABASE_URL_INTERNAL=http://kong:8000 in the web container's env.
 *   Leave it unset on the host for dev.
 */

const isServer = typeof window === "undefined";

const browserUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const serverUrl = process.env.SUPABASE_URL_INTERNAL || browserUrl;

export const env = {
  supabaseUrl: isServer ? serverUrl : browserUrl,
  supabaseUrlBrowser: browserUrl,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  appName: process.env.NEXT_PUBLIC_APP_NAME ?? "Acrely",
  companyName: process.env.NEXT_PUBLIC_COMPANY_NAME ?? "Kresta Infra & Developers",
  siteUrl: process.env.SITE_URL ?? "http://localhost:3000",
};

export function assertServerEnv() {
  const missing = [
    ["NEXT_PUBLIC_SUPABASE_URL", env.supabaseUrlBrowser],
    ["NEXT_PUBLIC_SUPABASE_ANON_KEY", env.supabaseAnonKey],
  ].filter(([, v]) => !v).map(([k]) => k);
  if (missing.length) {
    throw new Error(
      `Acrely is missing required env vars: ${missing.join(", ")}. ` +
      `Run ./scripts/init.sh to populate .env, then restart the dev server. ` +
      `If you're running in Docker, make sure .env is populated before ./scripts/start.sh.`,
    );
  }
}
