"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const projectSchema = z.object({
  name: z.string().trim().min(2, "Name required").max(120),
  slug: z.string().trim().min(2).max(60).regex(slugRegex, "lowercase letters, numbers, hyphens"),
  location: z.string().trim().max(200).optional().or(z.literal("")),
  total_extent_acres: z
    .union([z.string(), z.number()])
    .optional()
    .transform((v) => (v === "" || v === undefined ? null : Number(v)))
    .refine((v) => v === null || (Number.isFinite(v) && v >= 0), "Must be a positive number"),
  status: z.enum(["Planning", "Acquiring", "Selling", "Completed"]),
  start_date: z.string().optional().or(z.literal("")).transform((v) => (v === "" || v === undefined ? null : v)),
  description: z.string().max(2000).optional().or(z.literal("")),
});

export type ProjectFormState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function createProject(_prev: ProjectFormState, formData: FormData): Promise<ProjectFormState> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = projectSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, message: "Check the fields below.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Not signed in" };

  const payload = {
    name: parsed.data.name,
    slug: parsed.data.slug,
    location: parsed.data.location || null,
    total_extent_acres: parsed.data.total_extent_acres,
    status: parsed.data.status,
    start_date: parsed.data.start_date,
    description: parsed.data.description || null,
    created_by: user.id,
    updated_by: user.id,
  };

  const { data: inserted, error } = await supabase
    .from("projects")
    .insert(payload)
    .select("id")
    .single();

  if (error || !inserted) {
    if (error?.code === "23505") {
      return { ok: false, message: "A project with that slug already exists.", fieldErrors: { slug: ["Already in use"] } };
    }
    return { ok: false, message: error?.message ?? "Failed to create project" };
  }

  await supabase.from("activity_log").insert({
    user_id: user.id,
    action: "project.created",
    entity_type: "project",
    entity_id: inserted.id,
    project_id: inserted.id,
    details: { name: parsed.data.name, slug: parsed.data.slug },
  });

  revalidatePath("/");
  revalidatePath("/projects");
  redirect(`/projects/${inserted.id}`);
}

export async function updateProject(id: string, _prev: ProjectFormState, formData: FormData): Promise<ProjectFormState> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = projectSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, message: "Check the fields below.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Not signed in" };

  const { error } = await supabase
    .from("projects")
    .update({
      name: parsed.data.name,
      slug: parsed.data.slug,
      location: parsed.data.location || null,
      total_extent_acres: parsed.data.total_extent_acres,
      status: parsed.data.status,
      start_date: parsed.data.start_date,
      description: parsed.data.description || null,
      updated_by: user.id,
    })
    .eq("id", id);

  if (error) return { ok: false, message: error.message };

  await supabase.from("activity_log").insert({
    user_id: user.id,
    action: "project.updated",
    entity_type: "project",
    entity_id: id,
    project_id: id,
    details: { name: parsed.data.name },
  });

  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath(`/projects/${id}`);
  return { ok: true, message: "Project updated" };
}
