import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils/format";

export const metadata = { title: "Profile" };

export default async function Page() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", user?.id ?? "")
    .maybeSingle();

  return (
    <div className="space-y-4 max-w-2xl">
      <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Your sign-in details. Editable profile fields land in Phase 6.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <Row label="Email" value={user?.email ?? "—"} />
          <Row label="User ID" value={<span className="font-mono text-xs">{user?.id}</span>} />
          <Row label="Role" value={profile?.role ?? "—"} />
          <Row label="Name" value={profile?.full_name ?? "—"} />
          <Row label="Last sign-in" value={user?.last_sign_in_at ? formatDateTime(user.last_sign_in_at) : "—"} />
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b border-[var(--color-border)] py-2 last:border-b-0">
      <div className="text-[var(--color-muted-foreground)]">{label}</div>
      <div className="text-right">{value}</div>
    </div>
  );
}
