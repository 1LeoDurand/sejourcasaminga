import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface HostReview {
  id: string;
  created_at: string;
  host_user_id: string;
  guest_user_id: string;
  stay_request_id: string | null;
  rating: number | null;
  text: string | null;
  communication_rating: number | null;
  respect_rating: number | null;
  is_public: boolean;
  host?: { display_name: string | null; avatar_url: string | null } | null;
}

/** Avis reçus par un voyageur (affichés sur son profil public) */
export function useGuestHostReviews(guestUserId: string | undefined) {
  return useQuery({
    queryKey: ["host-reviews-guest", guestUserId],
    enabled: !!guestUserId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("host_reviews" as any)
        .select("*, profiles:host_user_id(display_name, avatar_url)")
        .eq("guest_user_id", guestUserId!)
        .eq("is_public", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return ((data || []) as any[]).map((r) => ({ ...r, host: r.profiles })) as HostReview[];
    },
  });
}

/** Avis laissés par un hôte */
export function useMyHostReviews(hostUserId: string | undefined) {
  return useQuery({
    queryKey: ["host-reviews-mine", hostUserId],
    enabled: !!hostUserId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("host_reviews" as any)
        .select("*")
        .eq("host_user_id", hostUserId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as HostReview[];
    },
  });
}

export interface CreateHostReviewInput {
  host_user_id: string;
  guest_user_id: string;
  stay_request_id?: string | null;
  rating: number | null;
  text: string;
  communication_rating?: number | null;
  respect_rating?: number | null;
  is_public?: boolean;
}

export function useCreateHostReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateHostReviewInput) => {
      const { data, error } = await supabase
        .from("host_reviews" as any)
        .insert(input)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["host-reviews-guest", variables.guest_user_id] });
      qc.invalidateQueries({ queryKey: ["host-reviews-mine", variables.host_user_id] });
    },
  });
}
