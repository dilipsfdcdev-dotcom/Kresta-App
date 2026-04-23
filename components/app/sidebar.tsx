"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  Landmark,
  Home,
  Wallet,
  Receipt,
  Users,
  FileText,
  BarChart3,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { env } from "@/lib/utils/env";

type NavItem = { href: string; label: string; icon: React.ComponentType<{ className?: string }> };

const globalNav: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: FolderKanban },
];

const projectNavTemplate: (projectId: string) => NavItem[] = (id) => [
  { href: `/projects/${id}`, label: "Overview", icon: Home },
  { href: `/projects/${id}/plots`, label: "Plots", icon: FolderKanban },
  { href: `/projects/${id}/land`, label: "Land", icon: Landmark },
  { href: `/projects/${id}/payments`, label: "Payments", icon: Wallet },
  { href: `/projects/${id}/expenses`, label: "Expenses", icon: Receipt },
  { href: `/projects/${id}/customers`, label: "Customers", icon: Users },
  { href: `/projects/${id}/documents`, label: "Documents", icon: FileText },
  { href: `/projects/${id}/reports`, label: "Reports", icon: BarChart3 },
  { href: `/projects/${id}/settings`, label: "Settings", icon: Settings },
];

const settingsNav: NavItem[] = [
  { href: "/settings/accounts", label: "Bank Accounts", icon: Landmark },
  { href: "/settings/import", label: "Import", icon: FileText },
  { href: "/settings/backups", label: "Backups", icon: Settings },
  { href: "/settings/profile", label: "Profile", icon: Users },
];

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-[var(--color-accent)] text-[var(--color-accent-foreground)]"
          : "text-[var(--color-muted-foreground)] hover:bg-[var(--color-accent)] hover:text-[var(--color-accent-foreground)]",
      )}
    >
      <Icon className="h-4 w-4" />
      {item.label}
    </Link>
  );
}

export function Sidebar({ currentProjectId }: { currentProjectId?: string | null }) {
  const pathname = usePathname();
  const projectNav = currentProjectId ? projectNavTemplate(currentProjectId) : [];

  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--color-card)]">
      <div className="flex h-14 items-center gap-2 border-b border-[var(--color-border)] px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--color-primary)] text-[var(--color-primary-foreground)] font-bold">
          {env.appName.slice(0, 1)}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold leading-none">{env.appName}</span>
          <span className="text-[10px] text-[var(--color-muted-foreground)]">{env.companyName}</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-6">
        <div className="space-y-1">
          {globalNav.map((item) => (
            <NavLink key={item.href} item={item} active={pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))} />
          ))}
        </div>

        {projectNav.length > 0 && (
          <div className="space-y-1">
            <div className="px-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-muted-foreground)]">
              Current Project
            </div>
            {projectNav.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                active={pathname === item.href || (item.href !== `/projects/${currentProjectId}` && pathname.startsWith(item.href))}
              />
            ))}
          </div>
        )}

        <div className="space-y-1">
          <div className="px-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-muted-foreground)]">
            Settings
          </div>
          {settingsNav.map((item) => (
            <NavLink key={item.href} item={item} active={pathname.startsWith(item.href)} />
          ))}
        </div>
      </nav>
    </aside>
  );
}
