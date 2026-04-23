"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ProjectFormState } from "@/app/(app)/projects/actions";

type Action = (prev: ProjectFormState, formData: FormData) => Promise<ProjectFormState>;

type Defaults = {
  name?: string;
  slug?: string;
  location?: string;
  total_extent_acres?: number | null;
  status?: "Planning" | "Acquiring" | "Selling" | "Completed";
  start_date?: string | null;
  description?: string | null;
};

export function ProjectForm({
  action,
  defaults,
  submitLabel = "Save",
  onSuccess,
}: {
  action: Action;
  defaults?: Defaults;
  submitLabel?: string;
  onSuccess?: () => void;
}) {
  const [state, formAction, pending] = useActionState<ProjectFormState, FormData>(action, { ok: false });
  const [name, setName] = useState(defaults?.name ?? "");
  const [slug, setSlug] = useState(defaults?.slug ?? "");
  const [status, setStatus] = useState<Defaults["status"]>(defaults?.status ?? "Planning");

  // Auto-slug from name when slug field is empty
  useEffect(() => {
    if (!slug && name) {
      const autoSlug = name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
      if (autoSlug) setSlug(autoSlug);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  useEffect(() => {
    if (state.ok && state.message) {
      toast.success(state.message);
      onSuccess?.();
    } else if (!state.ok && state.message) {
      toast.error(state.message);
    }
  }, [state, onSuccess]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (status) fd.set("status", status);
    formAction(fd);
  }

  const fe = state.fieldErrors ?? {};

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Project name *</Label>
        <Input id="name" name="name" value={name} onChange={(e) => setName(e.target.value)} required />
        {fe.name?.[0] && <p className="text-sm text-[var(--color-destructive)]">{fe.name[0]}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Slug *</Label>
        <Input
          id="slug"
          name="slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="meadow-breeze"
          required
        />
        <p className="text-xs text-[var(--color-muted-foreground)]">
          Used in receipt numbers (e.g. MB-2026-0001). Lowercase, hyphens only.
        </p>
        {fe.slug?.[0] && <p className="text-sm text-[var(--color-destructive)]">{fe.slug[0]}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            name="location"
            defaultValue={defaults?.location ?? ""}
            placeholder="Telangana, India"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="total_extent_acres">Total extent (acres)</Label>
          <Input
            id="total_extent_acres"
            name="total_extent_acres"
            type="number"
            step="0.01"
            min="0"
            defaultValue={defaults?.total_extent_acres ?? ""}
            placeholder="63.00"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="status">Status *</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as Defaults["status"])}>
            <SelectTrigger id="status"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Planning">Planning</SelectItem>
              <SelectItem value="Acquiring">Acquiring</SelectItem>
              <SelectItem value="Selling">Selling</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="start_date">Start date</Label>
          <Input
            id="start_date"
            name="start_date"
            type="date"
            defaultValue={defaults?.start_date ?? ""}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={defaults?.description ?? ""}
          placeholder="126 plots across ~63 acres..."
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
