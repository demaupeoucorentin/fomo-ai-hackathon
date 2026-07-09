// Sillage adapters (SignalProvider + PersonaStore). Real endpoints per
// .context/attachments Sillage doc. Base URL from SILLAGE_API_BASE.
import type { AgentType, Persona } from "../../../core/domain/entities";
import { ProviderError } from "../../../core/domain/errors";
import { normalizePersona } from "../../../core/domain/persona-vocab";
import type {
  AccountInput,
  CompanyRecord,
  PersonaStorePort,
  ProgressFn,
  SignalProviderPort,
  SignalRecord,
} from "../../../core/ports/driven";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function cfg() {
  const base = process.env.SILLAGE_API_BASE?.replace(/\/$/, "");
  const key = process.env.SILLAGE_API_KEY;
  if (!base || !key) throw new Error("SILLAGE_API_BASE / SILLAGE_API_KEY manquants");
  return { base, key };
}

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const { base, key } = cfg();
  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const raw = await res.text().catch(() => "");
    throw new ProviderError(
      "sillage",
      res.status,
      formatSillageError(raw, res.status, init?.method ?? "GET", path),
      safeJson(raw),
    );
  }
  return (res.status === 204 ? undefined : await res.json()) as T;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function safeJson(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

// Turn a Sillage error body into one readable line (validation fields, error
// message, or title) so both logs and the UI explain the failure.
function formatSillageError(raw: string, status: number, method: string, path: string): string {
  const head = `Sillage ${status} ${method} ${path}`;
  const body = safeJson(raw) as any;
  if (body && typeof body === "object") {
    if (body.errors && typeof body.errors === "object") {
      const fields = Object.entries(body.errors)
        .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : String(v)}`)
        .join(" · ");
      return `${head} — ${body.title ?? "Invalid request"}: ${fields}`;
    }
    if (body.error?.message) return `${head} — ${body.error.message}`;
    if (body.title || body.message) return `${head} — ${body.title ?? body.message}`;
  }
  return `${head}${raw ? ` — ${raw.slice(0, 180)}` : ""}`;
}

const mapCompany = (c: any): CompanyRecord => ({
  sillageCompanyId: c?.company_id ?? c?.id ?? null,
  name: c?.name ?? c?.company?.name ?? "—",
  domain: c?.domain ?? c?.website_url ?? null,
  website: c?.website_url ?? (c?.domain ? `https://${c.domain}` : null),
  logoUrl: c?.logo_url ?? null,
  linkedin: c?.linkedin_url ?? null,
});

const mapSignal = (item: any): SignalRecord => {
  const lead = item?.lead ?? {};
  const co = lead?.current_company ?? {};
  return {
    signalType: item?.signal?.signal_type ?? "unknown",
    agentType: (item?.agent?.agent_type ?? "deep_search") as AgentType,
    signalDate: item?.signal?.signal_date ?? null,
    data: item?.signal?.data ?? null,
    lead: {
      sillageLeadId: lead?.id ?? null,
      firstName: lead?.first_name ?? "",
      lastName: lead?.last_name ?? "",
      position: lead?.position ?? null,
      linkedin: lead?.linkedin_url ?? null,
      avatarUrl: lead?.avatar_url ?? null,
      email: lead?.email ?? null,
      phone: lead?.phone_number ?? null,
      crm: lead?.hubspot || lead?.salesforce
        ? {
            hubspotContactId: lead?.hubspot?.contact_id ?? null,
            hubspotAccountId: lead?.hubspot?.account_id ?? null,
            salesforceContactId: lead?.salesforce?.contact_id ?? null,
            salesforceAccountId: lead?.salesforce?.account_id ?? null,
          }
        : null,
      company: {
        sillageCompanyId: null,
        name: co?.name ?? "—",
        domain: co?.website_url ? co.website_url.replace(/^https?:\/\//, "") : null,
        website: co?.website_url ?? null,
        logoUrl: co?.logo_url ?? null,
        linkedin: co?.linkedin_url ?? null,
      },
    },
  };
};

export class SillageSignalProvider implements SignalProviderPort {
  async importAccounts(accounts: AccountInput[], onProgress?: ProgressFn) {
    onProgress?.("Sending accounts to Sillage…");
    await call("/v2/top-account-list", {
      method: "POST",
      body: JSON.stringify({
        accounts: accounts.map((a) => ({ domain: a.domain, linkedin_url: a.linkedinUrl })),
      }),
    });
    // Poll ingestion status (bounded).
    for (let i = 0; i < 20; i++) {
      const st = await call<any>("/v2/top-account-list/status").catch(() => null);
      if (st?.state === "completed" || st?.ingestion_complete) break;
      onProgress?.("Ingesting accounts…");
      await sleep(1500);
    }
    const res = await call<any>("/v2/top-account-list/accounts");
    return (res?.data ?? []).map(mapCompany);
  }

  async detectSignals(opts?: { agentId?: number; onProgress?: ProgressFn }) {
    const onProgress = opts?.onProgress;
    // Launching a fresh detection run is best-effort: if it fails we still read
    // whatever signals already exist for the workspace.
    try {
      let agentId = opts?.agentId;
      if (!agentId) {
        const agents = await call<any>("/v2/agents");
        agentId = (agents?.data ?? agents ?? [])[0]?.id;
      }
      if (agentId) {
        onProgress?.("Starting detection…");
        const launched = await call<any>("/v2/workspace/signal-runs", {
          method: "POST",
          body: JSON.stringify({ agent_id: agentId }),
        });
        const ids: number[] = (launched ?? []).map((r: any) => r.signal_request_id).filter(Boolean);
        for (const id of ids) {
          for (let i = 0; i < 30; i++) {
            const st = await call<any>(`/v2/workspace/signal-runs/${id}`).catch(() => null);
            const stage = st?.stage;
            onProgress?.(stage ? `Detection: ${stage}` : "Detection in progress…");
            if (stage === "completed" || stage === "completed_partial" || stage === "failed") break;
            await sleep(2000);
          }
        }
      }
    } catch (e) {
      onProgress?.(
        `Detection run unavailable (${e instanceof Error ? e.message : "error"}) — reading existing signals`,
      );
    }
    onProgress?.("Fetching signals…");
    const res = await call<any>("/v1/workspace/signals?pageSize=100");
    return (res?.data ?? []).map(mapSignal);
  }
}

export class SillagePersonaStore implements PersonaStorePort {
  async get(): Promise<Persona | null> {
    const res = await call<any>("/v2/persona");
    const d = res?.data;
    if (!d) return null;
    return {
      jobTitle: d.job_title ?? [],
      excludeJobTitle: d.exclude_job_title ?? [],
      location: d.location ?? [],
      headcount: d.headcount ?? [],
      industry: d.industry ?? [],
      seniority: d.seniority ?? [],
      additionalInfo: d.additional_info ?? null,
    };
  }
  async upsert(input: Persona) {
    const p = normalizePersona(input); // coerce seniority/headcount to valid enums
    await call("/v2/persona", {
      method: "PUT",
      body: JSON.stringify({
        job_title: p.jobTitle,
        exclude_job_title: p.excludeJobTitle,
        location: p.location,
        headcount: p.headcount,
        industry: p.industry,
        seniority: p.seniority,
        additional_info: p.additionalInfo ?? undefined,
      }),
    });
  }
}
