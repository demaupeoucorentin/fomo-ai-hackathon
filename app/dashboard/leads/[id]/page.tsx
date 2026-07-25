import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, Phone, CheckCircle2, Clock, Building2, CalendarClock } from "lucide-react";
import { container } from "@/adapters/composition/container";
import { NotFoundError } from "@/core/domain/errors";
import { agentMeta } from "@/lib/signal-meta";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

// Friendly labels for the email angle (mirrors core/services/templates.ts).
const TEMPLATE_LABEL: Record<string, string> = {
  competitor_comparison: "Competitor comparison",
  growth_signal: "Growth signal",
  new_role: "New role",
  hiring: "Hiring",
  follow_up: "Follow-up",
  breakup: "Last follow-up",
};
const templateLabel = (k: string) => TEMPLATE_LABEL[k] ?? k;

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let data;
  try {
    data = await container.getLeadDetail.execute(id);
  } catch (e) {
    if (e instanceof NotFoundError) notFound();
    throw e;
  }

  const { lead, company, signals, emails } = data;
  const sentCount = emails.filter((em) => em.status === "sent").length;
  const scheduledCount = emails.length - sentCount;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/dashboard/leads"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Leads
      </Link>

      {/* Lead identity card */}
      <div className="rounded-2xl border bg-card p-6 shadow-[var(--shadow-sm)]">
        <div className="flex items-start gap-4">
          <Avatar className="h-14 w-14 ring-2 ring-black/5">
            <AvatarImage src={lead.avatarUrl ?? undefined} alt="" />
            <AvatarFallback className="text-base">
              {lead.firstName[0]}
              {lead.lastName[0]}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <h1 className="font-display text-2xl font-semibold tracking-tight">
              {lead.firstName} {lead.lastName}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {[lead.position, company?.name].filter(Boolean).join(" · ")}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              {lead.email && (
                <span className="inline-flex items-center gap-1.5 rounded-full border bg-background px-2.5 py-1 text-xs text-muted-foreground">
                  <span className="size-2 rounded-full" style={{ background: "var(--email-dot)" }} />
                  <Mail className="h-3.5 w-3.5" />
                  {lead.email}
                </span>
              )}
              {lead.phone && (
                <span className="inline-flex items-center gap-1.5 rounded-full border bg-background px-2.5 py-1 text-xs text-muted-foreground">
                  <Phone className="h-3.5 w-3.5" />
                  {lead.phone}
                </span>
              )}
              {company?.name && (
                <span className="inline-flex items-center gap-1.5 rounded-full border bg-background px-2.5 py-1 text-xs text-muted-foreground">
                  <Building2 className="h-3.5 w-3.5" />
                  {company.name}
                </span>
              )}
              {(lead.email || lead.phone) && (
                <Badge className="gap-1 border-[var(--primary)]/25 bg-[var(--accent)] text-[var(--accent-foreground)]">
                  <CheckCircle2 className="h-3 w-3" />
                  Synced to HubSpot
                </Badge>
              )}
            </div>

            {signals.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Signals
                </span>
                {signals.map((s) => (
                  <span
                    key={s.id}
                    className={cn(
                      "rounded-full border px-2 py-0.5 text-[11px]",
                      agentMeta(s.agentType).className,
                    )}
                  >
                    {agentMeta(s.agentType).label}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Email sequence */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display flex items-center gap-2 text-lg font-semibold tracking-tight">
            <Mail className="h-4 w-4" style={{ color: "var(--primary)" }} />
            Email sequence
          </h2>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {sentCount > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-emerald-700">
                <CheckCircle2 className="h-3 w-3" />
                {sentCount} sent
              </span>
            )}
            {scheduledCount > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-amber-700">
                <Clock className="h-3 w-3" />
                {scheduledCount} scheduled
              </span>
            )}
          </div>
        </div>

        {emails.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border bg-card py-16 text-center shadow-[var(--shadow-sm)]">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <CalendarClock className="h-5 w-5" />
            </span>
            <p className="text-sm text-muted-foreground">No emails scheduled for this lead yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {emails.map((em) => {
              const sent = em.status === "sent";
              return (
                <div
                  key={em.id}
                  className="rounded-2xl border bg-card p-5 shadow-[var(--shadow-sm)] transition-shadow hover:shadow-[var(--shadow)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-display truncate font-semibold tracking-tight">
                        {em.subject}
                      </div>
                      <div className="mt-0.5 text-xs text-muted-foreground">
                        {templateLabel(em.templateKey)}
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px]",
                          sent
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-amber-200 bg-amber-50 text-amber-700",
                        )}
                      >
                        {sent ? (
                          <>
                            <CheckCircle2 className="h-3 w-3" /> Sent
                          </>
                        ) : (
                          <>
                            <Clock className="h-3 w-3" /> Scheduled
                          </>
                        )}
                      </span>
                      <span className="font-mono text-xs text-muted-foreground">{fmt(em.sendDate)}</span>
                    </div>
                  </div>
                  <pre className="mt-4 whitespace-pre-wrap border-t pt-4 font-sans text-sm leading-relaxed text-foreground/90">
                    {em.body}
                  </pre>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
