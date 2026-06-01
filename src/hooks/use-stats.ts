import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PublicStats {
  habitats: number;
  members: number;
  stays: number;
  growth_pct: number;
}

export function usePublicStats() {
  return useQuery({
    queryKey: ["public-stats"],
    staleTime: 1000 * 60 * 60,
    queryFn: async (): Promise<PublicStats> => {
      const { data, error } = await supabase.rpc("get_public_stats" as any);
      if (error) throw error;
      return (data as unknown as PublicStats) ?? { habitats: 0, members: 0, stays: 0, growth_pct: 0 };
    },
  });
}

export function usePopularPlaces(days = 30, limit = 5) {
  return useQuery({
    queryKey: ["popular-places", days, limit],
    staleTime: 1000 * 60 * 30,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_popular_places" as any, { _days: days, _limit: limit });
      if (error) throw error;
      return (data ?? []) as Array<{
        place_id: string; name: string; region: string | null; image: string | null;
        view_count: number; favorite_count: number;
      }>;
    },
  });
}

export function useValueSearchStats() {
  return useQuery({
    queryKey: ["value-search-stats"],
    staleTime: 1000 * 60 * 60,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_value_search_stats" as any);
      if (error) throw error;
      return (data ?? []) as Array<{ value: string; count: number }>;
    },
  });
}

export function useRegionDistribution() {
  return useQuery({
    queryKey: ["region-distribution"],
    staleTime: 1000 * 60 * 60,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_region_distribution" as any);
      if (error) throw error;
      return (data ?? []) as Array<{ region: string; count: number }>;
    },
  });
}

export function useNewArrivals(limit = 5) {
  return useQuery({
    queryKey: ["new-arrivals", limit],
    staleTime: 1000 * 60 * 30,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("places")
        .select("id, name, region, image, created_at")
        .eq("published", true)
        .eq("is_visible", true)
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data ?? [];
    },
  });
}

// Admin-only: monthly time series
export function useAdminTrends() {
  return useQuery({
    queryKey: ["admin-trends"],
    staleTime: 1000 * 60 * 30,
    queryFn: async () => {
      const since = new Date();
      since.setMonth(since.getMonth() - 11);
      since.setDate(1);

      const [places, members, requests] = await Promise.all([
        supabase.from("places").select("created_at").gte("created_at", since.toISOString()),
        supabase.from("profiles").select("created_at").gte("created_at", since.toISOString()),
        supabase.from("exchange_requests").select("created_at, status").gte("created_at", since.toISOString()),
      ]);

      const buckets: Record<string, { month: string; habitats: number; members: number; stays: number }> = {};
      for (let i = 0; i < 12; i++) {
        const d = new Date(since);
        d.setMonth(d.getMonth() + i);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        buckets[key] = { month: key, habitats: 0, members: 0, stays: 0 };
      }
      const bucketKey = (iso: string) => {
        const d = new Date(iso);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      };

      (places.data ?? []).forEach((r) => { const k = bucketKey(r.created_at); if (buckets[k]) buckets[k].habitats++; });
      (members.data ?? []).forEach((r) => { const k = bucketKey(r.created_at); if (buckets[k]) buckets[k].members++; });
      (requests.data ?? []).forEach((r) => { const k = bucketKey(r.created_at); if (buckets[k]) buckets[k].stays++; });

      return Object.values(buckets);
    },
  });
}

export function useAdminFunnel() {
  return useQuery({
    queryKey: ["admin-funnel"],
    queryFn: async () => {
      const [users, withRequests, completed] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("exchange_requests").select("from_user_id"),
        supabase.from("exchange_requests").select("*", { count: "exact", head: true }).in("status", ["completed", "accepted", "confirmed"]),
      ]);
      const distinctRequesters = new Set((withRequests.data ?? []).map((r: any) => r.from_user_id)).size;
      return {
        signups: users.count ?? 0,
        requesters: distinctRequesters,
        completed: completed.count ?? 0,
      };
    },
  });
}

export function useEmailDeliveryStats(days = 30) {
  return useQuery({
    queryKey: ["email-stats", days],
    queryFn: async () => {
      const since = new Date(Date.now() - days * 86400000).toISOString();
      const { data } = await supabase
        .from("email_send_log" as any)
        .select("status, message_id, created_at")
        .gte("created_at", since);
      const seen = new Map<string, string>();
      (data ?? []).forEach((r: any) => {
        if (!r.message_id) return;
        if (!seen.has(r.message_id)) seen.set(r.message_id, r.status);
      });
      const counts: Record<string, number> = { sent: 0, dlq: 0, suppressed: 0, pending: 0, other: 0 };
      seen.forEach((s) => { counts[s] !== undefined ? counts[s]++ : counts.other++; });
      return { total: seen.size, ...counts };
    },
  });
}
