import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, MapPin, ExternalLink, Search } from "lucide-react";

type Match = {
  id: string;
  name: string;
  city: string | null;
  region: string | null;
  image: string | null;
  is_imported: boolean;
  claim_status: string;
  /** Strong = exact name OR (≥2 shared tokens AND same city). Non-dismissable. */
  strong: boolean;
};

interface Props {
  name: string;
  city?: string;
  /** Called when the user explicitly confirms it's NOT one of the suggested places. */
  onDismiss?: () => void;
  /** Emits true while unresolved similar places exist (used to block submission). */
  onBlockingChange?: (blocking: boolean) => void;
}

/**
 * Normalize a string for loose comparison: lowercase, strip accents & punctuation,
 * remove common stopwords ("le", "la", "les", "du", "de", "des", "saint", "st").
 */
function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\b(le|la|les|l|du|de|des|d|un|une|saint|st)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokens(s: string): string[] {
  return normalize(s).split(" ").filter((t) => t.length >= 3);
}

const SELECT_COLS = "id, name, city, region, image, is_imported, claim_status";

export default function DuplicatePlaceWarning({ name, city, onDismiss, onBlockingChange }: Props) {
  const { t } = useTranslation();
  const [matches, setMatches] = useState<Match[]>([]);
  const [cityOtherCount, setCityOtherCount] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  const hasStrong = matches.some((m) => m.strong);

  // Strong matches always block. Medium matches block until the user dismisses them.
  useEffect(() => {
    const blocking = matches.length > 0 && (hasStrong || !dismissed);
    onBlockingChange?.(blocking);
  }, [matches, hasStrong, dismissed, onBlockingChange]);

  useEffect(() => {
    setDismissed(false);
    const trimmed = name.trim();
    if (trimmed.length < 4) {
      setMatches([]);
      setCityOtherCount(0);
      return;
    }

    const handle = setTimeout(async () => {
      const toks = tokens(trimmed);
      if (toks.length === 0) {
        setMatches([]);
        setCityOtherCount(0);
        return;
      }

      const cityRaw = city?.trim() || "";

      // Two search axes: by name tokens AND by city (item 7.1) — merged & deduped by id.
      const orFilter = toks.slice(0, 3).map((tok) => `name.ilike.%${tok}%`).join(",");
      const queries = [
        supabase.from("places").select(SELECT_COLS).or(orFilter).limit(20),
      ];
      if (cityRaw) {
        queries.push(
          supabase.from("places").select(SELECT_COLS).ilike("city", `%${cityRaw}%`).limit(20),
        );
      }

      const results = await Promise.all(queries);
      const rowsById = new Map<string, any>();
      for (const r of results) {
        if (r.error || !r.data) continue;
        for (const p of r.data as any[]) rowsById.set(p.id, p);
      }
      const rows = [...rowsById.values()];

      const normName = normalize(trimmed);
      const normCity = cityRaw ? normalize(cityRaw) : "";

      const scored = rows.map((p: any) => {
        const candidate = normalize(p.name || "");
        const candTokens = tokens(p.name || "");
        const overlap = candTokens.filter((tok) => toks.includes(tok)).length;
        const sameCity = !!(normCity && p.city && normalize(p.city) === normCity);
        const exact = candidate.length > 0 && candidate === normName;
        let score = overlap;
        if (exact) score += 5;
        if (sameCity) score += 2;
        const nameMatch = exact || overlap >= 1;
        const strong = exact || (overlap >= 2 && sameCity);
        return { p, score, sameCity, overlap, nameMatch, strong };
      });

      // Match cards = name-based candidates above threshold (excludes pure-city rows).
      const top = scored
        .filter((x) => x.nameMatch && x.score >= 2)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map((x) => ({ ...(x.p as Match), strong: x.strong }));
      setMatches(top);

      // Item 7.3 — places in the same city with NO name match, not already shown.
      if (normCity) {
        const shownIds = new Set(top.map((m) => m.id));
        setCityOtherCount(scored.filter((x) => x.sameCity && !x.nameMatch && !shownIds.has(x.p.id)).length);
      } else {
        setCityOtherCount(0);
      }
    }, 400);

    return () => clearTimeout(handle);
  }, [name, city]);

  const showWarning = matches.length > 0 && (hasStrong || !dismissed);
  const cityTrimmed = city?.trim() || "";
  const showCityOnlyHint = matches.length === 0 && cityOtherCount > 0 && cityTrimmed.length > 0;

  if (!showWarning && !showCityOnlyHint) return null;

  // City link with the discreet hint line (items 7.3).
  const cityHint = cityTrimmed && cityOtherCount > 0 && (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 pt-1 text-xs text-muted-foreground">
      <span className="inline-flex items-center gap-1">
        <Search className="h-3 w-3 shrink-0" />
        {t("duplicatePlace.cityHint", { count: cityOtherCount, city: cityTrimmed })}
      </span>
      <Link
        to={`/discover?city=${encodeURIComponent(cityTrimmed)}`}
        target="_blank"
        className="font-medium text-primary hover:underline"
      >
        {t("duplicatePlace.cityLink", { city: cityTrimmed })}
      </Link>
    </div>
  );

  // Light, non-blocking hint when only same-city (different name) places exist.
  if (showCityOnlyHint) {
    return (
      <div className="rounded-xl border bg-muted/40 p-3">
        {cityHint}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-soleil/40 bg-soleil/10 p-4 space-y-3">
      <div className="flex items-start gap-2">
        <AlertTriangle className="h-4 w-4 text-soleil shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">
            {hasStrong ? t("duplicatePlace.strongTitle") : t("duplicatePlace.mediumTitle")}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {hasStrong ? t("duplicatePlace.strongBody") : t("duplicatePlace.mediumBody")}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {matches.map((p) => {
          const needsClaim = p.is_imported && p.claim_status !== "claimed";
          return (
            <div
              key={p.id}
              className="flex items-center gap-3 rounded-lg bg-background border p-2.5"
            >
              <div className="h-12 w-12 rounded-md bg-muted overflow-hidden shrink-0">
                {p.image && (
                  <img src={p.image} alt="" className="h-full w-full object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {[p.city, p.region].filter(Boolean).join(", ") || t("duplicatePlace.noLocation")}
                </p>
              </div>
              <Link
                to={needsClaim ? `/habitat/${p.id}?claim=1` : `/habitat/${p.id}`}
                target="_blank"
                className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-1 shrink-0"
              >
                {needsClaim ? t("duplicatePlace.claim") : t("duplicatePlace.view")}
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          );
        })}
      </div>

      {cityHint}

      {/* Medium matches can be dismissed; strong matches cannot (must join/claim or rename). */}
      {!hasStrong && (
        <button
          type="button"
          onClick={() => {
            setDismissed(true);
            onDismiss?.();
          }}
          className="text-xs text-muted-foreground hover:text-foreground underline"
        >
          {t("duplicatePlace.dismiss")}
        </button>
      )}
    </div>
  );
}
