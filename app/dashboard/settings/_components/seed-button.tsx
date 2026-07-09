"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Database, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { notify } from "@/lib/notify";

export function SeedButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const seed = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/seed", { method: "POST" });
      if (!r.ok) throw new Error(`Seed failed (${r.status})`);
      notify("Demo data loaded", "success");
      router.refresh();
    } catch (e) {
      notify(e instanceof Error ? e.message : "Seed error", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={seed} disabled={loading} variant="outline" size="sm">
      {loading ? <Loader2 className="animate-spin" /> : <Database />}
      Load demo data
    </Button>
  );
}
