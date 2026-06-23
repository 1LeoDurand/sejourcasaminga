import { describe, it, expect } from "vitest";
import { stayPointsCost, stayPointsErrorMessage } from "@/lib/stay-points";

describe("stayPointsCost", () => {
  it("multiplies nights by the per-night price", () => {
    expect(stayPointsCost("2026-07-01", "2026-07-04", 10)).toBe(30); // 3 nights
  });

  it("charges at least one night for same-day dates", () => {
    expect(stayPointsCost("2026-07-01", "2026-07-01", 10)).toBe(10);
  });

  it("returns 0 when the per-night price is missing", () => {
    expect(stayPointsCost("2026-07-01", "2026-07-04", null)).toBe(0);
    expect(stayPointsCost("2026-07-01", "2026-07-04", undefined)).toBe(0);
  });

  it("returns 0 for invalid dates rather than NaN", () => {
    expect(stayPointsCost("not-a-date", "2026-07-04", 10)).toBe(0);
  });

  it("accepts Date objects", () => {
    expect(stayPointsCost(new Date("2026-07-01"), new Date("2026-07-06"), 5)).toBe(25); // 5 nights
  });
});

describe("stayPointsErrorMessage", () => {
  it("maps the insufficient-points code to a human message", () => {
    expect(stayPointsErrorMessage({ message: "INSUFFICIENT_POINTS" })).toMatch(/insuffisant/i);
  });

  it("maps the not-authorized code", () => {
    expect(stayPointsErrorMessage({ message: "NOT_AUTHORIZED" })).toMatch(/autoris/i);
  });

  it("falls back to a generic message when empty", () => {
    expect(stayPointsErrorMessage({})).toBe("Une erreur est survenue.");
  });
});
