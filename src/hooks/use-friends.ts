import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

/** Friendship state from the connected user's point of view (RPC `friendship_status`). */
export type FriendshipState =
  | "none"
  | "pending_outgoing"
  | "pending_incoming"
  | "friends"
  | "blocked";

export interface FriendProfile {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
}

export interface Friend {
  friendshipId: string;
  userId: string;
  profile: FriendProfile;
  since: string;
}

export interface PendingRequest {
  friendshipId: string;
  userId: string;
  profile: FriendProfile;
  createdAt: string;
}

interface FriendshipRow {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: string;
  created_at: string;
  responded_at: string | null;
}

// `friendships` is not in the generated types yet, and its FK points to auth.users
// (not profiles), so we can't embed. We read the rows (RLS already scopes them to the
// two parties) and resolve the "other" profiles in a second query.
async function fetchProfiles(ids: string[]): Promise<Record<string, FriendProfile>> {
  const unique = Array.from(new Set(ids));
  if (unique.length === 0) return {};
  const { data, error } = await supabase
    .from("profiles")
    .select("user_id, display_name, avatar_url")
    .in("user_id", unique);
  if (error) throw error;
  const map: Record<string, FriendProfile> = {};
  for (const p of (data || []) as FriendProfile[]) map[p.user_id] = p;
  return map;
}

function profileFor(
  map: Record<string, FriendProfile>,
  userId: string,
): FriendProfile {
  return map[userId] ?? { user_id: userId, display_name: null, avatar_url: null };
}

/** State of the friendship with another member (for the friend button). */
export function useFriendshipStatus(otherUserId: string | undefined) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["friendship-status", otherUserId],
    enabled: !!user && !!otherUserId && otherUserId !== user.id,
    queryFn: async () => {
      const { data, error } = await (supabase as any).rpc("friendship_status", {
        _other: otherUserId,
      });
      if (error) throw error;
      return ((data as FriendshipState) ?? "none") as FriendshipState;
    },
  });
}

/** Accepted friends of the connected user. */
export function useFriends() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["friends"],
    enabled: !!user,
    queryFn: async (): Promise<Friend[]> => {
      const { data, error } = await supabase
        .from("friendships" as any)
        .select("*")
        .eq("status", "accepted");
      if (error) throw error;
      const rows = (data || []) as unknown as FriendshipRow[];
      const otherIds = rows.map((r) =>
        r.requester_id === user!.id ? r.addressee_id : r.requester_id,
      );
      const profiles = await fetchProfiles(otherIds);
      return rows
        .map((r) => {
          const otherId =
            r.requester_id === user!.id ? r.addressee_id : r.requester_id;
          return {
            friendshipId: r.id,
            userId: otherId,
            profile: profileFor(profiles, otherId),
            since: r.responded_at ?? r.created_at,
          };
        })
        .sort((a, b) =>
          (a.profile.display_name ?? "").localeCompare(b.profile.display_name ?? ""),
        );
    },
  });
}

/** Pending friend requests, split into incoming and outgoing. */
export function usePendingRequests() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["friend-requests"],
    enabled: !!user,
    queryFn: async (): Promise<{ incoming: PendingRequest[]; outgoing: PendingRequest[] }> => {
      const { data, error } = await supabase
        .from("friendships" as any)
        .select("*")
        .eq("status", "pending");
      if (error) throw error;
      const rows = (data || []) as unknown as FriendshipRow[];
      const incoming = rows.filter((r) => r.addressee_id === user!.id);
      const outgoing = rows.filter((r) => r.requester_id === user!.id);
      const profiles = await fetchProfiles([
        ...incoming.map((r) => r.requester_id),
        ...outgoing.map((r) => r.addressee_id),
      ]);
      const map = (r: FriendshipRow, otherId: string): PendingRequest => ({
        friendshipId: r.id,
        userId: otherId,
        profile: profileFor(profiles, otherId),
        createdAt: r.created_at,
      });
      return {
        incoming: incoming.map((r) => map(r, r.requester_id)),
        outgoing: outgoing.map((r) => map(r, r.addressee_id)),
      };
    },
  });
}

function useInvalidateFriendQueries() {
  const qc = useQueryClient();
  return (otherUserId?: string) => {
    qc.invalidateQueries({ queryKey: ["friends"] });
    qc.invalidateQueries({ queryKey: ["friend-requests"] });
    qc.invalidateQueries({
      queryKey: otherUserId ? ["friendship-status", otherUserId] : ["friendship-status"],
    });
  };
}

/** Send a friend request (RPC `send_friend_request`). */
export function useSendFriendRequest() {
  const invalidate = useInvalidateFriendQueries();
  return useMutation({
    mutationFn: async (addresseeId: string) => {
      const { data, error } = await (supabase as any).rpc("send_friend_request", {
        _addressee: addresseeId,
      });
      if (error) throw error;
      return data as string;
    },
    onSuccess: (_data, addresseeId) => invalidate(addresseeId),
  });
}

/** Accept or decline an incoming request (RPC `respond_friend_request`). */
export function useRespondFriendRequest() {
  const invalidate = useInvalidateFriendQueries();
  return useMutation({
    mutationFn: async ({ id, accept }: { id: string; accept: boolean }) => {
      const { error } = await (supabase as any).rpc("respond_friend_request", {
        _id: id,
        _accept: accept,
      });
      if (error) throw error;
    },
    onSuccess: () => invalidate(),
  });
}

/** Remove a friend or cancel a request, in both directions (RPC `remove_friend`). */
export function useRemoveFriend() {
  const invalidate = useInvalidateFriendQueries();
  return useMutation({
    mutationFn: async (otherUserId: string) => {
      const { error } = await (supabase as any).rpc("remove_friend", {
        _other: otherUserId,
      });
      if (error) throw error;
    },
    onSuccess: (_data, otherUserId) => invalidate(otherUserId),
  });
}
