import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useListingAvailabilities(listingId: string | undefined) {
  return useQuery({
    queryKey: ["availabilities", listingId],
    enabled: !!listingId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("availabilities")
        .select("*")
        .eq("listing_id", listingId!)
        .order("start_date", { ascending: true });
      if (error) throw error;
      return data;
    },
  });
}

export function useMyAvailabilities() {
  return useQuery({
    queryKey: ["my-availabilities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("availabilities")
        .select("*, listings(title, place_id, places(name))")
        .order("start_date", { ascending: true });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateAvailability() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (av: { listing_id: string; start_date: string; end_date: string; status?: string }) => {
      const { data, error } = await supabase.from("availabilities").insert(av).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["availabilities", data.listing_id] });
      qc.invalidateQueries({ queryKey: ["my-availabilities"] });
    },
  });
}

export function useDeleteAvailability() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("availabilities").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["availabilities"] });
      qc.invalidateQueries({ queryKey: ["my-availabilities"] });
    },
  });
}
