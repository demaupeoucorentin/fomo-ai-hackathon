import { describe, it, expect } from "vitest";
import {
  normalizeHeadcount,
  normalizeSeniority,
} from "../domain/persona-vocab";

describe("normalizeSeniority", () => {
  it("maps free-text titles to Sillage enum values", () => {
    expect(normalizeSeniority(["Manager", "Director", "VP", "C-Level"])).toEqual([
      "manager",
      "director",
      "vp",
      "c_suite",
    ]);
  });
  it("drops values that have no enum equivalent", () => {
    expect(normalizeSeniority(["Ninja", "intern"])).toEqual(["intern"]);
  });
});

describe("normalizeHeadcount", () => {
  it("matches enum ranges regardless of commas", () => {
    expect(normalizeHeadcount(["201-500", "501-1000", "1,001-5,000"])).toEqual([
      "201-500",
      "501-1,000",
      "1,001-5,000",
    ]);
  });
  it("drops invalid ranges like 5000+", () => {
    expect(normalizeHeadcount(["5000+", "51-200"])).toEqual(["51-200"]);
  });
});
