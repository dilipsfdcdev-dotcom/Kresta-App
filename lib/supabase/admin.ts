import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { env } from "@/lib/utils/env";

/**
 * Admin client using the service role key. Bypasses RLS — only use in server-only
 * code paths (server actions, route handlers) where you've validated the caller.
 * Never import from client components.
 */
export function createSupabaseAdminClient() {
  if (!env.supabaseServiceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  }
  return createClient<Database>(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
