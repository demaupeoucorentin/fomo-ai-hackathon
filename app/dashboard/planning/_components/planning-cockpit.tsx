"use client";
import { useMemo, useState } from "react";
import { Mail, Phone, CalendarClock } from "lucide-react";
import type { PlanningLeadItem } from "@/core/use-cases/dto";
import { fullName } from "@/core/domain/entities";
import { useLeadDetail } from "@/lib/query/hooks";
import { agentMeta } from "@/lib/signal-meta";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { LeadTimeline } from "./lead-timeline";

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });

const initials = (i: PlanningLeadItem) =>
  `${i.lead.firstName[0] ?? ""}${i.lead.lastName[0] ?? ""}`;

export function PlanningCockpit({ leads }: { leads: PlanningLeadItem[] }) {
  const [selected, setSelected] = useState<string | null>(leads[0]?.lead.id ?? null);
  const [search, setSearch] = useState("");
  const [signal, setSignal] = useState("");
  const [batch, setBatch] = useState("");

  const signalOptions = useMemo(
    () => [...new Set(leads.flatMap((l) => l.agentTypes))].sort(),
    [leads],
  );
  const batchOptions = useMemo(
    () => [...new Set(leads.map((l) => l.runName).filter(Boolean) as string[])],
    [leads],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return leads.filter((l) => {
      if (signal && !l.agentTypes.includes(signal)) return false;
      if (batch && l.runName !== batch) return false;
      if (
        q &&
        !`${fullName(l.lead)} ${l.company?.name ?? ""} ${l.lead.position ?? ""}`
          .toLowerCase()
          .includes(q)
      )
        return false;
      return true;
    });
  }, [leads, search, signal, batch]);

  const { data, isLoading } = useLeadDetail(selected);

  return (
    <div className="flex h-[calc(100vh-8.5rem)] gap-4">
      {/* Left rail — leads */}
      <div className="flex w-80 shrink-0 flex-col rounded-xl border">
        <div className="space-y-2 border-b p-3">
          <Input
            placeholder="Rechercher un lead…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="flex gap-2">
            <select
              value={signal}
              onChange={(e) => setSignal(e.target.value)}
              className="w-1/2 rounded-md border bg-background px-2 py-1.5 text-xs"
            >
              <option value="">Tous signaux</option>
              {signalOptions.map((s) => (
                <option key={s} value={s}>
                  {agentMeta(s).label}
                </option>
              ))}
            </select>
            <select
              value={batch}
              onChange={(e) => setBatch(e.target.value)}
              className="w-1/2 rounded-md border bg-background px-2 py-1.5 text-xs"
            >
              <option value="">Toutes séquences</option>
              {batchOptions.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {filtered.length === 0 && (
            <p className="p-4 text-sm text-muted-foreground">Aucun lead.</p>
          )}
          {filtered.map((i) => (
            <button
              key={i.lead.id}
              onClick={() => setSelected(i.lead.id)}
              className={cn(
                "flex w-full items-start gap-3 border-b px-3 py-3 text-left transition-colors last:border-0 hover:bg-accent/40",
                selected === i.lead.id && "bg-accent",
              )}
            >
              <Avatar className="h-9 w-9">
                <AvatarImage src={i.lead.avatarUrl ?? undefined} alt="" />
                <AvatarFallback>{initials(i)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{fullName(i.lead)}</div>
                <div className="truncate text-xs text-muted-foreground">
                  {i.lead.position} · {i.company?.name}
                </div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {i.agentTypes.slice(0, 3).map((t) => (
                    <span
                      key={t}
                      className={cn(
                        "rounded-full border px-1.5 py-0.5 text-[10px]",
                        agentMeta(t).className,
                      )}
                    >
                      {agentMeta(t).label}
                    </span>
                  ))}
                </div>
                <div className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                  <CalendarClock className="h-3 w-3" />
                  {i.emailCount} email{i.emailCount > 1 ? "s" : ""}
                  {i.nextSendDate && <> · prochain {fmt(i.nextSendDate)}</>}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right pane — planning */}
      <div className="min-w-0 flex-1 overflow-y-auto rounded-xl border p-6">
        {!selected && (
          <p className="text-sm text-muted-foreground">Sélectionne un lead à gauche.</p>
        )}
        {selected && isLoading && <p className="text-sm text-muted-foreground">Chargement…</p>}
        {selected && data && (
          <div className="max-w-2xl space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={data.lead.avatarUrl ?? undefined} alt="" />
                <AvatarFallback>
                  {data.lead.firstName[0]}
                  {data.lead.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <h2 className="text-xl font-semibold tracking-tight">{fullName(data.lead)}</h2>
                <p className="text-sm text-muted-foreground">
                  {data.lead.position} · {data.company?.name}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              {data.lead.email && (
                <span className="flex items-center gap-1">
                  <Mail className="h-3 w-3" /> {data.lead.email}
                </span>
              )}
              {data.lead.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="h-3 w-3" /> {data.lead.phone}
                </span>
              )}
              {(data.lead.email || data.lead.phone) && (
                <span className="flex items-center gap-1 rounded-full border border-orange-200 bg-orange-50 px-2 py-0.5 text-orange-700">
                  Synced to HubSpot
                </span>
              )}
            </div>

            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Planification — signaux &amp; emails
              </h3>
              <LeadTimeline data={data} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
