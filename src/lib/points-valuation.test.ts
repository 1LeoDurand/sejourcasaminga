import { describe, it, expect } from "vitest";
import { suggestPointsPerNight, priceBracket, round5 } from "./points-valuation";

describe("suggestPointsPerNight — parity with the SQL engine", () => {
  // Real re-tarification cases provided by the director (must match SQL output).
  it("home_exchange / cap 5 / 0 amenities / standard → 85", () => {
    expect(
      suggestPointsPerNight({
        capacity: 5,
        listingType: "home_exchange",
        amenitiesCount: 0,
        attractionLevel: "standard",
      }),
    ).toBe(85);
  });

  it("immersion_stay / cap 6 → 80", () => {
    expect(
      suggestPointsPerNight({ capacity: 6, listingType: "immersion_stay", amenitiesCount: 0 }),
    ).toBe(80);
  });

  it("immersion_stay / cap 4 → 60", () => {
    expect(
      suggestPointsPerNight({ capacity: 4, listingType: "immersion_stay", amenitiesCount: 0 }),
    ).toBe(60);
  });

  it("immersion_stay / cap 2 → 40", () => {
    expect(
      suggestPointsPerNight({ capacity: 2, listingType: "immersion_stay", amenitiesCount: 0 }),
    ).toBe(40);
  });

  it("hosted_stay / cap 2 → 35", () => {
    expect(
      suggestPointsPerNight({ capacity: 2, listingType: "hosted_stay", amenitiesCount: 0 }),
    ).toBe(35);
  });

  it("private_room / cap 2 → 30", () => {
    expect(
      suggestPointsPerNight({ capacity: 2, listingType: "private_room", amenitiesCount: 0 }),
    ).toBe(30);
  });
});

describe("suggestPointsPerNight — guards", () => {
  it("never goes below the floor of 10", () => {
    expect(suggestPointsPerNight({ capacity: 0, listingType: "private_room", amenitiesCount: 0 })).toBeGreaterThanOrEqual(10);
  });

  it("caps the bed bonus at 8 sleepers", () => {
    const cap8 = suggestPointsPerNight({ capacity: 8, listingType: "home_exchange", amenitiesCount: 0 });
    const cap20 = suggestPointsPerNight({ capacity: 20, listingType: "home_exchange", amenitiesCount: 0 });
    expect(cap20).toBe(cap8);
  });

  it("caps the amenity bonus at 30", () => {
    const many = suggestPointsPerNight({ capacity: 2, listingType: "home_exchange", amenitiesCount: 50 });
    const exactlyCap = suggestPointsPerNight({ capacity: 2, listingType: "home_exchange", amenitiesCount: 10 });
    expect(many).toBe(exactlyCap);
  });

  it("falls back to the default type multiplier (0.8) for unknown types", () => {
    expect(suggestPointsPerNight({ capacity: 6, listingType: "weird_type", amenitiesCount: 0 })).toBe(80);
  });

  it("applies the attraction multiplier", () => {
    const standard = suggestPointsPerNight({ capacity: 5, listingType: "home_exchange", amenitiesCount: 0, attractionLevel: "standard" });
    const prime = suggestPointsPerNight({ capacity: 5, listingType: "home_exchange", amenitiesCount: 0, attractionLevel: "prime" });
    expect(prime).toBeGreaterThan(standard);
    // (50 + 36) * 1.0 * 1.3 = 111.8 → round5 = 110
    expect(prime).toBe(110);
  });
});

describe("priceBracket — ±30 % around the suggestion", () => {
  it("brackets 60 to 40..80", () => {
    expect(priceBracket(60)).toEqual({ min: 40, max: 80 });
  });

  it("never lets the floor drop below 10", () => {
    expect(priceBracket(10).min).toBeGreaterThanOrEqual(10);
  });
});

describe("round5", () => {
  it("rounds to the nearest multiple of 5", () => {
    expect(round5(86)).toBe(85);
    expect(round5(78.4)).toBe(80);
    expect(round5(59.2)).toBe(60);
  });
});
