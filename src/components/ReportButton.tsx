import { useState } from "react";
import { Flag, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateReport, REPORT_REASONS, type ReportTargetType } from "@/hooks/use-reports";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

interface ReportButtonProps {
  targetType: ReportTargetType;
  targetId: string;
  /** "icon" = juste l'icône, "text" = lien texte discret */
  variant?: "icon" | "text";
}

export default function ReportButton({ targetType, targetId, variant = "text" }: ReportButtonProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const createReport = useCreateReport();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !reason) return;
    try {
      await createReport.mutateAsync({
        reporter_user_id: user.id,
        target_type: targetType,
        target_id: targetId,
        reason,
        details: details.trim() || undefined,
        reporter_name: (user.user_metadata as any)?.full_name || user.email || undefined,
      });
      toast({ title: "Signalement envoyé", description: "Merci, notre équipe va examiner ce contenu." });
      setOpen(false);
      setReason(""); setDetails("");
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    }
  };

  if (!user) {
    return (
      <Link to="/auth" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
        <Flag className="h-3 w-3" /> Signaler
      </Link>
    );
  }

  return (
    <>
      {variant === "icon" ? (
        <button
          onClick={() => setOpen(true)}
          className="rounded-md p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          aria-label="Signaler ce contenu"
        >
          <Flag className="h-4 w-4" />
        </button>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
        >
          <Flag className="h-3 w-3" /> Signaler
        </button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Signaler ce contenu</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div>
              <Label className="mb-2 block">Raison du signalement *</Label>
              <div className="space-y-2">
                {REPORT_REASONS.map((r) => (
                  <label key={r.value} className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                    reason === r.value ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                  }`}>
                    <input
                      type="radio"
                      name="reason"
                      value={r.value}
                      checked={reason === r.value}
                      onChange={() => setReason(r.value)}
                      className="sr-only"
                    />
                    <div className={`h-4 w-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
                      reason === r.value ? "border-primary" : "border-border"
                    }`}>
                      {reason === r.value && <div className="h-2 w-2 rounded-full bg-primary" />}
                    </div>
                    <span className="text-sm text-foreground">{r.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="report-details">Détails supplémentaires (optionnel)</Label>
              <Textarea
                id="report-details"
                value={details}
                onChange={(e) => setDetails(e.target.value.slice(0, 500))}
                placeholder="Décrivez le problème…"
                rows={3}
                maxLength={500}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground text-right mt-1">{details.length}/500</p>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
              <Button type="submit" variant="destructive" disabled={!reason || createReport.isPending}>
                {createReport.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Envoyer le signalement
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
