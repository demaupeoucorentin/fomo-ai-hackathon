import Link from "next/link";
import { container } from "@/adapters/composition/container";
import { PlanningCockpit } from "./_components/planning-cockpit";

export const dynamic = "force-dynamic";

export default async function PlanningPage() {
  const leads = await container.getAllLeads.execute();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Planification</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Chaque lead, la chaîne signal → email → date qu&apos;on planifie pour lui.
        </p>
      </div>

      {leads.length === 0 ? (
        <div className="rounded-xl border border-dashed py-16 text-center text-sm text-muted-foreground">
          Aucun lead pour l&apos;instant. Lance un{" "}
          <Link href="/onboarding" className="text-primary underline">
            onboarding
          </Link>{" "}
          ou charge des{" "}
          <Link href="/dashboard/settings" className="text-primary underline">
            données de démo
          </Link>
          .
        </div>
      ) : (
        <PlanningCockpit leads={leads} />
      )}
    </div>
  );
}
