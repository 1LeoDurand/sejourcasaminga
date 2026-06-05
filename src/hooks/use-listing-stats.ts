import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type ListingStats = {
  rating: number | null;
  review_count: number;
  next_start: string | null;
  next_end: string | null;
};

/**
 * Fetches aggregated card stats (rating, review count, next availability)
 * for ALL listings in a single request. React Query dedupes this query,
 * so every ListingCard on the page shares one network call.
 */
export function useListingCardStats() {
  return useQuery({
    queryKey: ["listing-card-stats"],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      // RPC isn't in the generated types yet → cast.
      const { data, error } = await (supabase.rpc as any)("get_listing_card_stats");
      if (error) throw error;
      const map: Record<string, ListingStats> = {};
      (data || []).forEach((row: any) => {
        map[row.listing_id] = {
          rating: row.rating != null ? Number(row.rating) : null,
          review_count: Number(row.review_count || 0),
          next_start: row.next_start ?? null,
          next_end: row.next_end ?? null,
        };
      });
      return map;
    },
  });
}
