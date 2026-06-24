// Pure helpers for the points redemption flow (item [5]). Kept free of the
// Supabase client so they can be unit-tested in isolation.

/** Points cost of a stay: nights * the listing's per-night price (min one night). */
export function stayPointsCost(
  startDate: string | Date,
  endDate: string | Date,
  pointsPerNight: number | null | undefined,
): number {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  if (Number.isNaN(start) || Number.isNaN(end)) return 0;
  const nights = Math.max(Math.ceil((end - start) / (1000 * 60 * 60 * 24)), 1);
  return nights * (pointsPerNight ?? 0);
}

/** Human-readable error for the points redemption RPCs (codes raised in SQL). */
export function stayPointsErrorMessage(error: unknown): string {
  const msg = (error as { message?: string })?.message ?? "";
  if (msg.includes("INSUFFICIENT_POINTS")) return "Solde de points insuffisant pour ce séjour.";
  if (msg.includes("NOT_AUTHORIZED")) return "Vous n'êtes pas autorisé à effectuer cette action.";
  if (msg.includes("NOT_PENDING")) return "Cette demande n'est plus en attente.";
  if (msg.includes("NOT_ACCEPTED")) return "Cette demande n'est pas confirmée.";
  if (msg.includes("DATES_UNAVAILABLE")) return "Ces dates chevauchent un séjour déjà accepté pour ce logement.";
  // Defensive: these codes should never surface in normal usage (guard trigger / bypass check).
  if (msg.includes("ACCEPT_VIA_RPC_ONLY")) return "Action non autorisée.";
  if (msg.includes("PROTECTED_FIELD")) return "Action non autorisée.";
  return msg || "Une erreur est survenue.";
}
