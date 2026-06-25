import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, Star } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { useCreateHostReview } from "@/hooks/use-host-reviews";

const MAX_TEXT = 300;

/** Five-star picker for one criterion. */
function StarPicker({
  value,
  onChange,
  label,
}: {
  value: number | null;
  onChange: (n: number | null) => void;
  label: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <Label className="text-sm">{label}</Label>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(value === n ? null : n)}
            className="p-0.5"
            aria-label={`${n}/5`}
          >
            <Star
              className={`h-5 w-5 transition-colors ${
                value !== null && n <= value ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Host → guest review dialog, shown after a completed stay.
 * Read/write `host_reviews`; no migration. If the insert is blocked by RLS,
 * the error is surfaced via toast and noted by the builder in RAPPORT.md.
 */
export default function HostReviewDialog({
  open,
  onOpenChange,
  hostUserId,
  guestUserId,
  guestName,
  stayRequestId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  hostUserId: string;
  guestUserId: string;
  guestName: string;
  stayRequestId: string;
}) {
  const { t } = useTranslation();
  const createReview = useCreateHostReview();

  const [rating, setRating] = useState<number | null>(null);
  const [communication, setCommunication] = useState<number | null>(null);
  const [respect, setRespect] = useState<number | null>(null);
  const [text, setText] = useState("");
  const [isPublic, setIsPublic] = useState(true);

  const handleSubmit = async () => {
    try {
      await createReview.mutateAsync({
        host_user_id: hostUserId,
        guest_user_id: guestUserId,
        stay_request_id: stayRequestId,
        rating,
        text: text.trim(),
        communication_rating: communication,
        respect_rating: respect,
        is_public: isPublic,
      });
      toast({ title: t("hostReview.success") });
      onOpenChange(false);
    } catch (e: any) {
      toast({ title: t("hostReview.error"), description: e.message, variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("hostReview.title", { name: guestName })}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <StarPicker value={rating} onChange={setRating} label={t("hostReview.overall")} />
          <StarPicker value={communication} onChange={setCommunication} label={t("hostReview.communication")} />
          <StarPicker value={respect} onChange={setRespect} label={t("hostReview.respect")} />

          <div className="space-y-1.5">
            <Label htmlFor="host-review-text" className="text-sm">{t("hostReview.textLabel")}</Label>
            <Textarea
              id="host-review-text"
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, MAX_TEXT))}
              placeholder={t("hostReview.textPlaceholder")}
              rows={4}
            />
            <p className="text-right text-xs text-muted-foreground">{text.length}/{MAX_TEXT}</p>
          </div>

          <label className="flex items-start gap-2 text-sm">
            <Checkbox checked={isPublic} onCheckedChange={(v) => setIsPublic(v === true)} className="mt-0.5" />
            <span className="text-muted-foreground">{t("hostReview.public")}</span>
          </label>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t("hostReview.cancel")}</Button>
          <Button onClick={handleSubmit} disabled={createReview.isPending || text.trim().length === 0}>
            {createReview.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t("hostReview.submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
