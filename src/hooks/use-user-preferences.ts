import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const client = supabase as any;

export type UserPreferences = {
  id: string;
  user_id: string;
  preferred_habitat_types: string[];
  preferred_values: string[];
  preferred_regions: string[];
  desired_stay_duration: string | null;
  created_at: string;
  updated_at: string;
};

export const HABITAT_TYPE_OPTIONS = [
  "Écovillage",
  "Coliving",
  "Habitat participatif",
  "Oasis",
  "Lieu de vie",
  "Tiers-lieu",
  "Communauté spirituelle",
  "Ferme collective",
];

export const STAY_DURATION_OPTIONS = [
  { value: "weekend", label: "Un week-end" },
  { value: "week", label: "Une semaine" },
  { value: "two_weeks", label: "Deux semaines" },
  { value: "month_plus", label: "Un mois ou plus" },
];

export function useUserPreferences(userId: string | undefined) {
  return useQuery({
    queryKey: ["user-preferences", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await client
        .from("user_preferences")
        .select("*")
        .eq("user_id", userId!)
        .maybeSingle();
      if (error) throw error;
      return (data || null) as UserPreferences | null;
    },
  });
}

export function useUpsertUserPreferences() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      input: Pick<
        UserPreferences,
        "user_id" | "preferred_habitat_types" | "preferred_values" | "preferred_regions" | "desired_stay_duration"
      >
    ) => {
      const { data, error } = await client
        .from("user_preferences")
        .upsert(input, { onConflict: "user_id" })
        .select()
        .single();
      if (error) throw error;
      return data as UserPreferences;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["user-preferences", vars.user_id] });
      // Invalidate recs cache (in-memory)
      qc.invalidateQueries({ queryKey: ["smart-recommendations", vars.user_id] });
      // Clear localStorage TTL cache
      try {
        localStorage.removeItem(`recs_${vars.user_id}`);
      } catch {}
    },
  });
}
