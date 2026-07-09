"use client";
import { useRef, useState } from "react";
import { Upload, Check, Loader2, Sparkles, FileSpreadsheet } from "lucide-react";
import type { AccountInput } from "@/core/ports/driven";
import { parseAccountsCsv } from "@/lib/csv";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  const [dragging, setDragging] = useState(false);
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
    <div className="mx-auto max-w-2xl space-y-6 pb-28">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Importe tes comptes</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Dépose la liste des entreprises que tu veux cibler.
        </p>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0])}
      />

      <div
        role="button"
        tabIndex={0}
        onClick={() => fileRef.current?.click()}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && fileRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          onFile(e.dataTransfer.files?.[0]);
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-12 text-center transition-colors",
          dragging ? "border-primary bg-accent/60" : "hover:border-primary/60 hover:bg-accent/30",
          source === "csv" && "border-emerald-300 bg-emerald-50/40",
        )}
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Upload className="h-6 w-6" />
        </span>
        <div>
          <div className="font-medium">Dépose ton fichier de sociétés</div>
          <div className="mt-0.5 text-sm text-muted-foreground">
            CSV ou Excel — glisse-le ici ou clique pour choisir
          </div>
        </div>
        {source === "csv" && (
          <p className="flex items-center gap-1.5 text-sm font-medium text-emerald-600">
            <Check className="h-4 w-4" /> {accounts.length} sociétés détectées
          </p>
        )}
      </div>

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <div className="h-px flex-1 bg-border" />
        ou
        <div className="h-px flex-1 bg-border" />
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <span className="text-sm text-muted-foreground">Synchronise ton CRM :</span>
        {["HubSpot", "Salesforce"].map((p) => (
          <Button
            key={p}
            variant={crm === p ? "default" : "outline"}
            size="sm"
            onClick={() => connectCrm(p)}
          >
            {crm === p && <Check className="h-4 w-4" />}
            {p}
          </Button>
        ))}
      </div>

      {accounts.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium">
              <FileSpreadsheet className="h-4 w-4 text-primary" />
              {accounts.length} comptes prêts
            </div>
            <div className="flex flex-wrap gap-2">
              {accounts.slice(0, 12).map((a, i) => (
                <span key={i} className="rounded-md border bg-muted/50 px-2.5 py-1 text-xs">
                  {a.name ?? a.domain}
                </span>
              ))}
              {accounts.length > 12 && (
                <span className="px-1 py-1 text-xs text-muted-foreground">
                  +{accounts.length - 12}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {accounts.length > 0 && (
        <div className="sticky bottom-4 z-10">
          <Button
            size="lg"
            className="w-full shadow-[var(--shadow)]"
            disabled={pending}
            onClick={() => onSubmit(accounts)}
          >
            {pending ? <Loader2 className="animate-spin" /> : <Sparkles />}
            Lancer la détection
          </Button>
        </div>
      )}
    </div>
  );
}
