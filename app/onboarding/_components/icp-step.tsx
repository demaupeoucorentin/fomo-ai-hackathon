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
  { key: "jobTitle", label: "Intitulés de poste" },
  { key: "seniority", label: "Séniorité" },
  { key: "industry", label: "Industries" },
  { key: "location", label: "Zones" },
  { key: "headcount", label: "Effectifs" },
];

function IcpSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Loader2 className="h-4 w-4 animate-spin text-primary" /> On prépare ton client idéal…
        </CardTitle>
        <CardDescription>On lit ton site et on en déduit ton profil de client idéal.</CardDescription>
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
        notify("ICP validé ✓", "success");
        onNext();
      },
    });

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-28">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Définis ton client idéal</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Colle l&apos;adresse de ton site, l&apos;IA en déduit ton profil de client idéal.
        </p>
      </div>

      <Card>
        <CardContent className="flex gap-2 p-4">
          <div className="relative flex-1">
            <Globe className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="https://ton-entreprise.com"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && website && run()}
            />
          </div>
          <Button onClick={run} disabled={!website || generate.isPending}>
            {generate.isPending ? <Loader2 className="animate-spin" /> : <Sparkles />}
            Analyser
          </Button>
        </CardContent>
      </Card>

      {generate.isPending && !persona && <IcpSkeleton />}

      {persona && (
        <Card>
          <CardHeader>
            <CardTitle>Ton client idéal</CardTitle>
            <CardDescription>Ajuste si besoin — chaque champ est une liste séparée par des virgules.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {FIELDS.map((f) => (
              <div key={f.key} className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">{f.label}</label>
                <Input
                  value={(persona[f.key] as string[]).join(", ")}
                  onChange={(e) => setField(f.key, e.target.value)}
                />
              </div>
            ))}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Contexte</label>
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
            Valider et continuer
            <ArrowRight />
          </Button>
        </div>
      )}
    </div>
  );
}
