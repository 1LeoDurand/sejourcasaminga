// Profile completion scoring shared between EditProfile and trust badges.
// 5 fields × 20% = 100%.

export type CompletionInput = {
  avatar_url?: string | null;
  bio?: string | null;
  preferred_values?: string[] | null;
  languages?: string[] | null;
  preferred_regions?: string[] | null;
};

export type CompletionField = "photo" | "bio" | "values" | "languages" | "regions";

export const COMPLETION_LABELS: Record<CompletionField, string> = {
  photo: "Photo de profil",
  bio: "Bio",
  values: "Valeurs sélectionnées",
  languages: "Langues parlées",
  regions: "Régions préférées",
};

export function computeCompletion(input: CompletionInput) {
  const checks: Record<CompletionField, boolean> = {
    photo: !!input.avatar_url,
    bio: !!(input.bio && input.bio.trim().length >= 20),
    values: (input.preferred_values?.length || 0) > 0,
    languages: (input.languages?.length || 0) > 0,
    regions: (input.preferred_regions?.length || 0) > 0,
  };
  const done = Object.values(checks).filter(Boolean).length;
  const pct = done * 20;
  return { pct, checks, done, total: 5 };
}

export function completionColor(pct: number) {
  if (pct >= 80) return "bg-emerald-500";
  if (pct >= 40) return "bg-amber-500";
  return "bg-rose-500";
}
