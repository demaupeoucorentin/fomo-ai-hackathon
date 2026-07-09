import Link from "next/link";
import { notFound } from "next/navigation";
import { container } from "@/adapters/composition/container";
import { NotFoundError } from "@/core/domain/errors";

export const dynamic = "force-dynamic";

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let data;
  try {
    data = await container.getLeadDetail.execute(id);
  } catch (e) {
    if (e instanceof NotFoundError) notFound();
    throw e;
  }

  return (
    <div className="max-w-3xl space-y-6">
      <Link href="/dashboard/leads" className="text-sm text-muted-foreground hover:underline">
        ← Leads
      </Link>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {data.lead.firstName} {data.lead.lastName}
        </h1>
        <p className="text-sm text-muted-foreground">
          {data.lead.position} · {data.company?.name} · {data.lead.email ?? "—"} · {data.lead.phone ?? "—"}
        </p>
      </div>

      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Séquence d&apos;emails
        </h2>
        <div className="space-y-3">
          {data.emails.map((em) => (
            <div key={em.id} className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div className="font-medium">{em.subject}</div>
                <div className="text-xs text-primary">{fmt(em.sendDate)}</div>
              </div>
              <div className="text-xs text-muted-foreground">{em.templateKey}</div>
              <pre className="mt-3 whitespace-pre-wrap font-sans text-sm leading-relaxed">{em.body}</pre>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
