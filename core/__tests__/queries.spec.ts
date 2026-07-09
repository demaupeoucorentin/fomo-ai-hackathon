import { describe } from "vitest";
import { test, expect } from "./fixtures/test";
import { aCompanyRecord, aLeadRecord, aSignalRecord } from "./builders/signal-record.builder";
import { GetAllLeads, GetHomeStats } from "../use-cases/queries";
import { RunPipeline } from "../use-cases/run-pipeline";
import { fullName } from "../domain/entities";

const acme = aCompanyRecord().withName("Acme").withDomain("acme.com").build();
const jane = aLeadRecord().withId("L1").withName("Jane", "Doe").atCompany(acme).withoutContact().build();
const bob = aLeadRecord().withId("L2").withName("Bob", "Ray").atCompany(acme).withEmail("bob@acme.com").build();

// jane: 1 signal, no contact (gets enriched). bob: 2 distinct signals.
const seed = [
  aSignalRecord().forLead(jane).ofType("competitor_activity").on("2026-07-01T00:00:00.000Z").build(),
  aSignalRecord().forLead(bob).ofType("deep_search").on("2026-07-02T00:00:00.000Z").build(),
  aSignalRecord().forLead(bob).ofType("job_posting").on("2026-07-03T00:00:00.000Z").build(),
];

describe("GetAllLeads / GetHomeStats", () => {
  const t = test.extend({ seed });

  t("GetAllLeads shapes every lead with signals, batch name and email cadence", async ({ ports }) => {
    await ports.runs.create({
      id: "run-1",
      name: "Batch Alpha",
      status: "pending",
      signalRequestId: null,
      createdAt: "2026-07-09T00:00:00.000Z",
    });
    await new RunPipeline(ports).execute("run-1", []);

    const items = await new GetAllLeads(ports).execute();
    expect(items).toHaveLength(2);

    const bobItem = items.find((i) => i.lead.sillageLeadId === "L2")!;
    expect(bobItem.agentTypes.sort()).toEqual(["deep_search", "job_posting"]);
    expect(bobItem.runName).toBe("Batch Alpha");
    expect(bobItem.emailCount).toBe(3); // J+0 / J+7 / J+14
    expect(bobItem.nextSendDate).not.toBeNull();
    expect(fullName(bobItem.lead)).toBe("Bob Ray");
  });

  t("GetHomeStats aggregates counts and signals-by-type", async ({ ports }) => {
    await ports.runs.create({
      id: "run-1",
      name: "Batch Alpha",
      status: "pending",
      signalRequestId: null,
      createdAt: "2026-07-09T00:00:00.000Z",
    });
    await new RunPipeline(ports).execute("run-1", []);

    const stats = await new GetHomeStats(ports).execute();
    expect(stats.sequences).toBe(1);
    expect(stats.leads).toBe(2);
    expect(stats.emailsScheduled).toBe(6); // 2 leads x 3 touches
    expect(stats.emailsSent).toBe(0);
    expect(stats.contactsFound).toBe(2); // jane enriched + bob provided
    expect(stats.signalsByType).toHaveLength(3);
    expect(stats.signalsByType.reduce((n, s) => n + s.count, 0)).toBe(3);
  });
});
