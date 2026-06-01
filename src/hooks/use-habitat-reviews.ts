import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Review = Tables<"reviews"> & {
  author?: {
    display_name: string | null;
    avatar_url: string | null;
  } | null;
};

export function useHabitatReviews(placeId: string | undefined, limit = 5) {
  return useQuery({
    queryKey: ["habitat-reviews", placeId, limit],
    enabled: !!placeId,
    queryFn: async () => {
      if (!placeId) return [] as Review[];

      // Get listing IDs for this place
      const { data: listingsData, error: listingsError } = await supabase
        .from("listings")
        .select("id")
        .eq("place_id", placeId)
        .eq("published", true);

      if (listingsError) throw listingsError;
      const listingIds = (listingsData || []).map((l) => l.id);
      if (listingIds.length === 0) return [] as Review[];

      // Get reviews for those listings, with author profile
      const { data, error } = await supabase
        .from("reviews")
        .select(
          `*,
          profiles:author_user_id(display_name, avatar_url)`
        )
        .in("listing_id", listingIds)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data || []).map((r: any) => ({
        ...r,
        author: r.profiles,
      })) as Review[];
    },
  });
}
