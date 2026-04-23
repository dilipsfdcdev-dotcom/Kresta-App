"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { MobileNav } from "./mobile-nav";
import type { ProjectOption } from "./project-switcher";

export function AppShell({
  children,
  userEmail,
  projects,
}: {
  children: React.ReactNode;
  userEmail: string | null;
  projects: ProjectOption[];
}) {
  const pathname = usePathname();
  const match = /^\/projects\/([^/]+)/.exec(pathname);
  const rawId = match?.[1] ?? null;
  // The /projects page itself is not a project id — only treat as id if it looks like a UUID.
  const looksLikeUuid = rawId ? /^[0-9a-f-]{8,}$/i.test(rawId) : false;
  const currentProjectId = looksLikeUuid ? rawId : null;

  return (
    <div className="flex min-h-screen">
      <Sidebar currentProjectId={currentProjectId} />
      <div className="flex flex-1 flex-col min-w-0">
        <Topbar userEmail={userEmail} projects={projects} currentProjectId={currentProjectId} />
        <main className="flex-1 overflow-y-auto pb-20 md:pb-6 px-4 md:px-6 py-6">{children}</main>
        <MobileNav currentProjectId={currentProjectId} />
      </div>
    </div>
  );
}
