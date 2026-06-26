// TS mirror of the SQL points-valuation engine (RPC `suggest_points_per_night`).
// Source of truth stays the SQL function; this file MUST stay parity-identical to it.
// Kept free of the Supabase client so it can be unit-tested in isolation.

export const BASE = 50;
export const PER_BED = 12;
export const BED_CAP = 8;
export const AMENITY_UNIT = 3;
export const AMENITY_CAP = 30;
export const MIN_POINTS = 10;

/** Per-night multiplier by listing type. Unknown types fall back to 0.8. */
export const TYPE_MULT: Record<string, number> = {
  home_exchange: 1.0,
  immersion_stay: 0.8,
  hosted_stay: 0.7,
  private_room: 0.6,
  guest_room: 0.6,
};
export const TYPE_MULT_DEFAULT = 0.8;

/** Multiplier by the linked place's manual attractiveness tag. */
export const ATTRACTION_MULT: Record<string, number> = {
  standard: 1.0,
  near_site: 1.15,
  prime: 1.3,
};
export const ATTRACTION_MULT_DEFAULT = 1.0;

/** Round to the nearest multiple of 5. */
export function round5(n: number): number {
  return Math.round(n / 5) * 5;
}

export interface SuggestPointsInput {
  capacity: number | null | undefined;
  listingType: string | null | undefined;
  amenitiesCount: number | null | undefined;
  attractionLevel?: string | null | undefined;
}

/**
 * Suggested points/night for a listing — identical to the SQL formula:
 *   round5( (BASE + bedBonus + amenityBonus) * typeMult * attractionMult ), min 10.
 */
export function suggestPointsPerNight({
  capacity,
  listingType,
  amenitiesCount,
  attractionLevel,
}: SuggestPointsInput): number {
  const cap = Math.max(0, Math.floor(capacity ?? 0));
  const bedBonus = Math.max(Math.min(cap, BED_CAP) - 2, 0) * PER_BED;
  const amenities = Math.max(0, Math.floor(amenitiesCount ?? 0));
  const amenityBonus = Math.min(amenities * AMENITY_UNIT, AMENITY_CAP);

  const typeMult = TYPE_MULT[listingType ?? ""] ?? TYPE_MULT_DEFAULT;
  const attractionMult = ATTRACTION_MULT[attractionLevel ?? ""] ?? ATTRACTION_MULT_DEFAULT;

  const raw = (BASE + bedBonus + amenityBonus) * typeMult * attractionMult;
  return Math.max(round5(raw), MIN_POINTS);
}

export interface PriceBracket {
  min: number;
  max: number;
}

/** Host-adjustable bracket: ±30 % around the suggestion, rounded to multiples of 5. */
export function priceBracket(suggested: number): PriceBracket {
  return {
    min: Math.max(round5(suggested * 0.7), MIN_POINTS),
    max: round5(suggested * 1.3),
  };
}
