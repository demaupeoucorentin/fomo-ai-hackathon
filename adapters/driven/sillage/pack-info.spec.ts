import { describe, expect, it } from "vitest";
import { packInfo, unpackInfo } from "./sillage";

describe("trackingKeywords round-trip in additional_info", () => {
  it("packs then unpacks keywords and info unchanged", () => {
    const packed = packInfo("Padel business club.", ["padel", '"business club"']);
    expect(unpackInfo(packed ?? null)).toEqual({
      info: "Padel business club.",
      keywords: ["padel", '"business club"'],
    });
  });

  it("no keywords → info untouched, none parsed", () => {
    expect(packInfo("Just info.", [])).toBe("Just info.");
    expect(unpackInfo("Just info.")).toEqual({ info: "Just info.", keywords: [] });
    expect(unpackInfo(null)).toEqual({ info: null, keywords: [] });
  });

  it("keywords without info", () => {
    const packed = packInfo(null, ["outbound"]);
    expect(unpackInfo(packed ?? null)).toEqual({ info: null, keywords: ["outbound"] });
  });
});
