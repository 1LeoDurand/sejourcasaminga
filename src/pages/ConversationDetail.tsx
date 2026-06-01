import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Send, Loader2, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  useConversationMessages,
  useSendMessage,
  useRealtimeMessages,
  useMarkConversationRead,
} from "@/hooks/use-conversations";
import { useHostProfile } from "@/hooks/use-profile";
import { useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const ConversationDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: messages, isLoading } = useConversationMessages(id);
  const sendMessage = useSendMessage();
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Get other participant
  const { data: participants } = useQuery({
    queryKey: ["conv-participants", id],
    enabled: !!id && !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("conversation_participants")
        .select("user_id")
        .eq("conversation_id", id!);
      return data;
    },
  });

  const otherUserId = participants?.find((p) => p.user_id !== user?.id)?.user_id;
  const { data: otherProfile } = useHostProfile(otherUserId);

  // Realtime: append new messages + toast when others send
  useRealtimeMessages(id, user?.id, {
    otherDisplayName: otherProfile?.display_name,
  });

  // Mark conversation as read on open and whenever new messages arrive
  const markRead = useMarkConversationRead();
  useEffect(() => {
    if (!id || !user?.id) return;
    markRead.mutate({ conversationId: id, userId: user.id });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user?.id, messages?.length]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!text.trim() || !user || !id) return;
    sendMessage.mutate({
      conversation_id: id,
      sender_user_id: user.id,
      content: text.trim(),
    });
    setText("");
  };

  if (!user) return null;

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b bg-background sticky top-0 z-10">
        <button onClick={() => navigate("/dashboard?tab=messages")} className="p-1">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
          {otherProfile?.avatar_url ? (
            <img src={otherProfile.avatar_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <User className="h-4 w-4 text-primary" />
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">
            {otherProfile?.display_name || "Membre"}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : messages && messages.length > 0 ? (
          messages.map((msg) => {
            const isMine = msg.sender_user_id === user.id;
            return (
              <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                    isMine
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-card border border-border text-foreground rounded-bl-md"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      isMine ? "text-primary-foreground/60" : "text-muted-foreground"
                    }`}
                  >
                    {format(new Date(msg.created_at), "HH:mm", { locale: fr })}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-center text-sm text-muted-foreground py-12">
            Démarrez la conversation…
          </p>
        )}
      </div>

      {/* Input */}
      <div className="border-t bg-background px-4 py-3">
        <div className="flex items-center gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Écrivez votre message…"
            className="flex-1 rounded-full border bg-muted px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <Button
            size="icon"
            className="rounded-full h-10 w-10 shrink-0"
            onClick={handleSend}
            disabled={!text.trim() || sendMessage.isPending}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConversationDetail;
