import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { updateProject } from "../../actions";
import { ProjectForm } from "@/components/forms/project-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Project settings" };

export default async function ProjectSettingsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: project } = await supabase.from("projects").select("*").eq("id", projectId).maybeSingle();
  if (!project) notFound();

  const updateAction = updateProject.bind(null, projectId);

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Project settings</h1>
        <p className="text-sm text-[var(--color-muted-foreground)]">
          Edit project metadata. Rate card and expense categories land in later phases.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project details</CardTitle>
          <CardDescription>These fields are used across the app — including receipt numbers.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProjectForm
            action={updateAction}
            submitLabel="Save changes"
            defaults={{
              name: project.name,
              slug: project.slug,
              location: project.location ?? "",
              total_extent_acres: project.total_extent_acres,
              status: project.status,
              start_date: project.start_date,
              description: project.description,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
