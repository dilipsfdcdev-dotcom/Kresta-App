import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Bank accounts" };

export default function Page() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Bank accounts</h1>
      <Card>
        <CardHeader>
          <CardTitle>Coming in Phase 4</CardTitle>
          <CardDescription>CRUD for bank accounts and cash accounts, used in payments.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-[var(--color-muted-foreground)]">
          The <code>accounts</code> table already exists (Phase 1 migration). Phase 4 adds the UI.
        </CardContent>
      </Card>
    </div>
  );
}
