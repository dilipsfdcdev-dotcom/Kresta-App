"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FolderKanban, Wallet, FileText, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function MobileNav({ currentProjectId }: { currentProjectId?: string | null }) {
  const pathname = usePathname();
  const base = currentProjectId ? `/projects/${currentProjectId}` : null;

  const items = [
    { href: "/", label: "Home", icon: Home, match: (p: string) => p === "/" },
    {
      href: base ? `${base}/plots` : "/projects",
      label: "Plots",
      icon: FolderKanban,
      match: (p: string) => p.includes("/plots") || p === "/projects",
    },
    {
      href: base ? `${base}/payments` : "/",
      label: "Payments",
      icon: Wallet,
      match: (p: string) => p.includes("/payments"),
    },
    {
      href: base ? `${base}/documents` : "/",
      label: "Docs",
      icon: FileText,
      match: (p: string) => p.includes("/documents"),
    },
    {
      href: "/settings/profile",
      label: "More",
      icon: MoreHorizontal,
      match: (p: string) => p.startsWith("/settings"),
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 grid grid-cols-5 border-t border-[var(--color-border)] bg-[var(--color-card)] pb-[env(safe-area-inset-bottom)]">
      {items.map((item) => {
        const Icon = item.icon;
        const active = item.match(pathname);
        return (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center py-2 text-[11px] gap-1",
              active ? "text-[var(--color-primary)]" : "text-[var(--color-muted-foreground)]",
            )}
          >
            <Icon className="h-5 w-5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
