import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type HabitatEvent = {
  id: string;
  place_id: string;
  created_by: string;
  title: string;
  description: string | null;
  event_type: "atelier" | "repas" | "reunion" | "autre";
  date_start: string;
  date_end: string | null;
  max_participants: number | null;
  is_public: boolean;
  created_at: string;
};

const client = supabase as any;

export function useHabitatEvents(placeId: string | undefined) {
  return useQuery({
    queryKey: ["habitat-events", placeId],
    enabled: !!placeId,
    queryFn: async () => {
      const { data, error } = await client
        .from("habitat_events")
        .select("*, habitat_event_interests(id,user_id)")
        .eq("place_id", placeId!)
        .order("date_start", { ascending: true });
      if (error) throw error;
      return (data || []) as (HabitatEvent & { habitat_event_interests: { id: string; user_id: string }[] })[];
    },
  });
}

export function useMyPlacesEvents(userId: string | undefined) {
  return useQuery({
    queryKey: ["my-places-events", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data: places, error: pErr } = await supabase
        .from("places")
        .select("id,name")
        .or(`created_by.eq.${userId},claimed_by_user_id.eq.${userId}`);
      if (pErr) throw pErr;
      const ids = (places || []).map((p) => p.id);
      if (!ids.length) return [];
      const { data, error } = await client
        .from("habitat_events")
        .select("*, places(name)")
        .in("place_id", ids)
        .order("date_start", { ascending: true });
      if (error) throw error;
      return (data || []) as (HabitatEvent & { places: { name: string } })[];
    },
  });
}

export function useCreateHabitatEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Omit<HabitatEvent, "id" | "created_at">) => {
      const { data, error } = await client.from("habitat_events").insert(input).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["habitat-events", vars.place_id] });
      qc.invalidateQueries({ queryKey: ["my-places-events"] });
    },
  });
}

export function useDeleteHabitatEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (eventId: string) => {
      const { error } = await client.from("habitat_events").delete().eq("id", eventId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["habitat-events"] });
      qc.invalidateQueries({ queryKey: ["my-places-events"] });
    },
  });
}

export function useToggleEventInterest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      eventId,
      userId,
      interested,
    }: {
      eventId: string;
      userId: string;
      interested: boolean;
    }) => {
      if (interested) {
        const { error } = await client
          .from("habitat_event_interests")
          .delete()
          .eq("event_id", eventId)
          .eq("user_id", userId);
        if (error) throw error;
      } else {
        const { error } = await client
          .from("habitat_event_interests")
          .insert({ event_id: eventId, user_id: userId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["habitat-events"] });
    },
  });
}
