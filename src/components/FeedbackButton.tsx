import { useState } from "react";
import { useLocation } from "react-router-dom";
import { z } from "zod";
import { MessageCircle, X, Bug, HelpCircle, Lightbulb, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const ADMIN_EMAIL = "1leodurand@gmail.com";

const feedbackSchema = z.object({
  type: z.enum(["bug", "question", "suggestion"]),
  message: z.string().trim().min(5, "Merci d'écrire au moins quelques mots").max(2000, "Message trop long (max 2000)"),
  email: z.string().trim().min(1, "Email requis").email("Email invalide").max(255),
});

type FeedbackType = "bug" | "question" | "suggestion";

const TYPES: { value: FeedbackType; label: string; icon: typeof Bug }[] = [
  { value: "bug", label: "Bug", icon: Bug },
  { value: "question", label: "Question", icon: HelpCircle },
  { value: "suggestion", label: "Idée", icon: Lightbulb },
];

const FeedbackButton = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<FeedbackType>("bug");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  // Hide on admin pages
  if (location.pathname.startsWith("/admin")) return null;

  const reset = () => {
    setMessage("");
    setEmail("");
    setType("bug");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const contactEmail = (email || user?.email || "").trim();
    const parsed = feedbackSchema.safeParse({ type, message, email: contactEmail });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message || "Formulaire invalide");
      return;
    }
    setLoading(true);
    try {
      const id = crypto.randomUUID();
      const pageUrl = window.location.href;
      const userAgent = navigator.userAgent;
      

      const { error: insertError } = await supabase.from("feedback").insert({
        id,
        user_id: user?.id ?? null,
        type,
        message: parsed.data.message,
        email: contactEmail,
        page_url: pageUrl,
        user_agent: userAgent,
      });
      if (insertError) throw insertError;

      // Send email to admin (non-blocking for UX)
      supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName: "feedback-received",
          recipientEmail: ADMIN_EMAIL,
          idempotencyKey: `feedback-${id}`,
          templateData: {
            type,
            message: parsed.data.message,
            fromEmail: contactEmail || "non renseigné",
            pageUrl,
            userAgent,
            submittedAt: new Date().toLocaleString("fr-FR"),
          },
        },
      }).catch((err) => console.warn("Feedback email error:", err));

      toast.success("Merci ! Votre retour nous est bien parvenu.");
      reset();
      setOpen(false);
    } catch (err: any) {
      console.error(err);
      toast.error("Impossible d'envoyer le retour. Réessayez.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating trigger */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Envoyer un retour"
        className={cn(
          "fixed z-40 bottom-5 right-5 h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg",
          "flex items-center justify-center hover:scale-105 transition-transform",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        )}
      >
        {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
      </button>

      {open && (
        <div
          className={cn(
            "fixed z-40 bottom-20 right-5 w-[calc(100vw-2.5rem)] max-w-sm",
            "bg-background border border-border rounded-2xl shadow-2xl p-5 animate-fade-in"
          )}
        >
          <div className="mb-3">
            <h3 className="text-base font-semibold text-foreground">Un retour à partager ?</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Bug, question ou idée — on lit tout.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              {TYPES.map((t) => {
                const Icon = t.icon;
                const active = type === t.value;
                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setType(t.value)}
                    className={cn(
                      "flex flex-col items-center gap-1 py-2 rounded-lg border text-xs transition-colors",
                      active
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:bg-muted"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {t.label}
                  </button>
                );
              })}
            </div>

            <div>
              <Label htmlFor="fb-message" className="sr-only">Message</Label>
              <Textarea
                id="fb-message"
                placeholder="Décrivez votre retour…"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                maxLength={2000}
                required
              />
            </div>

            <div>
              <Label htmlFor="fb-email" className="text-xs text-muted-foreground">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="fb-email"
                type="email"
                placeholder="vous@exemple.com"
                value={email || user?.email || ""}
                onChange={(e) => setEmail(e.target.value)}
                maxLength={255}
                required
                className="mt-1"
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              <Send className="h-4 w-4" />
              {loading ? "Envoi…" : "Envoyer"}
            </Button>
          </form>
        </div>
      )}
    </>
  );
};

export default FeedbackButton;
