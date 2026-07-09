import { describe, it, expect } from "vitest";
import { dedupLeads, topSignal } from "../services/dedup";
import { aLeadRecord, aSignalRecord } from "./builders/signal-record.builder";

describe("dedupLeads", () => {
  it("groups signals by the same Sillage lead id", () => {
    const lead = aLeadRecord().withId("L1").build();
    const groups = dedupLeads([
      aSignalRecord().forLead(lead).build(),
      aSignalRecord().forLead(lead).ofType("deep_search").build(),
    ]);
    expect(groups).toHaveLength(1);
    expect(groups[0].signals).toHaveLength(2);
  });

  it("keeps distinct leads separate", () => {
    const a = aLeadRecord().withId("A").withName("Ann", "A").build();
    const b = aLeadRecord().withId("B").withName("Bob", "B").build();
    const groups = dedupLeads([
      aSignalRecord().forLead(a).build(),
      aSignalRecord().forLead(b).build(),
    ]);
    expect(groups).toHaveLength(2);
  });

  it("falls back to name+company when there is no lead id", () => {
    const noId = aLeadRecord().withId(null).withName("No", "Id").build();
    const groups = dedupLeads([
      aSignalRecord().forLead(noId).build(),
      aSignalRecord().forLead(noId).build(),
    ]);
    expect(groups).toHaveLength(1);
  });
});

describe("topSignal", () => {
  it("returns the most recent signal by date", () => {
    const lead = aLeadRecord().build();
    const older = aSignalRecord().forLead(lead).on("2026-07-01T00:00:00.000Z").build();
    const newer = aSignalRecord().forLead(lead).ofType("deep_search").on("2026-07-08T00:00:00.000Z").build();
    expect(topSignal([older, newer])?.agentType).toBe("deep_search");
  });

  it("returns null for no signals", () => {
    expect(topSignal([])).toBeNull();
  });
});
