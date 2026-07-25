"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from "@tanstack/react-table";
import { LayoutDashboard, Mail, Phone, CheckCircle2 } from "lucide-react";
import type { LeadListItem } from "@/core/use-cases/dto";
import { fullName } from "@/core/domain/entities";
import { useLeads } from "@/lib/query/hooks";
import { agentMeta } from "@/lib/signal-meta";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LeadSheet } from "./lead-sheet";
import { SequencePreview } from "./sequence-preview";

const col = createColumnHelper<LeadListItem>();
const initials = (i: LeadListItem) => `${i.lead.firstName[0] ?? ""}${i.lead.lastName[0] ?? ""}`;

export function LeadsStep({ runId }: { runId: string }) {
  const { data, isLoading } = useLeads(runId);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [filter, setFilter] = useState("");
  const [openLead, setOpenLead] = useState<string | null>(null);

  const columns = useMemo(
    () => [
      col.accessor((i) => fullName(i.lead), {
        id: "name",
        header: "Decision-maker",
        cell: (c) => {
          const i = c.row.original;
          return (
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={i.lead.avatarUrl ?? undefined} alt="" />
                <AvatarFallback>{initials(i)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="truncate font-medium">{fullName(i.lead)}</div>
                <div className="truncate text-xs text-muted-foreground">{i.lead.position}</div>
              </div>
            </div>
          );
        },
      }),
      col.accessor((i) => i.company?.name ?? "", {
        id: "company",
        header: "Company",
        cell: (c) => {
          const co = c.row.original.company;
          return (
            <div className="flex items-center gap-2">
              {co?.logoUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={co.logoUrl} alt="" className="h-5 w-5 rounded" />
              )}
              <span className="text-sm">{co?.name}</span>
            </div>
          );
        },
      }),
      col.accessor((i) => i.lead.email ?? "", {
        id: "contact",
        header: "Contact",
        cell: (c) => {
          const l = c.row.original.lead;
          return (
            <div className="space-y-0.5 text-xs">
              {l.email && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Mail className="h-3 w-3" /> {l.email}
                </div>
              )}
              {l.phone && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Phone className="h-3 w-3" /> {l.phone}
                </div>
              )}
              {!l.email && !l.phone && <span className="text-muted-foreground">—</span>}
            </div>
          );
        },
      }),
      col.accessor((i) => i.agentTypes.join(","), {
        id: "signals",
        header: "Signals",
        enableSorting: false,
        cell: (c) => (
          <div className="flex flex-wrap gap-1">
            {c.row.original.agentTypes.map((t) => {
              const m = agentMeta(t);
              return (
                <Badge key={t} className={m.className}>
                  {m.label}
                </Badge>
              );
            })}
          </div>
        ),
      }),
    ],
    [],
  );

  const table = useReactTable({
    data: data?.leads ?? [],
    columns,
    state: { sorting, globalFilter: filter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            <CheckCircle2 className="h-3.5 w-3.5" /> Ready to launch
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            {data?.leads.length ?? 0} leads detected
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Your comparator sequence is ready. Click a lead to view its timeline.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard">
            <LayoutDashboard /> Dashboard
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
        <div className="min-w-0 space-y-4">
          <Input
            placeholder="Search a lead…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="max-w-xs"
          />

          <div className="overflow-x-auto rounded-2xl border bg-card shadow-[var(--shadow-sm)]">
            <table className="w-full text-sm">
          <thead className="border-b bg-muted/40">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((h) => (
                  <th
                    key={h.id}
                    onClick={h.column.getToggleSortingHandler()}
                    className="cursor-pointer px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground"
                  >
                    {flexRender(h.column.columnDef.header, h.getContext())}
                    {{ asc: " ↑", desc: " ↓" }[h.column.getIsSorted() as string] ?? ""}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-muted-foreground">
                  Loading…
                </td>
              </tr>
            )}
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                onClick={() => setOpenLead(row.original.lead.id)}
                className="cursor-pointer border-b transition-colors last:border-0 hover:bg-accent/40"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3 align-middle">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
            </tbody>
          </table>
          </div>
        </div>

        <div className="h-fit lg:sticky lg:top-6">
          <SequencePreview leads={data?.leads ?? []} />
        </div>
      </div>

      <LeadSheet leadId={openLead} onOpenChange={(o) => !o && setOpenLead(null)} />
    </div>
  );
}
