import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "./page-header";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: { label: string; href: string };
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border bg-card py-20 text-center shadow-[var(--shadow-sm)]">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent)]" style={{ color: "var(--primary)" }}>
        <Icon className="h-5 w-5" />
      </span>
      <div className="space-y-1">
        <p className="font-display font-semibold">{title}</p>
        {description && (
          <p className="mx-auto max-w-sm text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action && (
        <Button asChild size="sm" className="mt-1">
          <Link href={action.href}>{action.label}</Link>
        </Button>
      )}
    </div>
  );
}

/** Page stub : titre + empty state intentionnel (plus de bordure "chantier"). */
export function Wip({
  title,
  note,
  icon,
  action,
}: {
  title: string;
  note?: string;
  icon: LucideIcon;
  action?: { label: string; href: string };
}) {
  return (
    <div>
      <PageHeader title={title} />
      <EmptyState
        icon={icon}
        title={note ?? "Coming soon"}
        description="This section is coming soon."
        action={action}
      />
    </div>
  );
}
