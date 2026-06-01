import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ShieldCheck, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";

interface PlaceClaimFormProps {
  placeId: string;
  placeName: string;
}

const PlaceClaimForm = ({ placeId, placeName }: PlaceClaimFormProps) => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [proofUrl, setProofUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { data: existingClaim } = useQuery({
    queryKey: ["place-claim", placeId, user?.id],
    enabled: !!user && !!placeId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("place_claims")
        .select("*")
        .eq("place_id", placeId)
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const handleSubmit = async () => {
    if (!user || !message.trim()) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from("place_claims").insert({
        place_id: placeId,
        user_id: user.id,
        message: message.trim(),
        proof_url: proofUrl.trim() || null,
      });
      if (error) throw error;
      toast({ title: "Demande envoyée ✓", description: "Nous examinerons votre demande dans les meilleurs délais." });
      qc.invalidateQueries({ queryKey: ["place-claim", placeId, user.id] });
      setOpen(false);
      setMessage("");
      setProofUrl("");
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-5">
        <div className="flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground">Vous faites partie de ce lieu ?</p>
            <p className="text-xs text-muted-foreground mt-1">
              <Link to="/auth" className="text-primary hover:underline">Connectez-vous</Link> pour revendiquer la gestion de cette fiche.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (existingClaim) {
    const statusLabels: Record<string, { text: string; color: string }> = {
      pending: { text: "En cours d'examen", color: "text-amber-600" },
      approved: { text: "Approuvée", color: "text-green-600" },
      rejected: { text: "Refusée", color: "text-destructive" },
    };
    const s = statusLabels[existingClaim.status] || statusLabels.pending;

    return (
      <div className="rounded-xl border bg-card p-5">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground">Demande de revendication déposée</p>
            <p className="text-xs text-muted-foreground mt-1">
              Statut : <span className={`font-medium ${s.color}`}>{s.text}</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!open) {
    return (
      <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-5">
        <div className="flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">Vous faites partie de ce lieu ?</p>
            <p className="text-xs text-muted-foreground mt-1">
              Revendiquez cette fiche pour la gérer et la mettre à jour.
            </p>
            <Button size="sm" variant="outline" className="mt-3" onClick={() => setOpen(true)}>
              Revendiquer ce lieu
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-5 space-y-4">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-primary" />
        <h3 className="text-sm font-medium text-foreground">Revendiquer « {placeName} »</h3>
      </div>

      <div>
        <Label className="text-xs">Quel est votre lien avec ce lieu ? *</Label>
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          placeholder="Ex : Je suis membre fondateur / habitant depuis 2018 / responsable communication du collectif…"
          className="mt-1"
        />
      </div>

      <div>
        <Label className="text-xs">Lien de preuve (optionnel)</Label>
        <Input
          value={proofUrl}
          onChange={(e) => setProofUrl(e.target.value)}
          placeholder="https://site-du-lieu.fr, lien LinkedIn, article…"
          className="mt-1"
        />
      </div>

      <div className="flex gap-2">
        <Button size="sm" onClick={handleSubmit} disabled={submitting || !message.trim()}>
          {submitting ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : null}
          Envoyer la demande
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
          Annuler
        </Button>
      </div>
    </div>
  );
};

export default PlaceClaimForm;
