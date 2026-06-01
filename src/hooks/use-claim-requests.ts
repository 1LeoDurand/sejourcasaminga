import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ClaimRequest {
  id: string;
  place_id: string;
  user_id: string;
  full_name: string;
  email: string;
  role_in_place: string;
  message: string | null;
  proof_url: string | null;
  status: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  places?: { name: string; image: string | null; region: string | null; city: string | null } | null;
}

export function useMyClaimRequests(userId: string | undefined) {
  return useQuery({
    queryKey: ["my-claim-requests", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("place_claim_requests" as any)
        .select("*, places(name, image, region, city)")
        .eq("user_id", userId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as ClaimRequest[];
    },
  });
}

export function useClaimRequestForPlace(placeId: string | undefined, userId: string | undefined) {
  return useQuery({
    queryKey: ["claim-request", placeId, userId],
    enabled: !!placeId && !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("place_claim_requests" as any)
        .select("*")
        .eq("place_id", placeId!)
        .eq("user_id", userId!)
        .maybeSingle();
      if (error) throw error;
      return data as unknown as ClaimRequest | null;
    },
  });
}

export function useCreateClaimRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (request: {
      place_id: string;
      user_id: string;
      full_name: string;
      email: string;
      role_in_place: string;
      message?: string;
      proof_url?: string;
    }) => {
      // Generate verification token (32 hex chars) + 7-day expiry
      const tokenBytes = new Uint8Array(16);
      crypto.getRandomValues(tokenBytes);
      const token = Array.from(tokenBytes).map((b) => b.toString(16).padStart(2, "0")).join("");
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

      const { data, error } = await supabase
        .from("place_claim_requests" as any)
        .insert({
          ...request,
          verification_token: token,
          token_expires_at: expiresAt,
        } as any)
        .select("*, places(name)")
        .single();
      if (error) throw error;

      // Update place claim_status to claim_pending
      await supabase
        .from("places")
        .update({ claim_status: "claim_pending" } as any)
        .eq("id", request.place_id);

      // Fire-and-forget verification email — failure shouldn't block claim
      const verifyUrl = `${window.location.origin}/verify-claim?token=${token}`;
      const placeName = (data as any)?.places?.name ?? "";
      supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName: "claim-verification",
          recipientEmail: request.email,
          idempotencyKey: `claim-verify-${(data as any).id}`,
          templateData: {
            fullName: request.full_name,
            placeName,
            verifyUrl,
            expiresInDays: 7,
          },
        },
      }).catch((e) => console.error("claim-verification email failed", e));

      return data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["my-claim-requests"] });
      qc.invalidateQueries({ queryKey: ["claim-request", vars.place_id] });
      qc.invalidateQueries({ queryKey: ["place", vars.place_id] });
    },
  });
}


// Admin hooks
export function useAllClaimRequests() {
  return useQuery({
    queryKey: ["all-claim-requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("place_claim_requests" as any)
        .select("*, places(name, image, region, city)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as ClaimRequest[];
    },
  });
}

export function useReviewClaimRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      requestId,
      status,
      reviewerId,
      placeId,
      userId,
    }: {
      requestId: string;
      status: "approved" | "rejected";
      reviewerId: string;
      placeId: string;
      userId: string;
    }) => {
      // Update the claim request
      const { error } = await supabase
        .from("place_claim_requests" as any)
        .update({
          status,
          reviewed_by: reviewerId,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", requestId);
      if (error) throw error;

      if (status === "approved") {
        // Update place
        await supabase
          .from("places")
          .update({
            claim_status: "claimed",
            claimed_by_user_id: userId,
            claimed_at: new Date().toISOString(),
          } as any)
          .eq("id", placeId);

        // Add user as place member with admin role
        await supabase
          .from("place_members")
          .upsert({
            place_id: placeId,
            user_id: userId,
            role: "admin",
            relationship_to_place: "Gestionnaire vérifié",
          });
      } else {
        // Reset claim status if rejected
        await supabase
          .from("places")
          .update({ claim_status: "imported" } as any)
          .eq("id", placeId);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["all-claim-requests"] });
      qc.invalidateQueries({ queryKey: ["places"] });
    },
  });
}

export function useIsAdmin(userId: string | undefined) {
  return useQuery({
    queryKey: ["is-admin", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles" as any)
        .select("role")
        .eq("user_id", userId!)
        .eq("role", "admin")
        .maybeSingle();
      if (error) return false;
      return !!data;
    },
  });
}
