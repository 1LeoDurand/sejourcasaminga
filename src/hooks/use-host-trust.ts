import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TRUST_MIN_AVG, TRUST_MIN_REVIEWS } from "@/lib/badges";

export interface HostTrust {
  reviewCount: number;
  avgRating: number | null;
  trusted: boolean;
}

/**
 * Aggregates the approved, public stay reviews across all the places a host owns
 * to derive the "trusted host" badge (item 24). A host is trusted when they have
 * at least TRUST_MIN_REVIEWS rated reviews and an average ≥ TRUST_MIN_AVG.
 */
export function useHostTrust(placeIds: string[]) {
  const ids = [...new Set(placeIds.filter(Boolean))].sort();
  return useQuery({
    queryKey: ["host-trust", ids.join(",")],
    enabled: ids.length > 0,
    queryFn: async (): Promise<HostTrust> => {
      const { data, error } = await supabase
        .from("stay_reviews")
        .select("rating")
        .in("place_id", ids)
        .eq("approved_by_habitat", true)
        .eq("is_public", true);
      if (error) throw error;

      const rated = (data || []).filter(
        (r) => typeof r.rating === "number" && (r.rating as number) > 0,
      );
      const reviewCount = rated.length;
      const avgRating = reviewCount
        ? rated.reduce((sum, r) => sum + (r.rating as number), 0) / reviewCount
        : null;
      const trusted = reviewCount >= TRUST_MIN_REVIEWS && (avgRating ?? 0) >= TRUST_MIN_AVG;

      return { reviewCount, avgRating, trusted };
    },
  });
}
