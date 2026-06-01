import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type StayReview = Tables<"stay_reviews"> & {
  author?: { display_name: string | null; avatar_url: string | null } | null;
};

export function useStayReviews(placeId: string | undefined, limit = 5) {
  return useQuery({
    queryKey: ["stay-reviews", placeId, limit],
    enabled: !!placeId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stay_reviews")
        .select(`*, profiles:user_id(display_name, avatar_url)`)
        .eq("place_id", placeId!)
        .eq("approved_by_habitat", true)
        .eq("is_public", true)
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data || []).map((r: any) => ({ ...r, author: r.profiles })) as StayReview[];
    },
  });
}

export function usePendingStayReviews(placeId: string | undefined) {
  return useQuery({
    queryKey: ["stay-reviews-pending", placeId],
    enabled: !!placeId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stay_reviews")
        .select(`*, profiles:user_id(display_name, avatar_url)`)
        .eq("place_id", placeId!)
        .eq("approved_by_habitat", false)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []).map((r: any) => ({ ...r, author: r.profiles })) as StayReview[];
    },
  });
}

export function useMyStayReview(stayRequestId: string | undefined) {
  return useQuery({
    queryKey: ["stay-review-my", stayRequestId],
    enabled: !!stayRequestId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stay_reviews")
        .select("*")
        .eq("stay_request_id", stayRequestId!)
        .maybeSingle();
      if (error) throw error;
      return data as Tables<"stay_reviews"> | null;
    },
  });
}

export interface CreateStayReviewInput {
  user_id: string;
  place_id: string;
  listing_id?: string | null;
  stay_request_id?: string | null;
  photos_urls: string[];
  text: string;
  rating: number | null;
  is_public: boolean;
}

export function useCreateStayReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateStayReviewInput) => {
      const { data, error } = await supabase
        .from("stay_reviews")
        .insert(input)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["stay-reviews", data.place_id] });
      qc.invalidateQueries({ queryKey: ["stay-review-my"] });
    },
  });
}

export function useModerateStayReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, approve, note }: { id: string; approve: boolean; note?: string }) => {
      const { data, error } = await supabase
        .from("stay_reviews")
        .update({
          approved_by_habitat: approve,
          approved_at: approve ? new Date().toISOString() : null,
          moderation_note: note ?? null,
        })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["stay-reviews"] });
      qc.invalidateQueries({ queryKey: ["stay-reviews-pending"] });
    },
  });
}
