"use client";
import { useRef, useState } from "react";
import { Upload, Check, Building2, Loader2, Sparkles } from "lucide-react";
import type { AccountInput } from "@/core/ports/driven";
import { parseAccountsCsv } from "@/lib/csv";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const CRM_DEMO: AccountInput[] = [
  { name: "Acme Analytics", domain: "acme.com" },
  { name: "Northwind", domain: "northwind.io" },
  { name: "Globex", domain: "globex.com" },
];

export function ImportStep({
  onSubmit,
  pending,
}: {
  onSubmit: (accounts: AccountInput[]) => void;
  pending: boolean;
}) {
  const [accounts, setAccounts] = useState<AccountInput[]>([]);
  const [source, setSource] = useState<"crm" | "csv" | null>(null);
  const [crm, setCrm] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const connectCrm = (provider: string) => {
    setCrm(provider);
    setSource("crm");
    setAccounts(CRM_DEMO);
  };

  const onFile = async (file?: File) => {
    if (!file) return;
    const text = await file.text();
    setAccounts(parseAccountsCsv(text));
    setSource("csv");
    setCrm(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Importe tes comptes</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Synchronise ton CRM ou dépose un fichier de sociétés.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className={cn(source === "crm" && "ring-2 ring-primary")}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="h-4 w-4" /> Synchroniser un CRM
            </CardTitle>
            <CardDescription>Mock démo — on montre la connexion.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {["HubSpot", "Salesforce"].map((p) => (
              <Button
                key={p}
                variant={crm === p ? "default" : "outline"}
                onClick={() => connectCrm(p)}
                className="justify-between"
              >
                {p}
                {crm === p && <Check className="h-4 w-4" />}
              </Button>
            ))}
            {crm && (
              <p className="text-xs text-emerald-600">
                Connecté à {crm} — {CRM_DEMO.length} comptes importés.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className={cn(source === "csv" && "ring-2 ring-primary")}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Upload className="h-4 w-4" /> Déposer un CSV / Excel
            </CardTitle>
            <CardDescription>Colonnes : name, domain/website, linkedin.</CardDescription>
          </CardHeader>
          <CardContent>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => onFile(e.target.files?.[0])}
            />
            <button
              onClick={() => fileRef.current?.click()}
              className="flex h-24 w-full flex-col items-center justify-center gap-1 rounded-lg border border-dashed text-sm text-muted-foreground transition-colors hover:bg-accent"
            >
              <Upload className="h-5 w-5" />
              Choisir un fichier
            </button>
            {source === "csv" && (
              <p className="mt-2 text-xs text-emerald-600">{accounts.length} sociétés détectées.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {accounts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{accounts.length} comptes prêts</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {accounts.slice(0, 12).map((a, i) => (
              <span key={i} className="rounded-md border bg-muted/50 px-2.5 py-1 text-xs">
                {a.name ?? a.domain}
              </span>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end">
        <Button size="lg" disabled={accounts.length === 0 || pending} onClick={() => onSubmit(accounts)}>
          {pending ? <Loader2 className="animate-spin" /> : <Sparkles />}
          Générer les leads & emails
        </Button>
      </div>
    </div>
  );
}
