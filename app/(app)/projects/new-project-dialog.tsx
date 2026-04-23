"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ProjectForm } from "@/components/forms/project-form";
import { createProject } from "./actions";

export function NewProjectDialog({ triggerLabel = "New project" }: { triggerLabel?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create project</DialogTitle>
          <DialogDescription>
            Set up a new layout project. The slug is used in receipt numbers.
          </DialogDescription>
        </DialogHeader>
        <ProjectForm action={createProject} submitLabel="Create project" onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
