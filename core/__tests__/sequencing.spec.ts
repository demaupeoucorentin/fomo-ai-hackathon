import { describe, it, expect } from "vitest";
import { buildSequence, buildSchedule } from "../services/sequencing";

describe("buildSequence", () => {
  it("opens with the angle matched to the signal, then follow-up and break-up", () => {
    const seq = buildSequence("deep_search");
    expect(seq.map((s) => s.template.key)).toEqual([
      "growth_signal",
      "follow_up",
      "breakup",
    ]);
    expect(seq.map((s) => s.cadenceDays)).toEqual([0, 7, 14]);
  });

  it("falls back to the default opener when there is no signal", () => {
    expect(buildSequence(null)[0].template.key).toBe("competitor_comparison");
  });
});

describe("buildSchedule", () => {
  it("maps cadence offsets to ISO dates from the run date", () => {
    const from = new Date("2026-07-09T00:00:00.000Z");
    const scheduled = buildSchedule(buildSequence("job_posting"), from);
    expect(scheduled.map((s) => s.sendDate)).toEqual([
      "2026-07-09T00:00:00.000Z",
      "2026-07-16T00:00:00.000Z",
      "2026-07-23T00:00:00.000Z",
    ]);
  });
});
