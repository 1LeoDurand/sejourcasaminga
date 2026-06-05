import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

export type Place = Tables<"places">;

export function usePlaces() {
  return useQuery({
    queryKey: ["places"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("places")
        .select("*")
        .eq("published", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Place[];
    },
  });
}

export function usePlace(id: string | undefined) {
  return useQuery({
    queryKey: ["place", id],
    enabled: !!id,
    queryFn: async () => {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id!);
      const query = supabase.from("places").select("*");
      const { data, error } = await (isUuid ? query.eq("id", id!) : query.eq("slug", id!)).single();
      if (error) throw error;
      return data as Place;
    },
  });
}

export function useMyPlaces(userId: string | undefined) {
  return useQuery({
    queryKey: ["my-places", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("place_members")
        .select("*, places(*)")
        .eq("user_id", userId!);
      if (error) throw error;
      return data;
    },
  });
}

export function useCreatePlace() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (place: TablesInsert<"places">) => {
      const { data, error } = await supabase.from("places").insert(place).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["places"] }),
  });
}

export function useJoinPlace() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (membership: { place_id: string; user_id: string; relationship_to_place?: string }) => {
      const { data, error } = await supabase.from("place_members").insert(membership).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-places"] }),
  });
}
