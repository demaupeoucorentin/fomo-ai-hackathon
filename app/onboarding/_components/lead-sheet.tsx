"use client";
import { useState } from "react";
import Link from "next/link";
import { Activity, CalendarClock, Mail, Phone, LayoutDashboard, Radio } from "lucide-react";
import type { EmailMessage } from "@/core/domain/entities";
import { fullName } from "@/core/domain/entities";
import { useLeadDetail } from "@/lib/query/hooks";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });

export function LeadSheet({
  leadId,
  onOpenChange,
}: {
  leadId: string | null;
  onOpenChange: (open: boolean) => void;
}) {
  const { data } = useLeadDetail(leadId);
  const [openEmail, setOpenEmail] = useState<EmailMessage | null>(null);

  return (
    <Sheet open={!!leadId} onOpenChange={onOpenChange}>
      <SheetContent>
        {data && (
          <>
            <SheetHeader>
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={data.lead.avatarUrl ?? undefined} alt="" />
                  <AvatarFallback>
                    {data.lead.firstName[0]}
                    {data.lead.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <SheetTitle>{fullName(data.lead)}</SheetTitle>
                  <SheetDescription>
                    {data.lead.position} · {data.company?.name}
                  </SheetDescription>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 pt-1 text-xs text-muted-foreground">
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
              </div>
              <div className="pt-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/dashboard/leads/${data.lead.id}`}>
                    <LayoutDashboard /> Voir dans le dashboard
                  </Link>
                </Button>
              </div>
            </SheetHeader>

            <Tabs defaultValue="interactions" className="mt-2">
              <TabsList>
                <TabsTrigger value="interactions">
                  <Activity className="mr-1.5 h-3.5 w-3.5" /> Interactions
                </TabsTrigger>
                <TabsTrigger value="sequence">
                  <CalendarClock className="mr-1.5 h-3.5 w-3.5" /> Séquence
                </TabsTrigger>
              </TabsList>

              <TabsContent value="interactions">
                <ol className="relative ml-2 border-l pl-6">
                  {data.interactions.map((it) => (
                    <li key={it.id} className="mb-5 last:mb-0">
                      <span className="absolute -left-[7px] flex h-3.5 w-3.5 items-center justify-center rounded-full border bg-background">
                        {it.type === "signal" ? (
                          <Radio className="h-2.5 w-2.5 text-primary" />
                        ) : (
                          <Mail className="h-2.5 w-2.5 text-muted-foreground" />
                        )}
                      </span>
                      <div className="text-xs text-muted-foreground">{fmt(it.date)}</div>
                      <div className="text-sm">{it.note}</div>
                    </li>
                  ))}
                </ol>
              </TabsContent>

              <TabsContent value="sequence">
                <div className="space-y-2">
                  {data.emails.map((em) => (
                    <button
                      key={em.id}
                      onClick={() => setOpenEmail(em)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-left transition-colors hover:bg-accent/40",
                        openEmail?.id === em.id && "ring-2 ring-primary",
                      )}
                    >
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">{em.subject}</div>
                        <div className="text-xs text-muted-foreground">{em.templateKey}</div>
                      </div>
                      <div className="shrink-0 text-xs font-medium text-primary">{fmt(em.sendDate)}</div>
                    </button>
                  ))}
                </div>

                {openEmail && (
                  <div className="mt-4 rounded-lg border bg-muted/20 p-4">
                    <div className="text-xs text-muted-foreground">
                      Envoi prévu le {fmt(openEmail.sendDate)}
                    </div>
                    <div className="mt-1 font-medium">{openEmail.subject}</div>
                    <pre className="mt-3 whitespace-pre-wrap font-sans text-sm leading-relaxed">
                      {openEmail.body}
                    </pre>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
