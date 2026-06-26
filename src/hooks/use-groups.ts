import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface CommunityGroup {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  cover_image: string | null;
  theme: string | null;
  is_public: boolean;
  created_by: string | null;
  created_at: string;
  /** Resolved from the `group_member_counts` view. */
  memberCount: number;
}

export interface GroupMember {
  userId: string;
  role: string;
  profile: { user_id: string; display_name: string | null; avatar_url: string | null };
}

// `community_groups` / `group_members` are not in the generated types yet → `as any`
// for reads (same approach as use-friends / use-host-reviews). Writes go through RPC.
async function fetchCounts(): Promise<Record<string, number>> {
  const { data, error } = await supabase
    .from("group_member_counts" as any)
    .select("group_id, count");
  if (error) throw error;
  const map: Record<string, number> = {};
  for (const r of (data || []) as any[]) map[r.group_id] = Number(r.count) || 0;
  return map;
}

async function fetchProfiles(
  ids: string[],
): Promise<Record<string, GroupMember["profile"]>> {
  const unique = Array.from(new Set(ids));
  if (unique.length === 0) return {};
  const { data, error } = await supabase
    .from("profiles")
    .select("user_id, display_name, avatar_url")
    .in("user_id", unique);
  if (error) throw error;
  const map: Record<string, GroupMember["profile"]> = {};
  for (const p of (data || []) as GroupMember["profile"][]) map[p.user_id] = p;
  return map;
}

/** Public groups with their member count. */
export function useGroups() {
  return useQuery({
    queryKey: ["groups"],
    queryFn: async (): Promise<CommunityGroup[]> => {
      const { data, error } = await supabase
        .from("community_groups" as any)
        .select("*")
        .eq("is_public", true)
        .order("name");
      if (error) throw error;
      const groups = (data || []) as unknown as CommunityGroup[];
      const counts = await fetchCounts();
      return groups.map((g) => ({ ...g, memberCount: counts[g.id] ?? 0 }));
    },
  });
}

/** A single public group by slug. */
export function useGroup(slug: string | undefined) {
  return useQuery({
    queryKey: ["group", slug],
    enabled: !!slug,
    queryFn: async (): Promise<CommunityGroup | null> => {
      const { data, error } = await supabase
        .from("community_groups" as any)
        .select("*")
        .eq("slug", slug!)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      const group = data as unknown as CommunityGroup;
      const counts = await fetchCounts();
      return { ...group, memberCount: counts[group.id] ?? 0 };
    },
  });
}

/** Members of a group (visible to group members per RLS). */
export function useGroupMembers(groupId: string | undefined) {
  return useQuery({
    queryKey: ["group-members", groupId],
    enabled: !!groupId,
    queryFn: async (): Promise<GroupMember[]> => {
      const { data, error } = await supabase
        .from("group_members" as any)
        .select("user_id, role")
        .eq("group_id", groupId!);
      if (error) throw error;
      const rows = (data || []) as unknown as { user_id: string; role: string }[];
      const profiles = await fetchProfiles(rows.map((r) => r.user_id));
      return rows.map((r) => ({
        userId: r.user_id,
        role: r.role,
        profile:
          profiles[r.user_id] ?? { user_id: r.user_id, display_name: null, avatar_url: null },
      }));
    },
  });
}

/** Groups the connected user belongs to. */
export function useMyGroups() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["my-groups", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<CommunityGroup[]> => {
      const { data, error } = await supabase
        .from("group_members" as any)
        .select("group_id")
        .eq("user_id", user!.id);
      if (error) throw error;
      const ids = ((data || []) as unknown as { group_id: string }[]).map((r) => r.group_id);
      if (ids.length === 0) return [];
      const [{ data: groups, error: gErr }, counts] = await Promise.all([
        supabase.from("community_groups" as any).select("*").in("id", ids),
        fetchCounts(),
      ]);
      if (gErr) throw gErr;
      return ((groups || []) as unknown as CommunityGroup[]).map((g) => ({
        ...g,
        memberCount: counts[g.id] ?? 0,
      }));
    },
  });
}

/** Whether the connected user is a member of a group. */
export function useIsGroupMember(groupId: string | undefined) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["is-group-member", groupId, user?.id],
    enabled: !!user && !!groupId,
    queryFn: async (): Promise<boolean> => {
      const { data, error } = await supabase
        .from("group_members" as any)
        .select("group_id")
        .eq("group_id", groupId!)
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return !!data;
    },
  });
}

function useInvalidateGroupQueries() {
  const qc = useQueryClient();
  return (groupId?: string) => {
    qc.invalidateQueries({ queryKey: ["groups"] });
    qc.invalidateQueries({ queryKey: ["my-groups"] });
    qc.invalidateQueries({ queryKey: ["group"] });
    qc.invalidateQueries({ queryKey: ["group-members", groupId] });
    qc.invalidateQueries({ queryKey: ["is-group-member", groupId] });
  };
}

/** Join a group (RPC `join_group`). */
export function useJoinGroup() {
  const invalidate = useInvalidateGroupQueries();
  return useMutation({
    mutationFn: async (groupId: string) => {
      const { error } = await (supabase as any).rpc("join_group", { _group: groupId });
      if (error) throw error;
    },
    onSuccess: (_data, groupId) => invalidate(groupId),
  });
}

/** Leave a group (RPC `leave_group`). */
export function useLeaveGroup() {
  const invalidate = useInvalidateGroupQueries();
  return useMutation({
    mutationFn: async (groupId: string) => {
      const { error } = await (supabase as any).rpc("leave_group", { _group: groupId });
      if (error) throw error;
    },
    onSuccess: (_data, groupId) => invalidate(groupId),
  });
}
