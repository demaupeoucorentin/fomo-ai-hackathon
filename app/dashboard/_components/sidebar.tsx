"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Mail,
  Gauge,
  CreditCard,
  Plug,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/leads", label: "Leads", icon: Users },
  { href: "/dashboard/emails", label: "Emails", icon: Mail },
  { href: "/dashboard/usage", label: "Usage", icon: Gauge },
  { href: "/dashboard/pricing", label: "Pricing", icon: CreditCard },
  { href: "/dashboard/crm", label: "CRM", icon: Plug },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const path = usePathname();
  return (
    <aside className="flex w-56 shrink-0 flex-col gap-1 border-r p-4">
      <Link href="/onboarding" className="mb-4 flex items-center gap-2 px-2 text-sm font-semibold">
        <span className="inline-block h-2.5 w-2.5 rounded-full bg-primary" /> Sillage GTM
      </Link>
      {NAV.map((n) => {
        const active = n.href === "/dashboard" ? path === n.href : path.startsWith(n.href);
        return (
          <Link
            key={n.href}
            href={n.href}
            className={cn(
              "flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors",
              active ? "bg-accent font-medium text-accent-foreground" : "text-muted-foreground hover:bg-accent/50",
            )}
          >
            <n.icon className="h-4 w-4" /> {n.label}
          </Link>
        );
      })}
    </aside>
  );
}
