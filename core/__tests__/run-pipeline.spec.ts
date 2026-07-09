import { describe } from "vitest";
import { test, expect } from "./fixtures/test";
import { aLeadRecord, aSignalRecord } from "./builders/signal-record.builder";

const jane = aLeadRecord().withId("L1").withName("Jane", "Doe").withoutContact().build();
const twoSignalsSameLead = [
  aSignalRecord().forLead(jane).ofType("competitor_activity").on("2026-07-01T00:00:00.000Z").build(),
  aSignalRecord().forLead(jane).ofType("deep_search").on("2026-07-05T00:00:00.000Z").build(),
];

describe("RunPipeline", () => {
  const t = test.extend({ seed: twoSignalsSameLead });

  t("dedups signals into one lead and persists its signals", async ({ ports, runPipeline }) => {
    await runPipeline.execute("run-1", []);
    expect(ports.leads.items).toHaveLength(1);
    expect(ports.signals.items).toHaveLength(2);
    expect(ports.companies.items).toHaveLength(1);
  });

  t("enriches leads that arrive without contact", async ({ ports, runPipeline }) => {
    await runPipeline.execute("run-1", []);
    const lead = ports.leads.items[0];
    expect(lead.email).toBe("jane.doe@acme.com");
    expect(lead.phone).toBe("+33100000000");
    expect(lead.enrichStatus).toBe("enriched");
    expect(ports.contactEnricher.calls).toHaveLength(1);
  });

  t("schedules a 3-touch sequence at J+0 / J+7 / J+14", async ({ ports, runPipeline }) => {
    await runPipeline.execute("run-1", []);
    const emails = ports.emails.items;
    expect(emails).toHaveLength(3);
    expect(emails.map((e) => e.sendDate)).toEqual([
      "2026-07-09T00:00:00.000Z",
      "2026-07-16T00:00:00.000Z",
      "2026-07-23T00:00:00.000Z",
    ]);
  });

  t("picks the opener template from the most recent signal (deep_search)", async ({ ports, runPipeline }) => {
    await runPipeline.execute("run-1", []);
    expect(ports.emails.items[0].templateKey).toBe("growth_signal");
    expect(ports.emails.items[1].templateKey).toBe("follow_up");
    expect(ports.emails.items[2].templateKey).toBe("breakup");
  });

  t("records signal + email interactions and completes the run", async ({ ports, runPipeline }) => {
    await runPipeline.execute("run-1", []);
    const kinds = ports.interactions.items.map((i) => i.type).sort();
    expect(kinds).toEqual(["email", "email", "email", "signal"]);
    expect(ports.runs.items).toHaveLength(0); // run created elsewhere; status still set
    const logs = ports.stepLogs.items.map((l) => l.phase);
    expect(new Set(logs)).toEqual(new Set(["accounts", "signals", "enrich", "emails"]));
  });
});

describe("RunPipeline — leads that already have contact", () => {
  const withContact = aLeadRecord().withId("L2").withName("Max", "Roe").withEmail("max@acme.com").build();
  const t = test.extend({
    seed: [aSignalRecord().forLead(withContact).ofType("job_posting").build()],
  });

  t("skips enrichment when Sillage already provided contact", async ({ ports, runPipeline }) => {
    await runPipeline.execute("run-2", []);
    expect(ports.contactEnricher.calls).toHaveLength(0);
    expect(ports.leads.items[0].enrichStatus).toBe("provided");
    expect(ports.emails.items[0].templateKey).toBe("hiring");
  });
});
