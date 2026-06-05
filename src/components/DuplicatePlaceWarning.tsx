import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, MapPin, ExternalLink } from "lucide-react";

type Match = {
  id: string;
  name: string;
  city: string | null;
  region: string | null;
  image: string | null;
  is_imported: boolean;
  claim_status: string;
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
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\b(le|la|les|l|du|de|des|d|un|une|saint|st)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokens(s: string): string[] {
  return normalize(s).split(" ").filter((t) => t.length >= 3);
}

export default function DuplicatePlaceWarning({ name, city, onDismiss, onBlockingChange }: Props) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    onBlockingChange?.(matches.length > 0 && !dismissed);
  }, [matches, dismissed, onBlockingChange]);

  useEffect(() => {
    setDismissed(false);
    const trimmed = name.trim();
    if (trimmed.length < 4) {
      setMatches([]);
      return;
    }

    const handle = setTimeout(async () => {
      const toks = tokens(trimmed);
      if (toks.length === 0) {
        setMatches([]);
        return;
      }

      // Build a broad ILIKE filter on each significant token
      const orFilter = toks
        .slice(0, 3)
        .map((t) => `name.ilike.%${t}%`)
        .join(",");

      const { data, error } = await supabase
        .from("places")
        .select("id, name, city, region, image, is_imported, claim_status")
        .or(orFilter)
        .limit(20);

      if (error || !data) {
        setMatches([]);
        return;
      }

      const normName = normalize(trimmed);
      const normCity = city ? normalize(city) : "";

      const scored = data
        .map((p: any) => {
          const candidate = normalize(p.name || "");
          const candTokens = tokens(p.name || "");
          const overlap = candTokens.filter((t) => toks.includes(t)).length;
          const sameCity = normCity && p.city && normalize(p.city) === normCity;
          const exact = candidate === normName;
          let score = overlap;
          if (exact) score += 5;
          if (sameCity) score += 2;
          return { place: p as Match, score };
        })
        .filter((x) => x.score >= 2)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map((x) => x.place);

      setMatches(scored);
    }, 400);

    return () => clearTimeout(handle);
  }, [name, city]);

  if (dismissed || matches.length === 0) return null;

  return (
    <div className="rounded-xl border border-soleil/40 bg-soleil/10 p-4 space-y-3">
      <div className="flex items-start gap-2">
        <AlertTriangle className="h-4 w-4 text-soleil shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">
            Un lieu similaire existe peut-être déjà
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Avant de créer un doublon, vérifiez s'il s'agit du vôtre — vous pourrez le
            revendiquer pour en devenir gestionnaire officiel·le.
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
                  {[p.city, p.region].filter(Boolean).join(", ") || "—"}
                </p>
              </div>
              <Link
                to={needsClaim ? `/habitat/${p.id}?claim=1` : `/habitat/${p.id}`}
                target="_blank"
                className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-1 shrink-0"
              >
                {needsClaim ? "Revendiquer" : "Voir"}
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => {
          setDismissed(true);
          onDismiss?.();
        }}
        className="text-xs text-muted-foreground hover:text-foreground underline"
      >
        Aucun de ces lieux — c'est bien un nouveau lieu
      </button>
    </div>
  );
}
