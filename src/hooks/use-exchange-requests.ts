import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export { stayPointsCost, stayPointsErrorMessage } from "@/lib/stay-points";

async function notifyExchange(exchangeRequestId: string, event: "created" | "accepted" | "declined") {
  try {
    await supabase.functions.invoke("notify-exchange", {
      body: { exchange_request_id: exchangeRequestId, event },
    });
  } catch (err) {
    console.error("notify-exchange failed", err);
  }
}

export type StayRequestStatus = "pending" | "accepted" | "declined" | "cancelled" | "completed";

export function useCreateExchangeRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (request: {
      listing_id: string;
      from_user_id: string;
      to_member_id: string;
      message?: string;
      start_date: string;
      end_date: string;
      number_of_guests?: number;
      exchange_type?: string;
      accepted_terms?: boolean;
    }) => {
      const { data, error } = await supabase
        .from("exchange_requests")
        .insert(request as any)
        .select()
        .single();
      if (error) throw error;
      notifyExchange(data.id, "created");
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["exchange-requests"] }),
  });
}

export function useUpdateExchangeRequestStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: StayRequestStatus }) => {
      const { data, error } = await supabase
        .from("exchange_requests")
        .update({ status })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      if (status === "accepted" || status === "declined") {
        notifyExchange(id, status);
      }
      return data;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["exchange-requests"] });
      qc.invalidateQueries({ queryKey: ["exchange-request", vars.id] });
    },
  });
}

/**
 * Host accepts a stay request. Acceptance, the guest debit and the host credit
 * happen atomically in the `accept_stay_request` RPC (points exchanges only).
 * Resolves to the points cost charged (0 for non-points exchanges).
 */
export function useAcceptStayRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase.rpc("accept_stay_request" as any, {
        _request_id: id,
      });
      if (error) throw error;
      notifyExchange(id, "accepted");
      return (data as number) ?? 0;
    },
    onSuccess: (_d, id) => {
      qc.invalidateQueries({ queryKey: ["exchange-requests"] });
      qc.invalidateQueries({ queryKey: ["exchange-request", id] });
      qc.invalidateQueries({ queryKey: ["point-balance"] });
      qc.invalidateQueries({ queryKey: ["point-transactions"] });
    },
  });
}

/** Reverse an acceptance back to pending, refunding any points charged. */
export function useRevertStayAcceptance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.rpc("revert_stay_acceptance" as any, {
        _request_id: id,
      });
      if (error) throw error;
    },
    onSuccess: (_d, id) => {
      qc.invalidateQueries({ queryKey: ["exchange-requests"] });
      qc.invalidateQueries({ queryKey: ["exchange-request", id] });
      qc.invalidateQueries({ queryKey: ["point-balance"] });
      qc.invalidateQueries({ queryKey: ["point-transactions"] });
    },
  });
}


export function useUpdateExchangeRequestDates() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, start_date, end_date }: { id: string; start_date: string; end_date: string }) => {
      const { data, error } = await supabase
        .from("exchange_requests")
        .update({ start_date, end_date })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["exchange-requests"] });
      qc.invalidateQueries({ queryKey: ["exchange-request", vars.id] });
    },
  });
}

export function useMyExchangeRequests(userId: string | undefined) {
  return useQuery({
    queryKey: ["exchange-requests", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("exchange_requests")
        .select("*, listings(id, title, image, place_id, points_per_night, places(id, name, region, city))")
        .or(`from_user_id.eq.${userId},to_member_id.eq.${userId}`)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useExchangeRequest(id: string | undefined) {
  return useQuery({
    queryKey: ["exchange-request", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("exchange_requests")
        .select("*, listings(id, title, image, place_id, host_id, points_per_night, places(id, name, region, city))")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
  });
}
