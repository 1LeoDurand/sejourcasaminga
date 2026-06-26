import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Sparkles } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { suggestPointsPerNight, priceBracket } from "@/lib/points-valuation";

interface PointsValueFieldProps {
  capacity: number;
  listingType: string;
  amenitiesCount: number;
  attractionLevel?: string | null;
  /** Current chosen points/night. */
  value: number;
  onChange: (value: number) => void;
}

/**
 * Host-facing points/night editor. Shows the SQL-mirrored suggested value and
 * constrains the final price to ±30 % around it (the host can only pick inside
 * that bracket). The suggestion recomputes live as capacity/type/place change.
 */
const PointsValueField = ({
  capacity,
  listingType,
  amenitiesCount,
  attractionLevel,
  value,
  onChange,
}: PointsValueFieldProps) => {
  const { t } = useTranslation();

  const suggested = useMemo(
    () => suggestPointsPerNight({ capacity, listingType, amenitiesCount, attractionLevel }),
    [capacity, listingType, amenitiesCount, attractionLevel],
  );
  const { min, max } = useMemo(() => priceBracket(suggested), [suggested]);

  // Keep the chosen value inside the (possibly shifted) bracket. When the value
  // is outside the range — e.g. on first render or after capacity/type changed —
  // snap it back; this settles in one pass (no loop) since the clamp lands inside.
  useEffect(() => {
    if (value < min || value > max) {
      onChange(Math.min(Math.max(value || suggested, min), max));
    }
  }, [min, max, value, suggested, onChange]);

  const clamped = Math.min(Math.max(value || suggested, min), max);
  const pct = suggested > 0 ? Math.round(((clamped - suggested) / suggested) * 100) : 0;
  const sign = pct > 0 ? "+" : "";

  return (
    <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary shrink-0" />
        <p className="text-sm font-medium text-foreground">
          {t("points.suggestedLabel", { value: suggested })}
        </p>
      </div>

      <p className="text-xs text-muted-foreground">{t("points.explain")}</p>

      <div className="flex items-center gap-3">
        <Slider
          value={[clamped]}
          min={min}
          max={max}
          step={5}
          onValueChange={(v) => onChange(v[0])}
          className="flex-1"
          aria-label={t("points.yourPrice")}
        />
        <div className="flex items-center gap-1.5 shrink-0">
          <Input
            type="number"
            min={min}
            max={max}
            step={5}
            value={clamped}
            onChange={(e) => {
              const n = parseInt(e.target.value) || min;
              onChange(Math.min(Math.max(n, min), max));
            }}
            className="w-20"
          />
          <span className="text-xs text-muted-foreground whitespace-nowrap">{t("points.gpPerNight")}</span>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        {t("points.delta", { suggested, value: clamped, sign, pct })}
        <span className="mx-1.5 text-muted-foreground/50">·</span>
        {t("points.range", { min, max })}
      </p>
    </div>
  );
};

export default PointsValueField;
