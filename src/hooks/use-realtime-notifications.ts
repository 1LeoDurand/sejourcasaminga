import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

export interface RealtimeNotification {
  id: string;
  type: "message" | "exchange_request";
  title: string;
  body: string;
  createdAt: Date;
  read: boolean;
}

/**
 * Écoute en temps réel les nouveaux messages et demandes d'échange.
 * Invalide automatiquement les caches React Query concernés.
 * Retourne le nombre de notifications non lues et la liste.
 */
export function useRealtimeNotifications(userId: string | undefined) {
  const qc = useQueryClient();
  const [notifications, setNotifications] = useState<RealtimeNotification[]>([]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  const markRead = (id: string) =>
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));

  useEffect(() => {
    if (!userId) return;

    // ── Canal : nouveaux messages reçus ───────────────────────────────────
    const messageChannel = supabase
      .channel(`messages:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `recipient_id=eq.${userId}`,
        },
        (payload) => {
          const row = payload.new as any;
          setNotifications((prev) => [
            {
              id: `msg-${row.id}`,
              type: "message",
              title: "Nouveau message",
              body: row.content?.slice(0, 80) || "Vous avez reçu un message.",
              createdAt: new Date(row.created_at),
              read: false,
            },
            ...prev,
          ]);
          // Invalide le cache conversations
          qc.invalidateQueries({ queryKey: ["conversations"] });
          qc.invalidateQueries({ queryKey: ["my-conversations", userId] });
        }
      )
      .subscribe();

    // ── Canal : nouvelles demandes de séjour ─────────────────────────────
    const requestChannel = supabase
      .channel(`exchange-requests:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "exchange_requests",
          filter: `to_member_id=eq.${userId}`,
        },
        (payload) => {
          const row = payload.new as any;
          setNotifications((prev) => [
            {
              id: `req-${row.id}`,
              type: "exchange_request",
              title: "Nouvelle demande de séjour",
              body: `Demande du ${row.start_date} au ${row.end_date}`,
              createdAt: new Date(row.created_at),
              read: false,
            },
            ...prev,
          ]);
          // Invalide le cache échanges
          qc.invalidateQueries({ queryKey: ["my-exchange-requests", userId] });
          qc.invalidateQueries({ queryKey: ["exchange-requests"] });
        }
      )
      .subscribe();

    // ── Canal : mise à jour statut demande (acceptée/refusée) ─────────────
    const statusChannel = supabase
      .channel(`exchange-status:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "exchange_requests",
          filter: `from_user_id=eq.${userId}`,
        },
        (payload) => {
          const row = payload.new as any;
          if (row.status === "accepted" || row.status === "declined") {
            setNotifications((prev) => [
              {
                id: `status-${row.id}-${row.status}`,
                type: "exchange_request",
                title: row.status === "accepted" ? "Demande acceptée !" : "Demande déclinée",
                body: row.status === "accepted"
                  ? "Votre demande de séjour a été acceptée."
                  : "Votre demande de séjour n'a pas été retenue.",
                createdAt: new Date(),
                read: false,
              },
              ...prev,
            ]);
            qc.invalidateQueries({ queryKey: ["my-exchange-requests", userId] });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messageChannel);
      supabase.removeChannel(requestChannel);
      supabase.removeChannel(statusChannel);
    };
  }, [userId, qc]);

  return { notifications, unreadCount, markAllRead, markRead };
}
