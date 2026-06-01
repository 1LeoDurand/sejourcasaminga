import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type FavoriteWithListing = {
  id: string;
  user_id: string;
  listing_id: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  listings:
    | (any & {
        places: any | null;
        profiles?: any | null;
      })
    | null;
};

export function useFavorites(userId: string | undefined) {
  return useQuery({
    queryKey: ["favorites", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("favorites")
        .select("*, listings(*, places(*))")
        .eq("user_id", userId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as FavoriteWithListing[];
    },
  });
}

export function useIsFavorited(userId: string | undefined, listingId: string | undefined) {
  return useQuery({
    queryKey: ["favorite", userId, listingId],
    enabled: !!userId && !!listingId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("favorites")
        .select("id")
        .eq("user_id", userId!)
        .eq("listing_id", listingId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useToggleFavorite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      userId,
      listingId,
      currentlyFavorited,
    }: {
      userId: string;
      listingId: string;
      currentlyFavorited: boolean;
    }) => {
      if (currentlyFavorited) {
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", userId)
          .eq("listing_id", listingId);
        if (error) throw error;
        return { favorited: false };
      }
      const { error } = await supabase
        .from("favorites")
        .insert({ user_id: userId, listing_id: listingId });
      if (error) throw error;
      return { favorited: true };
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["favorites", vars.userId] });
      qc.invalidateQueries({ queryKey: ["favorite", vars.userId, vars.listingId] });
    },
  });
}

export function useUpdateFavoriteNotes() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes: string }) => {
      const { error } = await supabase.from("favorites").update({ notes }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["favorites"] }),
  });
}

// ── Shared wishlists ──
export function useMyShareLink(userId: string | undefined) {
  return useQuery({
    queryKey: ["wishlist-share", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shared_wishlists")
        .select("*")
        .eq("user_id", userId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateShareLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const { data, error } = await supabase
        .from("shared_wishlists")
        .insert({ user_id: userId })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_d, userId) =>
      qc.invalidateQueries({ queryKey: ["wishlist-share", userId] }),
  });
}

export function useSharedWishlistByToken(token: string | undefined) {
  return useQuery({
    queryKey: ["shared-wishlist", token],
    enabled: !!token,
    queryFn: async () => {
      const { data: wl, error } = await supabase
        .from("shared_wishlists")
        .select("*")
        .eq("token", token!)
        .maybeSingle();
      if (error) throw error;
      if (!wl) return null;
      const { data: favs, error: fErr } = await supabase
        .from("favorites")
        .select("id, created_at, listings(*, places(*))")
        .eq("user_id", wl.user_id)
        .order("created_at", { ascending: false });
      if (fErr) throw fErr;
      const { data: owner } = await supabase
        .from("profiles")
        .select("display_name, avatar_url")
        .eq("user_id", wl.user_id)
        .maybeSingle();
      return { wishlist: wl, favorites: favs || [], owner };
    },
  });
}
