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

export const POINT_TYPE_LABELS: Record<string, string> = {
  signup_bonus: "Bonus de bienvenue",
  profile_completed: "Profil complété",
  place_created: "Lieu ajouté",
  listing_created: "Séjour publié",
  availability_added: "Disponibilité ajoutée",
  referral_bonus: "Bonus parrainage",
  referral_welcome: "Bonus filleul",
  exchange_completed: "Échange terminé",
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
};
