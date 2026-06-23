import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function usePointBalance(userId: string | undefined) {
  return useQuery({
    queryKey: ["point-balance", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("point_balances")
        .select("*")
        .eq("user_id", userId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function usePointTransactions(userId: string | undefined) {
  return useQuery({
    queryKey: ["point-transactions", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("point_transactions")
        .select("*")
        .eq("user_id", userId!)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });
}

export function useReferralCode(userId: string | undefined) {
  return useQuery({
    queryKey: ["referral-code", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("referrals")
        .select("*")
        .eq("referrer_user_id", userId!)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useMyReferrals(userId: string | undefined) {
  return useQuery({
    queryKey: ["my-referrals", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("referrals")
        .select("*")
        .eq("referrer_user_id", userId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

// ── Admin: global view + manual adjustment ──────────────────────────────────

export interface AdminPointRow {
  user_id: string;
  display_name: string | null;
  balance: number;
}

export function useAllPointBalances() {
  return useQuery({
    queryKey: ["admin-point-balances"],
    queryFn: async () => {
      const [{ data: balances }, { data: profiles }] = await Promise.all([
        supabase.from("point_balances").select("user_id, balance"),
        supabase.from("profiles").select("user_id, display_name"),
      ]);
      const nameById = new Map((profiles ?? []).map((p: any) => [p.user_id, p.display_name]));
      return ((balances ?? []) as any[])
        .map((b) => ({
          user_id: b.user_id,
          balance: b.balance ?? 0,
          display_name: nameById.get(b.user_id) ?? null,
        }))
        .sort((a, b) => b.balance - a.balance) as AdminPointRow[];
    },
  });
}

export function useAllPointTransactions(limit = 100) {
  return useQuery({
    queryKey: ["admin-point-transactions", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("point_transactions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data ?? [];
    },
  });
}

/** Admin manual adjustment: records a transaction and updates the balance. */
export function useAdjustPoints() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      userId,
      amount,
      description,
    }: {
      userId: string;
      amount: number;
      description: string;
    }) => {
      const { error: txError } = await supabase.from("point_transactions").insert({
        user_id: userId,
        amount,
        type: "admin_adjustment",
        description,
      } as any);
      if (txError) throw txError;

      const { data: bal } = await supabase
        .from("point_balances")
        .select("balance")
        .eq("user_id", userId)
        .maybeSingle();

      const newBalance = (bal?.balance ?? 0) + amount;
      const { error: balError } = await supabase
        .from("point_balances")
        .upsert({ user_id: userId, balance: newBalance } as any, { onConflict: "user_id" });
      if (balError) throw balError;

      return newBalance;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-point-balances"] });
      qc.invalidateQueries({ queryKey: ["admin-point-transactions"] });
    },
  });
}

export const POINT_TYPE_LABELS: Record<string, string> = {
  signup_bonus: "Bonus de bienvenue",
  profile_completed: "Profil complété",
  place_created: "Lieu ajouté",
  listing_created: "Séjour publié",
  availability_added: "Disponibilité ajoutée",
  referral_bonus: "Bonus parrainage",
  referral_welcome: "Bonus filleul",
  exchange_completed: "Échange terminé",
  stay_redeemed: "Séjour réglé en points",
  stay_earned: "Séjour accueilli",
  stay_refunded: "Remboursement séjour",
  stay_reverted: "Accueil annulé",
  admin_adjustment: "Ajustement admin",
};

export const POINT_TYPE_ICONS: Record<string, string> = {
  signup_bonus: "🎁",
  profile_completed: "✨",
  place_created: "🏡",
  listing_created: "🛏️",
  availability_added: "📅",
  referral_bonus: "🤝",
  referral_welcome: "🎉",
  exchange_completed: "🔄",
  stay_redeemed: "🛎️",
  stay_earned: "🏡",
  stay_refunded: "↩️",
  stay_reverted: "↩️",
  admin_adjustment: "⚖️",
};
