"use client";
import { useState } from "react";
import { Sparkles, ArrowRight, Loader2, Globe } from "lucide-react";
import type { Persona } from "@/core/domain/entities";
import { useGenerateIcp, useSavePersona } from "@/lib/query/hooks";
import { notify } from "@/lib/notify";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const FIELDS: { key: keyof Persona; label: string }[] = [
  { key: "jobTitle", label: "Job titles" },
  { key: "seniority", label: "Seniority" },
  { key: "industry", label: "Industries" },
  { key: "location", label: "Regions" },
  { key: "headcount", label: "Headcount" },
  { key: "trackingKeywords", label: "Tracking keywords" },
];

function IcpSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Loader2 className="h-4 w-4 animate-spin text-primary" /> Preparing your ideal customer…
        </CardTitle>
        <CardDescription>We read your site and infer your ideal customer profile.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {FIELDS.map((f) => (
          <div key={f.key} className="space-y-1.5">
            <div className="h-3 w-24 rounded bg-muted" />
            <div className="h-9 w-full animate-pulse rounded-md bg-muted/60" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function IcpStep({ onNext }: { onNext: () => void }) {
  const [website, setWebsite] = useState("");
  const [persona, setPersona] = useState<Persona | null>(null);
  const generate = useGenerateIcp();
  const save = useSavePersona();

  const run = () =>
    generate.mutate(website, { onSuccess: ({ persona }) => setPersona(persona) });

  const setField = (key: keyof Persona, value: string) =>
    setPersona((p) =>
      p ? { ...p, [key]: value.split(",").map((s) => s.trim()).filter(Boolean) } : p,
    );

  const validate = () =>
    persona &&
    save.mutate(persona, {
      onSuccess: () => {
        notify("ICP saved ✓", "success");
        onNext();
      },
    });

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-28">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Define your ideal customer</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Paste your website address, the AI infers your ideal customer profile.
        </p>
      </div>

      <Card>
        <CardContent className="flex gap-2 p-4">
          <div className="relative flex-1">
            <Globe className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="https://your-company.com"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && website && run()}
            />
          </div>
          <Button onClick={run} disabled={!website || generate.isPending}>
            {generate.isPending ? <Loader2 className="animate-spin" /> : <Sparkles />}
            Analyze
          </Button>
        </CardContent>
      </Card>

      {generate.isPending && !persona && <IcpSkeleton />}

      {persona && (
        <Card>
          <CardHeader>
            <CardTitle>Your ideal customer</CardTitle>
            <CardDescription>Adjust if needed — each field is a comma-separated list.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {FIELDS.map((f) => (
              <div key={f.key} className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">{f.label}</label>
                <Input
                  value={((persona[f.key] as string[] | undefined) ?? []).join(", ")}
                  onChange={(e) => setField(f.key, e.target.value)}
                />
              </div>
            ))}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Context</label>
              <Input
                value={persona.additionalInfo ?? ""}
                onChange={(e) => setPersona((p) => (p ? { ...p, additionalInfo: e.target.value } : p))}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {persona && (
        <div className="sticky bottom-4 z-10">
          <Button
            size="lg"
            className="w-full shadow-[var(--shadow)]"
            onClick={validate}
            disabled={save.isPending}
          >
            {save.isPending ? <Loader2 className="animate-spin" /> : null}
            Save and continue
            <ArrowRight />
          </Button>
        </div>
      )}
    </div>
  );
}
