import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatINRCompact } from "@/lib/utils/format";

export async function generateMetadata({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: project } = await supabase.from("projects").select("name").eq("id", projectId).maybeSingle();
  return { title: project?.name ?? "Project" };
}

export default async function ProjectDashboardPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .maybeSingle();

  if (!project) notFound();

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
          <Badge variant="secondary">{project.status}</Badge>
        </div>
        <p className="text-sm text-[var(--color-muted-foreground)]">
          {project.location ?? "—"}
          {project.start_date ? ` · started ${formatDate(project.start_date)}` : ""}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi label="Plots" value="— / —" hint="Phase 3" />
        <Kpi label="Land paid" value={formatINRCompact(0)} hint="Phase 2" />
        <Kpi label="Collections" value={formatINRCompact(0)} hint="Phase 3" />
        <Kpi label="Net position" value={formatINRCompact(0)} hint="Phase 5" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project details</CardTitle>
          <CardDescription>Core information you entered when creating this project.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <Field label="Slug" value={<span className="font-mono">{project.slug}</span>} />
          <Field label="Total extent" value={project.total_extent_acres ? `${Number(project.total_extent_acres).toFixed(2)} ac` : "—"} />
          <Field label="Status" value={project.status} />
          <Field label="Start date" value={project.start_date ? formatDate(project.start_date) : "—"} />
          <Field label="Created" value={formatDate(project.created_at)} />
          <Field label="Updated" value={formatDate(project.updated_at)} />
          {project.description && (
            <div className="md:col-span-2">
              <div className="text-xs text-[var(--color-muted-foreground)]">Description</div>
              <div className="mt-1 whitespace-pre-wrap">{project.description}</div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Coming in next phases</CardTitle>
          <CardDescription>This dashboard will fill in as later phases ship.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="text-sm space-y-1 text-[var(--color-muted-foreground)]">
            <li>Phase 2 — Pattadars, land parcels, land payments</li>
            <li>Phase 3 — Plots grid, customers, bookings, receipts</li>
            <li>Phase 4 — Unified payment register, expenses, documents</li>
            <li>Phase 5 — KPIs, charts, alerts, canned reports</li>
            <li>Phase 6 — Excel import wizard, activity log UI, backups</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

function Kpi({ label, value, hint }: { label: string; value: string; hint?: string }) {
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

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs text-[var(--color-muted-foreground)]">{label}</div>
      <div className="mt-0.5">{value}</div>
    </div>
  );
}
