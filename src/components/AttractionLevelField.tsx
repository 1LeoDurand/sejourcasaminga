import { useTranslation } from "react-i18next";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const ATTRACTION_LEVELS = ["standard", "near_site", "prime"] as const;
export type AttractionLevel = (typeof ATTRACTION_LEVELS)[number];

interface AttractionLevelFieldProps {
  value: string;
  onChange: (value: AttractionLevel) => void;
}

/**
 * Place attractiveness selector. Manual tag (admin-moderable later) feeding the
 * points-valuation multiplier (standard 1.0 / near_site 1.15 / prime 1.3).
 */
const AttractionLevelField = ({ value, onChange }: AttractionLevelFieldProps) => {
  const { t } = useTranslation();
  return (
    <div>
      <Label>{t("attraction.label")}</Label>
      <Select value={value || "standard"} onValueChange={(v) => onChange(v as AttractionLevel)}>
        <SelectTrigger><SelectValue placeholder={t("attraction.placeholder")} /></SelectTrigger>
        <SelectContent>
          {ATTRACTION_LEVELS.map((lvl) => (
            <SelectItem key={lvl} value={lvl}>{t(`attraction.${lvl}`)}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="mt-1 text-xs text-muted-foreground">{t("attraction.help")}</p>
    </div>
  );
};

export default AttractionLevelField;
