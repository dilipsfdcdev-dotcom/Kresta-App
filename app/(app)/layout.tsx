import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/app/app-shell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();

  // Use getSession() — reads the JWT from the cookie locally, no network call.
  // getUser() would call the Supabase API to re-validate, which can redirect
  // loop if the API is briefly unreachable. Server actions that actually
  // mutate data still use getUser() where we can surface errors.
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, slug")
    .order("created_at", { ascending: false });

  return (
    <AppShell userEmail={session.user.email ?? null} projects={projects ?? []}>
      {children}
    </AppShell>
  );
}
