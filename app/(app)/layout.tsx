import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/auth";
import { AppShell } from "@/components/app/app-shell";

/**
 * The (app) group layout. Middleware has already gated unauthenticated access
 * (cookie-presence check in middleware.ts), so by the time we get here there
 * should be a session cookie. We do NOT redirect from this layout — any
 * `redirect("/login")` here can race with middleware and produce a loop.
 */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  const supabase = await createSupabaseServerClient();

  let projects: Array<{ id: string; name: string; slug: string }> = [];
  if (user) {
    try {
      const { data } = await supabase
        .from("projects")
        .select("id, name, slug")
        .order("created_at", { ascending: false });
      projects = (data as typeof projects) ?? [];
    } catch {
      // Non-fatal: render empty list.
    }
  }

  return (
    <AppShell userEmail={user?.email ?? null} projects={projects}>
      {children}
    </AppShell>
  );
}
