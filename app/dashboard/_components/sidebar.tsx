"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CalendarClock, Settings, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { BRAND } from "@/lib/brand";

const NAV = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/dashboard/planning", label: "Planning", icon: CalendarClock },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const path = usePathname();
  return (
    <aside className="flex w-60 shrink-0 flex-col gap-1 border-r bg-[var(--sidebar)] p-4">
      <Link
        href="/onboarding"
        className="mb-5 flex items-center gap-2.5 px-2 py-1 text-sm"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-lg text-white shadow-[var(--shadow-sm)]" style={{ background: "var(--gradient-hero)" }}>
          <Flame className="h-4 w-4" />
        </span>
        <span className="font-display text-[15px] font-bold tracking-tight">{BRAND}</span>
      </Link>
      {NAV.map((n) => {
        const active = n.href === "/dashboard" ? path === n.href : path.startsWith(n.href);
        return (
          <Link
            key={n.href}
            href={n.href}
            className={cn(
              "relative flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors",
              active
                ? "bg-accent font-medium text-accent-foreground"
                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
            )}
          >
            {active && (
              <span className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-primary" />
            )}
            <n.icon className="h-4 w-4" /> {n.label}
          </Link>
        );
      })}
    </aside>
  );
}
