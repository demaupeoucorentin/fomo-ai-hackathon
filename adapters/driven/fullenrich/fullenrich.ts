// FullEnrich adapter — bulk async enrichment.
// POST /contact/enrich/bulk -> enrichment_id ; GET .../{id} until FINISHED.
import type {
  ContactEnricherPort,
  EnrichInput,
  EnrichResult,
  ProgressFn,
} from "../../../core/ports/driven";

const BASE = "https://app.fullenrich.com/api/v2";
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function key() {
  const k = process.env.FULLENRICH_API_KEY;
  if (!k) throw new Error("FULLENRICH_API_KEY manquant");
  return k;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export class FullEnrichContactEnricher implements ContactEnricherPort {
  async enrich(contacts: EnrichInput[], onProgress?: ProgressFn) {
    if (contacts.length === 0) return {};
    onProgress?.(`Lancement de l'enrichissement (${contacts.length})…`);
    const start = await fetch(`${BASE}/contact/enrich/bulk`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key()}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        name: `run-${Date.now()}`,
        data: contacts.map((c) => ({
          first_name: c.firstName,
          last_name: c.lastName,
          domain: c.domain,
          company_name: c.companyName,
          linkedin_url: c.linkedinUrl,
          enrich_fields: ["contact.work_emails", "contact.phones"],
          custom: { key: c.key },
        })),
      }),
    });
    if (!start.ok) throw new Error(`FullEnrich start → ${start.status}`);
    const { enrichment_id } = (await start.json()) as { enrichment_id: string };

    for (let i = 0; i < 40; i++) {
      onProgress?.("Recherche email + téléphone…");
      const res = await fetch(`${BASE}/contact/enrich/bulk/${enrichment_id}`, {
        headers: { Authorization: `Bearer ${key()}` },
      });
      if (res.ok) {
        const body = (await res.json()) as any;
        if (body?.status === "FINISHED") return mapResults(body);
      }
      await sleep(3000);
    }
    return {}; // timed out — leads stay not_found
  }
}

function mapResults(body: any): Record<string, EnrichResult> {
  const out: Record<string, EnrichResult> = {};
  for (const item of body?.data ?? []) {
    const k = item?.custom?.key;
    if (!k) continue;
    const ci = item?.contact_info ?? {};
    out[k] = {
      email: ci?.most_probable_work_email?.email ?? ci?.work_emails?.[0]?.email ?? null,
      phone: ci?.most_probable_phone?.number ?? ci?.phones?.[0]?.number ?? null,
    };
  }
  return out;
}
