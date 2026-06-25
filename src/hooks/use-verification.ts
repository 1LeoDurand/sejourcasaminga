import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// -----------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------

export type VerificationStatus = "none" | "pending" | "verified" | "rejected";

export interface MemberVerification {
  user_id: string;
  status: VerificationStatus;
  id_doc_path: string | null;
  payment_method: string | null;
  paid_at: string | null;
  reviewed_at: string | null;
  review_note: string | null;
}

// -----------------------------------------------------------------------
// Query keys
// -----------------------------------------------------------------------

const VERIFICATION_QK = "member-verification";
const MEMBERSHIP_PRICE_QK = "membership-price";

// -----------------------------------------------------------------------
// Hooks
// -----------------------------------------------------------------------

/**
 * Reads the current member's verification row.
 * Returns null when no row exists (status = 'none').
 */
export function useMyVerification() {
  const { user } = useAuth();

  return useQuery<MemberVerification | null>({
    queryKey: [VERIFICATION_QK, user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("member_verification" as any)
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();

      if (error) throw error;
      return (data as MemberVerification | null) ?? null;
    },
  });
}

/**
 * Fetches the current membership price via RPC.
 * Returns an integer (e.g. 89), in euros.
 */
export function useMembershipPrice() {
  return useQuery<number>({
    queryKey: [MEMBERSHIP_PRICE_QK],
    staleTime: 1000 * 60 * 60, // 1 h — price rarely changes
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_membership_price" as any);
      if (error) throw error;
      return data as number;
    },
  });
}

/**
 * Public badge check — is a given member verified?
 * Calls the `is_member_verified(_user_id)` RPC (returns boolean).
 */
export function useIsMemberVerified(userId: string | undefined) {
  return useQuery<boolean>({
    queryKey: ["is-member-verified", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("is_member_verified" as any, {
        _user_id: userId,
      });
      if (error) throw error;
      return Boolean(data);
    },
  });
}

/**
 * Submits an identity document path and transitions the member's
 * verification status to 'pending'.
 * Automatically invalidates the verification query on success.
 */
export function useSubmitIdentityDocument() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ path }: { path: string }) => {
      const { error } = await supabase.rpc("submit_identity_document" as any, {
        _doc_path: path,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [VERIFICATION_QK, user?.id] });
    },
  });
}
