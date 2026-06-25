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

describe("stayPointsCost — edge cases", () => {
  it("floors inverted dates (end before start) to a single night", () => {
    expect(stayPointsCost("2026-07-10", "2026-07-01", 10)).toBe(10);
  });

  it("returns 0 when the per-night price is exactly zero", () => {
    expect(stayPointsCost("2026-07-01", "2026-07-05", 0)).toBe(0);
  });

  it("rounds partial days up to the next night", () => {
    // 1.5 days → 2 nights
    expect(stayPointsCost("2026-07-01T00:00:00Z", "2026-07-02T12:00:00Z", 10)).toBe(20);
  });

  it("scales with long stays (30 nights)", () => {
    expect(stayPointsCost("2026-07-01", "2026-07-31", 10)).toBe(300);
  });

  it("returns 0 when both dates are invalid", () => {
    expect(stayPointsCost("nope", "nope", 10)).toBe(0);
  });
});

describe("stayPointsErrorMessage — remaining codes", () => {
  it("maps NOT_PENDING", () => {
    expect(stayPointsErrorMessage({ message: "NOT_PENDING" })).toMatch(/attente/i);
  });

  it("maps NOT_ACCEPTED", () => {
    expect(stayPointsErrorMessage({ message: "NOT_ACCEPTED" })).toMatch(/confirm/i);
  });

  it("maps DATES_UNAVAILABLE", () => {
    expect(stayPointsErrorMessage({ message: "DATES_UNAVAILABLE" })).toMatch(/chevauch/i);
  });

  it("maps protected/guard codes to a safe message", () => {
    expect(stayPointsErrorMessage({ message: "ACCEPT_VIA_RPC_ONLY" })).toMatch(/non autoris/i);
    expect(stayPointsErrorMessage({ message: "PROTECTED_FIELD" })).toMatch(/non autoris/i);
  });

  it("passes an unknown message through verbatim", () => {
    expect(stayPointsErrorMessage({ message: "Boom" })).toBe("Boom");
  });
});
