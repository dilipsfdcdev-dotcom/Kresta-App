import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Backups" };

export default function Page() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Backups</h1>
      <Card>
        <CardHeader>
          <CardTitle>Coming in Phase 6</CardTitle>
          <CardDescription>
            Daily Postgres + Storage backups, retention, and off-site sync via rclone.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-[var(--color-muted-foreground)]">
          See <code>scripts/backup.sh</code> (Phase 6) and the README for the cron schedule.
        </CardContent>
      </Card>
    </div>
  );
}
