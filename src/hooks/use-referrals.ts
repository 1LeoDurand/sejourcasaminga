import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ReferralRow {
  id: string;
  referrer_user_id: string;
  referred_user_id: string | null;
  referred_email: string | null;
  code: string;
  status: string;
  email_sent: boolean;
  email_sent_at: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface ReferralReward {
  id: string;
  user_id: string;
  reward_type: "featured_listing" | "ambassador_badge" | string;
  referral_count: number;
  claimed_at: string;
  expires_at: string | null;
}

export const REWARD_THRESHOLDS = [
  { count: 1, type: "points", label: "+50 points par filleul", icon: "🎁" },
  { count: 3, type: "featured_listing", label: "Mise en avant 30 jours", icon: "⭐" },
  { count: 5, type: "ambassador_badge", label: "Badge Ambassadeur", icon: "🏅" },
];

export function useReferralStats(userId: string | undefined) {
  return useQuery({
    queryKey: ["referral-stats", userId],
    enabled: !!userId,
    queryFn: async () => {
      const [refs, rewards] = await Promise.all([
        supabase
          .from("referrals")
          .select("*")
          .eq("referrer_user_id", userId!)
          .order("created_at", { ascending: false }),
        supabase
          .from("referral_rewards" as any)
          .select("*")
          .eq("user_id", userId!),
      ]);

      const all = (refs.data ?? []) as ReferralRow[];
      const completed = all.filter((r) => r.status === "completed" && r.referred_user_id);
      const invited = all.filter((r) => r.referred_email);

      return {
        all,
        invited,
        completed,
        completedCount: completed.length,
        rewards: ((rewards.data ?? []) as unknown) as ReferralReward[],
      };
    },
  });
}

export function useReferredUserNames(userIds: string[]) {
  return useQuery({
    queryKey: ["referred-user-names", userIds.sort().join(",")],
    enabled: userIds.length > 0,
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("user_id, display_name")
        .in("user_id", userIds);
      const map: Record<string, string> = {};
      (data ?? []).forEach((p) => { map[p.user_id] = p.display_name; });
      return map;
    },
  });
}

export function useSendInvite(userId: string | undefined, referralCode: string | undefined, referrerName: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ email, personalMessage }: { email: string; personalMessage?: string }) => {
      if (!userId || !referralCode) throw new Error("Pas de code de parrainage");

      // Insert pending invitation row
      const { error: insErr } = await supabase
        .from("referrals")
        .insert({
          referrer_user_id: userId,
          code: referralCode,
          referred_email: email.toLowerCase().trim(),
          email_sent: false,
          status: "pending",
        });
      if (insErr) throw insErr;

      // Send the email via existing transactional pipeline
      const { error: mailErr } = await supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName: "referral-invite",
          recipientEmail: email,
          idempotencyKey: `invite-${userId}-${email.toLowerCase().trim()}-${Date.now()}`,
          templateData: { referrerName, personalMessage, referralCode },
        },
      });
      if (mailErr) throw mailErr;

      // Best-effort: mark email_sent
      await supabase
        .from("referrals")
        .update({ email_sent: true, email_sent_at: new Date().toISOString() })
        .eq("referrer_user_id", userId)
        .eq("referred_email", email.toLowerCase().trim())
        .eq("email_sent", false);
    },
    onSuccess: () => {
      toast.success("Invitation envoyée");
      qc.invalidateQueries({ queryKey: ["referral-stats", userId] });
    },
    onError: (e: any) => toast.error(e?.message || "Erreur lors de l'envoi"),
  });
}

export async function claimReferralCode(code: string) {
  const { data, error } = await supabase.rpc("claim_referral" as any, { _code: code });
  if (error) throw error;
  return data as { ok?: boolean; error?: string };
}
