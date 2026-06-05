import { useState, useEffect } from "react";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, MailCheck, ShieldCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useCreateClaimRequest, useClaimRequestForPlace } from "@/hooks/use-claim-requests";

interface ClaimPlaceModalProps {
  placeId: string;
  placeName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const schema = z.object({
  email: z.string().trim().email("Email invalide").max(255),
});

export default function ClaimPlaceModal({
  placeId,
  placeName,
  isOpen,
  onClose,
  onSuccess,
}: ClaimPlaceModalProps) {
  const { user } = useAuth();
  const { data: existingRequest } = useClaimRequestForPlace(placeId, user?.id);
  const createClaim = useCreateClaimRequest();

  const defaultEmail = user?.email ?? "";
  const defaultName =
    (user?.user_metadata?.full_name as string) ||
    (user?.user_metadata?.name as string) ||
    (user?.email?.split("@")[0] ?? "Habitant·e");

  const [email, setEmail] = useState(defaultEmail);
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setEmail(defaultEmail);
      setAccepted(false);
      setError(null);
      setSent(false);
    }
  }, [isOpen, defaultEmail]);

  const alreadyClaimed = !!existingRequest;

  const handleSubmit = async () => {
    setError(null);
    const parsed = schema.safeParse({ email });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Email invalide");
      return;
    }
    if (!accepted || !user) return;

    try {
      await createClaim.mutateAsync({
        place_id: placeId,
        user_id: user.id,
        full_name: defaultName,
        email: parsed.data.email,
        role_in_place: "Habitant·e",
      });
      toast.success("Email envoyé", {
        description: "Vérifiez votre boîte de réception pour confirmer.",
      });
      setSent(true);
      onSuccess?.();
    } catch (err: any) {
      toast.error("Erreur lors de l'envoi", { description: err.message });
      setError(err.message);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        {sent ? (
          <>
            <DialogHeader>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <MailCheck className="h-6 w-6 text-primary" />
              </div>
              <DialogTitle className="font-serif">Email envoyé ✓</DialogTitle>
              <DialogDescription className="leading-relaxed">
                Nous venons d'envoyer un lien de vérification à{" "}
                <strong>{email}</strong>. Cliquez sur le lien dans l'email pour
                rejoindre <strong>{placeName}</strong> en tant que co-habitant·e.
                <br />
                <span className="text-xs italic block mt-2">
                  Le lien expire dans 7 jours. Pensez à vérifier vos spams.
                </span>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={onClose}>Compris</Button>
            </DialogFooter>
          </>
        ) : alreadyClaimed ? (
          <>
            <DialogHeader>
              <DialogTitle className="font-serif">Demande déjà envoyée</DialogTitle>
              <DialogDescription className="leading-relaxed">
                Vous avez déjà demandé à rejoindre <strong>{placeName}</strong>.
                Statut actuel :{" "}
                <span className="font-medium text-foreground">
                  {existingRequest?.status === "approved"
                    ? "approuvée"
                    : existingRequest?.status === "rejected"
                    ? "refusée"
                    : "en attente"}
                </span>
                .
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={onClose}>Fermer</Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <ShieldCheck className="h-6 w-6 text-primary" />
              </div>
              <DialogTitle className="font-serif">Vous habitez {placeName} ?</DialogTitle>
              <DialogDescription className="leading-relaxed">
                Vérifiez votre email pour rejoindre ce collectif en tant que
                co-habitant·e et participer à la gestion de cette fiche.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div>
                <Label htmlFor="claim-email" className="text-xs">
                  Adresse email
                </Label>
                <Input
                  id="claim-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError(null);
                  }}
                  placeholder="vous@exemple.fr"
                  className="mt-1"
                  maxLength={255}
                  autoFocus
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Vous recevrez un lien de vérification à cette adresse.
                </p>
                {error && <p className="text-xs text-destructive mt-1">{error}</p>}
              </div>

              <div className="flex items-start gap-2">
                <Checkbox
                  id="claim-tos"
                  checked={accepted}
                  onCheckedChange={(v) => setAccepted(!!v)}
                  className="mt-0.5"
                />
                <label
                  htmlFor="claim-tos"
                  className="text-xs text-muted-foreground leading-relaxed cursor-pointer"
                >
                  Je confirme habiter ce lieu et accepte les{" "}
                  <a
                    href="/charte"
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary hover:underline"
                  >
                    conditions d'utilisation
                  </a>
                  .
                </label>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-2">
              <Button variant="ghost" onClick={onClose} disabled={createClaim.isPending}>
                Annuler
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!accepted || !email || createClaim.isPending}
              >
                {createClaim.isPending && (
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                )}
                Envoyer le lien de vérification
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
