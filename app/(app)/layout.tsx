import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/app/app-shell";

/**
 * The (app) group layout. Middleware has already gated unauthenticated access
 * (cookie-presence check in middleware.ts), so by the time we get here there
 * should be a session cookie. We do NOT redirect from this layout — any
 * `redirect("/login")` here can race with middleware and produce a loop.
 * If the cookie is somehow missing/malformed, render an empty shell; the
 * next navigation will hit middleware and redirect cleanly.
 */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();

  let userEmail: string | null = null;
  let projects: Array<{ id: string; name: string; slug: string }> = [];

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    userEmail = session?.user?.email ?? null;

    if (session) {
      const { data } = await supabase
        .from("projects")
        .select("id, name, slug")
        .order("created_at", { ascending: false });
      projects = (data as typeof projects) ?? [];
    }
  } catch {
    // Swallow — middleware will redirect unauthenticated users on next hop.
  }

  return (
    <AppShell userEmail={userEmail} projects={projects}>
      {children}
    </AppShell>
  );
}
