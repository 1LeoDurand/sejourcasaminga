import { describe, it, expect } from "vitest";
import { rangesOverlap, findBlockingPeriods } from "@/lib/stay-availability";

describe("rangesOverlap", () => {
  it("returns true for a clear overlap (string dates)", () => {
    expect(rangesOverlap("2026-07-01", "2026-07-10", "2026-07-05", "2026-07-15")).toBe(true);
  });

  it("returns true when one range is fully inside the other", () => {
    expect(rangesOverlap("2026-07-01", "2026-07-20", "2026-07-05", "2026-07-10")).toBe(true);
  });

  it("returns false for non-overlapping ranges", () => {
    expect(rangesOverlap("2026-07-01", "2026-07-10", "2026-07-15", "2026-07-20")).toBe(false);
  });

  it("returns false when ranges are adjacent (check-out = check-in of next stay)", () => {
    // aEnd === bStart  → touching boundary only, no overlap
    expect(rangesOverlap("2026-07-01", "2026-07-10", "2026-07-10", "2026-07-15")).toBe(false);
  });

  it("returns false when adjacent the other way (bEnd === aStart)", () => {
    expect(rangesOverlap("2026-07-10", "2026-07-15", "2026-07-01", "2026-07-10")).toBe(false);
  });

  it("returns true for same start date", () => {
    expect(rangesOverlap("2026-07-01", "2026-07-05", "2026-07-01", "2026-07-10")).toBe(true);
  });

  it("accepts Date objects", () => {
    expect(rangesOverlap(new Date("2026-07-01"), new Date("2026-07-10"), new Date("2026-07-08"), new Date("2026-07-12"))).toBe(true);
  });

  it("returns false for invalid dates", () => {
    expect(rangesOverlap("", "2026-07-10", "2026-07-05", "2026-07-15")).toBe(false);
  });
});

describe("findBlockingPeriods", () => {
  const blocks = [
    { start_date: "2026-08-01", end_date: "2026-08-10", reason: "Travaux" },
    { start_date: "2026-08-20", end_date: "2026-08-25" },
    { start_date: "2026-09-01", end_date: "2026-09-05", reason: null },
  ];

  it("returns empty array when start is empty", () => {
    expect(findBlockingPeriods("", "2026-08-05", blocks)).toEqual([]);
  });

  it("returns empty array when end is empty", () => {
    expect(findBlockingPeriods("2026-08-01", "", blocks)).toEqual([]);
  });

  it("returns empty array when start and end are null/undefined", () => {
    expect(findBlockingPeriods(null, undefined, blocks)).toEqual([]);
  });

  it("returns empty array when no block overlaps", () => {
    expect(findBlockingPeriods("2026-08-11", "2026-08-19", blocks)).toEqual([]);
  });

  it("returns the one overlapping block", () => {
    const result = findBlockingPeriods("2026-08-05", "2026-08-15", blocks);
    expect(result).toHaveLength(1);
    expect(result[0].reason).toBe("Travaux");
  });

  it("returns multiple overlapping blocks", () => {
    const result = findBlockingPeriods("2026-08-05", "2026-08-22", blocks);
    expect(result).toHaveLength(2);
  });

  it("does not return an adjacent block (boundary touch = OK)", () => {
    // Request ends exactly when block starts
    expect(findBlockingPeriods("2026-07-25", "2026-08-01", blocks)).toEqual([]);
  });

  it("handles a block with no reason field", () => {
    const result = findBlockingPeriods("2026-08-19", "2026-08-21", blocks);
    expect(result).toHaveLength(1);
    expect(result[0].reason).toBeUndefined();
  });
});

describe("rangesOverlap — edge cases", () => {
  it("treats identical ranges as overlapping", () => {
    expect(rangesOverlap("2026-07-01", "2026-07-10", "2026-07-01", "2026-07-10")).toBe(true);
  });

  it("returns false when the second range's end is invalid", () => {
    expect(rangesOverlap("2026-07-01", "2026-07-10", "2026-07-05", "bad")).toBe(false);
  });

  it("detects a single-day overlap at the boundary edge", () => {
    // a ends 07-11, b starts 07-10 → one day of overlap
    expect(rangesOverlap("2026-07-05", "2026-07-11", "2026-07-10", "2026-07-20")).toBe(true);
  });
});

describe("findBlockingPeriods — edge cases", () => {
  const oneBlock = [{ start_date: "2026-08-01", end_date: "2026-08-10", reason: "Travaux" }];

  it("returns the block when the request fully contains it", () => {
    expect(findBlockingPeriods("2026-07-30", "2026-08-15", oneBlock)).toHaveLength(1);
  });

  it("returns [] when the end date is invalid", () => {
    expect(findBlockingPeriods("2026-08-01", "bad-date", oneBlock)).toEqual([]);
  });

  it("returns [] for an empty blocks list", () => {
    expect(findBlockingPeriods("2026-08-01", "2026-08-10", [])).toEqual([]);
  });
});
