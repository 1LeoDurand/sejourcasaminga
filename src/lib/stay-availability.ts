// Pure helpers for calendar ↔ booking overlap detection (item [7]).
// No Supabase import — kept testable in isolation.

/**
 * Returns true if [aStart, aEnd) overlaps [bStart, bEnd) using a half-open
 * interval model: two stays that are adjacent at their boundary (check-out on
 * the same day as the next check-in) do NOT overlap.
 *
 * Accepts YYYY-MM-DD strings or Date objects.
 */
export function rangesOverlap(
  aStart: string | Date,
  aEnd: string | Date,
  bStart: string | Date,
  bEnd: string | Date,
): boolean {
  const aS = new Date(aStart).getTime();
  const aE = new Date(aEnd).getTime();
  const bS = new Date(bStart).getTime();
  const bE = new Date(bEnd).getTime();

  if (Number.isNaN(aS) || Number.isNaN(aE) || Number.isNaN(bS) || Number.isNaN(bE)) {
    return false;
  }

  // Half-open: aStart < bEnd AND aEnd > bStart
  return aS < bE && aE > bS;
}

export interface BlockPeriod {
  start_date: string;
  end_date: string;
  reason?: string | null;
}

/**
 * Returns the subset of `blocks` whose period overlaps [start, end).
 * Returns [] if start or end is empty/invalid.
 */
export function findBlockingPeriods(
  start: string | Date | undefined | null,
  end: string | Date | undefined | null,
  blocks: BlockPeriod[],
): BlockPeriod[] {
  if (!start || !end) return [];

  const sTime = new Date(start).getTime();
  const eTime = new Date(end).getTime();
  if (Number.isNaN(sTime) || Number.isNaN(eTime)) return [];

  return blocks.filter((b) => rangesOverlap(start, end, b.start_date, b.end_date));
}
