import { createSupabaseServerClient } from "./server";

/**
 * Server-side auth helpers.
 *
 * These read the session from the browser cookie LOCALLY, without a
 * round-trip to the Supabase Auth API. That matters because when the Next.js
 * web container can't reach Kong (edge runtime env limits, transient
 * unavailability, misconfig, etc.), `supabase.auth.getUser()` silently fails
 * and the app thinks every authenticated user is signed out.
 *
 * The JWT in the cookie is the source of truth. Postgres RLS — which every
 * server-side write passes through — still authoritatively verifies the JWT
 * on the database side via the auth.uid() / auth.role() functions.
 *
 * Rule of thumb: use these helpers everywhere server-side. Do NOT call
 * supabase.auth.getUser() directly in server components or server actions.
 */

export type SessionUser = {
  id: string;
  email: string | null;
  role: string | null;
};

/** Returns the currently logged-in user, or null. No network call. */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const supabase = await createSupabaseServerClient();
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user) return null;
    return {
      id: session.user.id,
      email: session.user.email ?? null,
      role: (session.user.role as string | undefined) ?? null,
    };
  } catch {
    return null;
  }
}

/** Shortcut for the common case — only need the id. */
export async function getCurrentUserId(): Promise<string | null> {
  return (await getCurrentUser())?.id ?? null;
}
