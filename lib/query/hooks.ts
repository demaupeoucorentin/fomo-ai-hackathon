"use client";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { Persona } from "@/core/domain/entities";
import type {
  LeadDetailView,
  LeadListItem,
  RunStatusView,
} from "@/core/use-cases/dto";
import type { AccountInput } from "@/core/ports/driven";

// Extracts the structured `{ error: { message } }` our routes return.
async function parseOrThrow<T>(r: Response): Promise<T> {
  const data = await r.json().catch(() => null);
  if (!r.ok) {
    const msg = data?.error?.message ?? `Erreur ${r.status}`;
    throw new Error(msg);
  }
  return data as T;
}

async function getJSON<T>(url: string): Promise<T> {
  return parseOrThrow<T>(await fetch(url));
}
async function postJSON<T>(url: string, body: unknown, method = "POST"): Promise<T> {
  return parseOrThrow<T>(
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
}

export const useGenerateIcp = () =>
  useMutation({
    mutationFn: (website: string) =>
      postJSON<{ persona: Persona }>("/api/icp", { website }),
  });

export const useSavePersona = () =>
  useMutation({
    mutationFn: (persona: Persona) => postJSON("/api/icp", persona, "PUT"),
  });

export const useStartRun = () =>
  useMutation({
    mutationFn: (accounts: AccountInput[]) =>
      postJSON<{ runId: string; mode: Record<string, string> }>("/api/runs", { accounts }),
  });

// Isolated polling: refetches every 500ms until the run finishes.
export const useRunStatus = (runId: string | null) =>
  useQuery({
    queryKey: ["run", runId],
    enabled: !!runId,
    queryFn: () => getJSON<RunStatusView>(`/api/runs/${runId}`),
    refetchInterval: (q) => {
      const status = q.state.data?.run.status;
      return status === "done" || status === "error" ? false : 500;
    },
  });

export const useLeads = (runId: string | null) =>
  useQuery({
    queryKey: ["leads", runId],
    enabled: !!runId,
    queryFn: () => getJSON<{ leads: LeadListItem[] }>(`/api/leads?runId=${runId}`),
  });

export const useLeadDetail = (leadId: string | null) =>
  useQuery({
    queryKey: ["lead", leadId],
    enabled: !!leadId,
    queryFn: () => getJSON<LeadDetailView>(`/api/leads/${leadId}`),
  });
