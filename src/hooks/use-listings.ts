import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

export type Listing = Tables<"listings">;

export function useListings() {
  return useQuery({
    queryKey: ["listings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("listings")
        .select("*, places(*)")
        .eq("published", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useListing(id: string | undefined) {
  return useQuery({
    queryKey: ["listing", id],
    enabled: !!id,
    queryFn: async () => {
      // Support both UUID and slug: UUID contains hyphens in UUID v4 format
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id!);
      const query = supabase.from("listings").select("*, places(*)");
      const { data, error } = await (isUuid ? query.eq("id", id!) : query.eq("slug", id!)).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

/** Generate a SEO-friendly URL for a listing */
export function listingUrl(id: string, slug?: string | null): string {
  return slug ? `/listing/${slug}` : `/listing/${id}`;
}

/** Generate a SEO-friendly URL for a place/habitat */
export function habitatUrl(id: string, slug?: string | null): string {
  return slug ? `/habitat/${slug}` : `/habitat/${id}`;
}

export function useMyListings(userId: string | undefined) {
  return useQuery({
    queryKey: ["my-listings", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("listings")
        .select("*, places(*)")
        .eq("host_id", userId!);
      if (error) throw error;
      return data;
    },
  });
}

/** Published listings of a given host (read-only, for the public member profile) */
export function useHostListings(hostId: string | undefined) {
  return useQuery({
    queryKey: ["host-listings", hostId],
    enabled: !!hostId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("listings")
        .select("*, places(*)")
        .eq("host_id", hostId!)
        .eq("published", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function usePlaceListings(placeId: string | undefined) {
  return useQuery({
    queryKey: ["place-listings", placeId],
    enabled: !!placeId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("listings")
        .select("*, places(*)")
        .eq("place_id", placeId!)
        .eq("published", true);
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (listing: TablesInsert<"listings">) => {
      const { data, error } = await supabase.from("listings").insert(listing).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["listings"] });
      qc.invalidateQueries({ queryKey: ["my-listings"] });
    },
  });
}
