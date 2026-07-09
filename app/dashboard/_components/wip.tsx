import { Construction } from "lucide-react";

export function Wip({ title, note }: { title: string; note?: string }) {
  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
      <div className="mt-6 flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-20 text-center">
        <Construction className="h-6 w-6 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{note ?? "Work in progress — étape 2."}</p>
      </div>
    </div>
  );
}
