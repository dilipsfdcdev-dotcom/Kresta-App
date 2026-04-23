import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils/format";
import { NewProjectDialog } from "./new-project-dialog";

export const metadata = { title: "Projects" };

export default async function ProjectsListPage() {
  const supabase = await createSupabaseServerClient();
  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, slug, location, status, total_extent_acres, start_date, description, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="text-sm text-[var(--color-muted-foreground)]">
            All layout projects you manage. Each project is an independent book of records.
          </p>
        </div>
        <NewProjectDialog />
      </div>

      {!projects || projects.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center space-y-4">
            <div>
              <h3 className="text-lg font-semibold">No projects yet</h3>
              <p className="text-sm text-[var(--color-muted-foreground)] mt-1">
                Start by adding your first project — e.g. <span className="font-medium">Meadow Breeze</span>.
              </p>
            </div>
            <NewProjectDialog triggerLabel="Create your first project" />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p) => (
            <Card key={p.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <CardTitle className="truncate">{p.name}</CardTitle>
                    <CardDescription className="truncate">{p.location ?? "—"}</CardDescription>
                  </div>
                  <Badge variant="secondary">{p.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 text-sm gap-2">
                  <div>
                    <div className="text-xs text-[var(--color-muted-foreground)]">Slug</div>
                    <div className="font-mono text-sm">{p.slug}</div>
                  </div>
                  <div>
                    <div className="text-xs text-[var(--color-muted-foreground)]">Extent</div>
                    <div className="tabular-nums">
                      {p.total_extent_acres ? `${Number(p.total_extent_acres).toFixed(2)} ac` : "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-[var(--color-muted-foreground)]">Started</div>
                    <div>{p.start_date ? formatDate(p.start_date) : "—"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-[var(--color-muted-foreground)]">Created</div>
                    <div>{formatDate(p.created_at)}</div>
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
    </div>
  );
}
