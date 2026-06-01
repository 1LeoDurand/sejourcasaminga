import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, ShieldCheck, CheckCircle2, Clock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { useClaimRequestForPlace, useCreateClaimRequest } from "@/hooks/use-claim-requests";

interface Props {
  placeId: string;
  placeName: string;
  claimStatus: string;
}

const PlaceClaimRequestForm = ({ placeId, placeName, claimStatus }: Props) => {
  const { user } = useAuth();
  const { data: existingRequest } = useClaimRequestForPlace(placeId, user?.id);
  const createClaim = useCreateClaimRequest();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    role_in_place: "",
    message: "",
    proof_url: "",
  });
  const [confirmed, setConfirmed] = useState(false);

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

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

  if (existingRequest) {
    const statusConfig: Record<string, { text: string; color: string; icon: React.ElementType }> = {
      pending: { text: "En cours d'examen", color: "text-amber-600", icon: Clock },
      approved: { text: "Approuvée", color: "text-olive", icon: CheckCircle2 },
      rejected: { text: "Refusée", color: "text-destructive", icon: ShieldCheck },
    };
    const s = statusConfig[existingRequest.status] || statusConfig.pending;
    const Icon = s.icon;

    return (
      <div className="rounded-xl border bg-card p-5">
        <div className="flex items-start gap-3">
          <Icon className="h-5 w-5 text-primary mt-0.5 shrink-0" />
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

  if (claimStatus === "claimed" || claimStatus === "verified") {
    return null; // Already claimed, don't show form
  }

  const handleSubmit = async () => {
    if (!user || !form.full_name.trim() || !form.email.trim() || !form.role_in_place.trim() || !confirmed) return;

    try {
      await createClaim.mutateAsync({
        place_id: placeId,
        user_id: user.id,
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        role_in_place: form.role_in_place.trim(),
        message: form.message.trim() || undefined,
        proof_url: form.proof_url.trim() || undefined,
      });
      toast({ title: "Demande envoyée ✓", description: "Nous examinerons votre demande dans les meilleurs délais." });
      setOpen(false);
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    }
  };

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
              Revendiquer cette fiche
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
        <Label className="text-xs">Nom complet *</Label>
        <Input value={form.full_name} onChange={(e) => set("full_name", e.target.value)} placeholder="Prénom Nom" className="mt-1" />
      </div>

      <div>
        <Label className="text-xs">Email *</Label>
        <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="votre@email.fr" className="mt-1" />
      </div>

      <div>
        <Label className="text-xs">Votre rôle dans ce lieu *</Label>
        <Input value={form.role_in_place} onChange={(e) => set("role_in_place", e.target.value)} placeholder="Ex : Co-fondateur, habitant, responsable comm…" className="mt-1" />
      </div>

      <div>
        <Label className="text-xs">Message (optionnel)</Label>
        <Textarea value={form.message} onChange={(e) => set("message", e.target.value)} rows={3} placeholder="Expliquez votre lien avec ce lieu…" className="mt-1" />
      </div>

      <div>
        <Label className="text-xs">Lien de preuve (optionnel)</Label>
        <Input value={form.proof_url} onChange={(e) => set("proof_url", e.target.value)} placeholder="https://site-du-lieu.fr, LinkedIn, article…" className="mt-1" />
      </div>

      <div className="flex items-start gap-2">
        <Checkbox id="confirm-claim" checked={confirmed} onCheckedChange={(v) => setConfirmed(!!v)} className="mt-0.5" />
        <label htmlFor="confirm-claim" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
          Je confirme faire partie de ce collectif et être habilité·e à gérer cette fiche sur Casa Minga.
        </label>
      </div>

      <div className="flex gap-2">
        <Button size="sm" onClick={handleSubmit} disabled={createClaim.isPending || !form.full_name.trim() || !form.email.trim() || !form.role_in_place.trim() || !confirmed}>
          {createClaim.isPending ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : null}
          Envoyer la demande
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
          Annuler
        </Button>
      </div>
    </div>
  );
};

export default PlaceClaimRequestForm;
