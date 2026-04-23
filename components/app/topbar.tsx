"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut, User as UserIcon, Menu } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProjectSwitcher, type ProjectOption } from "./project-switcher";
import { env } from "@/lib/utils/env";

type TopbarProps = {
  userEmail: string | null;
  projects: ProjectOption[];
  currentProjectId: string | null;
};

export function Topbar({ userEmail, projects, currentProjectId }: TopbarProps) {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <header className="flex h-14 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-card)] px-4 md:px-6">
      <div className="flex items-center gap-3">
        <Link href="/" className="md:hidden flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--color-primary)] text-[var(--color-primary-foreground)] font-bold">
            {env.appName.slice(0, 1)}
          </div>
          <span className="text-sm font-semibold">{env.appName}</span>
        </Link>
        <div className="hidden md:block">
          <ProjectSwitcher projects={projects} currentProjectId={currentProjectId} />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="md:hidden">
          <ProjectSwitcher projects={projects} currentProjectId={currentProjectId} />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="User menu">
              <UserIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="text-xs font-normal text-[var(--color-muted-foreground)]">Signed in as</span>
                <span className="truncate">{userEmail ?? "—"}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings/profile" className="cursor-pointer">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={handleSignOut} className="cursor-pointer text-[var(--color-destructive)]">
              <LogOut className="h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
