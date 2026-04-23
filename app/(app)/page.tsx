import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatINRCompact, formatDate } from "@/lib/utils/format";
import { env } from "@/lib/utils/env";
import { Plus } from "lucide-react";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, slug, location, status, total_extent_acres, start_date, description")
    .order("created_at", { ascending: false });

  const projectCount = projects?.length ?? 0;
  const totalAcres =
    projects?.reduce((sum, p) => sum + (p.total_extent_acres ? Number(p.total_extent_acres) : 0), 0) ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{env.appName}</h1>
          <p className="text-sm text-[var(--color-muted-foreground)]">
            {env.companyName} — all projects at a glance.
          </p>
        </div>
        <Button asChild>
          <Link href="/projects">
            <Plus className="h-4 w-4" />
            New project
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <KpiCard label="Projects" value={String(projectCount)} />
        <KpiCard label="Land acquired" value={`${totalAcres.toFixed(2)} ac`} hint="total extent across projects" />
        <KpiCard label="Sales booked" value={formatINRCompact(0)} hint="phase 3+" />
        <KpiCard label="Collected" value={formatINRCompact(0)} hint="phase 3+" />
        <KpiCard label="Net position" value={formatINRCompact(0)} hint="phase 5" />
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Projects</h2>
        </div>
        {projectCount === 0 ? (
          <Card>
            <CardContent className="py-12 text-center space-y-3">
              <p className="text-[var(--color-muted-foreground)]">No projects yet.</p>
              <Button asChild>
                <Link href="/projects">
                  <Plus className="h-4 w-4" />
                  Create your first project
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects!.map((p) => (
              <Card key={p.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <CardTitle className="truncate">{p.name}</CardTitle>
                      <CardDescription className="truncate">{p.location ?? "—"}</CardDescription>
                    </div>
                    <Badge variant="secondary">{p.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 text-sm">
                    <div>
                      <div className="text-xs text-[var(--color-muted-foreground)]">Extent</div>
                      <div className="font-medium tabular-nums">
                        {p.total_extent_acres ? `${Number(p.total_extent_acres).toFixed(2)} ac` : "—"}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-[var(--color-muted-foreground)]">Started</div>
                      <div className="font-medium">{p.start_date ? formatDate(p.start_date) : "—"}</div>
                    </div>
                  </div>
                  <Button variant="outline" asChild className="w-full">
                    <Link href={`/projects/${p.id}`}>Open</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function KpiCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card>
      <CardContent className="py-4">
        <div className="text-xs text-[var(--color-muted-foreground)]">{label}</div>
        <div className="text-xl font-bold tabular-nums">{value}</div>
        {hint ? <div className="text-[10px] text-[var(--color-muted-foreground)] mt-0.5">{hint}</div> : null}
      </CardContent>
    </Card>
  );
}
