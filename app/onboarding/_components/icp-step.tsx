"use client";
import { useState } from "react";
import { Sparkles, ArrowRight, Loader2 } from "lucide-react";
import type { Persona } from "@/core/domain/entities";
import { useGenerateIcp, useSavePersona } from "@/lib/query/hooks";
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

  const validate = () => persona && save.mutate(persona, { onSuccess: onNext });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Définis ton ICP</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Donne le site de ton entreprise, l&apos;IA en déduit ton profil de client idéal.
        </p>
      </div>

      <Card>
        <CardContent className="flex gap-2 p-4">
          <Input
            placeholder="https://ton-entreprise.com"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && website && run()}
          />
          <Button onClick={run} disabled={!website || generate.isPending}>
            {generate.isPending ? <Loader2 className="animate-spin" /> : <Sparkles />}
            Générer
          </Button>
        </CardContent>
      </Card>

      {persona && (
        <Card>
          <CardHeader>
            <CardTitle>ICP proposé</CardTitle>
            <CardDescription>Ajuste puis valide. Chaque champ est une liste séparée par des virgules.</CardDescription>
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
            <div className="flex justify-end">
              <Button onClick={validate} disabled={save.isPending}>
                Valider l&apos;ICP <ArrowRight />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
