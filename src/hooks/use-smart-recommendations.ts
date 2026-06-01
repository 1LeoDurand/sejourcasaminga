import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUserPreferences } from "./use-user-preferences";

const TTL_MS = 24 * 60 * 60 * 1000;

export type ScoredPlace = {
  id: string;
  name: string;
  city: string | null;
  region: string | null;
  type: string | null;
  image: string | null;
  values: string[];
  score: number;
  matchPct: number;
};

type CacheShape = { ts: number; data: ScoredPlace[] };

const readCache = (userId: string): ScoredPlace[] | null => {
  try {
    const raw = localStorage.getItem(`recs_${userId}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CacheShape;
    if (Date.now() - parsed.ts > TTL_MS) return null;
    return parsed.data;
  } catch {
    return null;
  }
};

const writeCache = (userId: string, data: ScoredPlace[]) => {
  try {
    localStorage.setItem(`recs_${userId}`, JSON.stringify({ ts: Date.now(), data }));
  } catch {}
};

export function useSmartRecommendations(userId: string | undefined, limit = 6) {
  const { data: prefs } = useUserPreferences(userId);
  const [recs, setRecs] = useState<ScoredPlace[] | null>(null);
  const [loading, setLoading] = useState(false);

  const prefsKey = useMemo(
    () =>
      prefs
        ? `${(prefs.preferred_values || []).join(",")}|${(prefs.preferred_regions || []).join(
            ","
          )}|${(prefs.preferred_habitat_types || []).join(",")}`
        : "",
    [prefs]
  );

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    // Try cache first
    const cached = readCache(userId);
    if (cached && cached.length) {
      setRecs(cached);
    }

    // If no prefs, still fall back to recent/popular places (no scoring)
    const userValues = prefs?.preferred_values || [];
    const userRegions = prefs?.preferred_regions || [];
    const userTypes = prefs?.preferred_habitat_types || [];

    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("places")
        .select("id,name,city,region,type,image,images,values")
        .eq("published", true)
        .eq("is_visible", true)
        .limit(60);
      if (error || cancelled) {
        setLoading(false);
        return;
      }

      const scored: ScoredPlace[] = (data || []).map((p: any) => {
        const pv: string[] = p.values || [];
        const valueOverlap = pv.filter((v) => userValues.includes(v)).length;
        const regionMatch = userRegions.length && userRegions.includes(p.region) ? 1 : 0;
        const typeMatch = userTypes.length && userTypes.includes(p.type) ? 1 : 0;
        const score = valueOverlap * 3 + regionMatch + typeMatch;
        const maxValueScore = Math.max(1, userValues.length);
        const matchPct = Math.min(100, Math.round((valueOverlap / maxValueScore) * 100));
        return {
          id: p.id,
          name: p.name,
          city: p.city,
          region: p.region,
          type: p.type,
          image: (p.images && p.images[0]) || p.image || null,
          values: pv,
          score,
          matchPct,
        };
      });

      const hasPrefs = userValues.length + userRegions.length + userTypes.length > 0;
      const sorted = hasPrefs
        ? scored.filter((s) => s.score > 0).sort((a, b) => b.score - a.score)
        : scored;

      const top = sorted.slice(0, limit);
      if (!cancelled) {
        setRecs(top);
        writeCache(userId, top);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, prefsKey, limit]);

  return { data: recs || [], isLoading: loading && !recs, hasPrefs: !!prefs };
}
