import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env } from "@/lib/utils/env";
import type { Database } from "@/types/database";

type CookieToSet = { name: string; value: string; options?: Record<string, unknown> };

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            cookieStore.set(name, value, options as any),
          );
        } catch {
          // `setAll` called from a Server Component — safe to ignore; middleware refreshes the session.
        }
      },
    },
  });
}
