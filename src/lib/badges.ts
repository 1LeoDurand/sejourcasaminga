// Pure, presentation-free badge logic. Kept JSX-free so it can be unit-tested
// and imported anywhere without pulling in React/icons.

export type TenureTier = "new" | "loyal" | "pillar";

const MS_PER_MONTH = 1000 * 60 * 60 * 24 * 30.44;

function monthsSince(iso: string): number {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return 0;
  return (Date.now() - then) / MS_PER_MONTH;
}

/**
 * Automatic tenure badge derived from the account age (item 29).
 * Always returns a tier when a valid creation date is provided, so every member
 * carries at least one badge.
 */
export function tenureTier(createdAt: string | null | undefined): TenureTier | null {
  if (!createdAt) return null;
  const months = monthsSince(createdAt);
  if (months >= 36) return "pillar"; // 3+ years
  if (months >= 12) return "loyal"; // 1+ year
  return "new";
}

// "Trusted host" badge thresholds (item 24): enough approved public stay
// reviews, with a strong average rating.
export const TRUST_MIN_REVIEWS = 3;
export const TRUST_MIN_AVG = 4.5;
