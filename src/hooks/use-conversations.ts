import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useMyConversations(userId: string | undefined) {
  return useQuery({
    queryKey: ["conversations", userId],
    enabled: !!userId,
    queryFn: async () => {
      // Get conversations where user is a participant (incl. last_read_at)
      const { data: participations, error: pErr } = await supabase
        .from("conversation_participants")
        .select("conversation_id, last_read_at")
        .eq("user_id", userId!);
      if (pErr) throw pErr;
      if (!participations || participations.length === 0) return [];

      const readMap = new Map(
        participations.map((p) => [p.conversation_id, p.last_read_at])
      );
      const conversationIds = participations.map((p) => p.conversation_id);

      const { data, error } = await supabase
        .from("conversations")
        .select("*, listings(title, image, places(name))")
        .in("id", conversationIds)
        .order("created_at", { ascending: false });
      if (error) throw error;

      const enriched = await Promise.all(
        (data || []).map(async (conv) => {
          const { data: lastMsg } = await supabase
            .from("messages")
            .select("content, created_at, sender_user_id")
            .eq("conversation_id", conv.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          const { data: participants } = await supabase
            .from("conversation_participants")
            .select("user_id")
            .eq("conversation_id", conv.id);

          const otherUserIds = (participants || [])
            .map((p) => p.user_id)
            .filter((id) => id !== userId);

          let otherProfile = null;
          if (otherUserIds.length > 0) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("display_name, avatar_url")
              .eq("user_id", otherUserIds[0])
              .maybeSingle();
            otherProfile = profile;
          }

          // Count unread messages (from others, after last_read_at)
          const lastReadAt = readMap.get(conv.id);
          const { count: unreadCount } = await supabase
            .from("messages")
            .select("*", { count: "exact", head: true })
            .eq("conversation_id", conv.id)
            .neq("sender_user_id", userId!)
            .gt("created_at", lastReadAt ?? "1970-01-01");

          return {
            ...conv,
            last_message: lastMsg,
            other_profile: otherProfile,
            other_user_id: otherUserIds[0] || null,
            unread_count: unreadCount ?? 0,
          };
        })
      );

      return enriched.sort((a, b) => {
        const dateA = a.last_message?.created_at || a.created_at;
        const dateB = b.last_message?.created_at || b.created_at;
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      });
    },
  });
}

export function useConversationMessages(conversationId: string | undefined) {
  return useQuery({
    queryKey: ["messages", conversationId],
    enabled: !!conversationId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
  });
}

/**
 * Subscribe to realtime INSERTs on `messages` for a conversation.
 * Optimistically appends incoming messages to the cache and fires a toast
 * for messages sent by other participants.
 */
export function useRealtimeMessages(
  conversationId: string | undefined,
  currentUserId: string | undefined,
  options?: { otherDisplayName?: string | null; notify?: boolean }
) {
  const qc = useQueryClient();
  const otherName = options?.otherDisplayName ?? "Membre";
  const notify = options?.notify ?? true;

  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`conversation_${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMsg = payload.new as any;
          // Append to cache, dedup by id
          qc.setQueryData<any[]>(["messages", conversationId], (prev) => {
            if (!prev) return [newMsg];
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
          qc.invalidateQueries({ queryKey: ["conversations"] });

          if (notify && currentUserId && newMsg.sender_user_id !== currentUserId) {
            toast(`Nouveau message de ${otherName}`, {
              description:
                typeof newMsg.content === "string"
                  ? newMsg.content.slice(0, 80)
                  : undefined,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, currentUserId, otherName, notify, qc]);
}

export function useMarkConversationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      conversationId,
      userId,
    }: {
      conversationId: string;
      userId: string;
    }) => {
      const { error } = await supabase
        .from("conversation_participants")
        .update({ last_read_at: new Date().toISOString() })
        .eq("conversation_id", conversationId)
        .eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

export function useSendMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (msg: {
      conversation_id: string;
      sender_user_id: string;
      content: string;
    }) => {
      const { data, error } = await supabase
        .from("messages")
        .insert(msg)
        .select()
        .single();
      if (error) throw error;
      supabase.functions
        .invoke("notify-new-message", { body: { message_id: data.id } })
        .catch((err) => console.error("notify-new-message failed", err));
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["messages", data.conversation_id] });
      qc.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}
