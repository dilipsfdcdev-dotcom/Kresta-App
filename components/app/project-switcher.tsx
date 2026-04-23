"use client";

import { useRouter } from "next/navigation";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export type ProjectOption = { id: string; name: string; slug: string };

export function ProjectSwitcher({
  projects,
  currentProjectId,
}: {
  projects: ProjectOption[];
  currentProjectId: string | null;
}) {
  const router = useRouter();
  const current = projects.find((p) => p.id === currentProjectId) ?? null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 min-w-[180px] justify-between">
          <span className="truncate">{current ? current.name : projects.length ? "Pick a project" : "No projects yet"}</span>
          <ChevronsUpDown className="h-4 w-4 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>Projects</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {projects.length === 0 ? (
          <div className="px-2 py-4 text-sm text-[var(--color-muted-foreground)] text-center">
            No projects yet.
          </div>
        ) : (
          projects.map((p) => (
            <DropdownMenuItem
              key={p.id}
              onSelect={() => router.push(`/projects/${p.id}`)}
              className="cursor-pointer justify-between"
            >
              <span className="truncate">{p.name}</span>
              {p.id === currentProjectId ? <Check className="h-4 w-4" /> : null}
            </DropdownMenuItem>
          ))
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/projects" className="cursor-pointer">
            <Plus className="h-4 w-4" />
            New project
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
