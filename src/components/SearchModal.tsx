import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Search, X, Compass, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePlaces } from "@/hooks/use-places";
import { cn } from "@/lib/utils";

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

type Suggestion = {
  kind: "city" | "region";
  label: string;
  sublabel?: string;
  count: number;
};

const normalize = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

const SearchModal = ({ open, onClose }: SearchModalProps) => {
  const navigate = useNavigate();
  const { data: places, isLoading } = usePlaces();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input + lock scroll when open
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => inputRef.current?.focus(), 50);
    document.body.style.overflow = "hidden";
    return () => {
      clearTimeout(t);
      document.body.style.overflow = "";
    };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Aggregate cities and regions from places
  const { cities, regions } = useMemo(() => {
    const cityMap = new Map<string, { label: string; region?: string; count: number }>();
    const regionMap = new Map<string, { label: string; count: number }>();
    (places || []).forEach((p: any) => {
      if (p.city) {
        const key = normalize(p.city);
        const ex = cityMap.get(key);
        cityMap.set(key, {
          label: p.city,
          region: p.region || ex?.region,
          count: (ex?.count || 0) + 1,
        });
      }
      if (p.region) {
        const key = normalize(p.region);
        const ex = regionMap.get(key);
        regionMap.set(key, { label: p.region, count: (ex?.count || 0) + 1 });
      }
    });
    return { cities: Array.from(cityMap.values()), regions: Array.from(regionMap.values()) };
  }, [places]);

  const suggestions: Suggestion[] = useMemo(() => {
    const q = normalize(query);
    const cityItems: Suggestion[] = cities
      .filter((c) => !q || normalize(c.label).includes(q))
      .map((c) => ({ kind: "city", label: c.label, sublabel: c.region, count: c.count }));
    const regionItems: Suggestion[] = regions
      .filter((r) => !q || normalize(r.label).includes(q))
      .map((r) => ({ kind: "region", label: r.label, count: r.count }));

    // Sort by relevance (startsWith first), then alpha
    const sortFn = (a: Suggestion, b: Suggestion) => {
      const ax = q && normalize(a.label).startsWith(q) ? 0 : 1;
      const bx = q && normalize(b.label).startsWith(q) ? 0 : 1;
      if (ax !== bx) return ax - bx;
      return a.label.localeCompare(b.label, "fr");
    };
    return [...cityItems.sort(sortFn), ...regionItems.sort(sortFn)];
  }, [cities, regions, query]);

  const popularCities = useMemo(
    () =>
      [...cities].sort((a, b) => b.count - a.count).slice(0, 6),
    [cities]
  );

  const handleSelect = (s: Suggestion) => {
    const param = s.kind === "city" ? "city" : "region";
    navigate(`/discover?${param}=${encodeURIComponent(s.label)}`);
    onClose();
    setQuery("");
  };

  const handleSubmitFreeText = () => {
    const q = query.trim();
    if (!q) return;
    navigate(`/discover?city=${encodeURIComponent(q)}`);
    onClose();
    setQuery("");
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-background animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-label="Recherche d'un lieu"
    >
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <div className="flex items-center gap-2 px-3 py-3 md:px-5 md:py-4 max-w-3xl mx-auto w-full">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="shrink-0 h-10 w-10 rounded-full"
              aria-label="Fermer la recherche"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>

            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <input
                ref={inputRef}
                type="search"
                inputMode="search"
                enterKeyHint="search"
                autoComplete="off"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmitFreeText()}
                placeholder="Dans quelle ville souhaitez-vous séjourner ?"
                className={cn(
                  "w-full h-12 rounded-full border border-input bg-card pl-10 pr-10",
                  "text-[0.95rem] text-foreground placeholder:text-muted-foreground/80",
                  "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40",
                  "transition-shadow shadow-sm"
                )}
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    inputRef.current?.focus();
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
                  aria-label="Effacer la recherche"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          <div className="max-w-3xl mx-auto px-3 md:px-5 py-4 pb-24">
            {isLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : query.trim() === "" ? (
              <>
                <h3 className="px-3 mb-2 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Destinations populaires
                </h3>
                <ul className="rounded-2xl border bg-card overflow-hidden divide-y">
                  {popularCities.length === 0 ? (
                    <li className="px-4 py-6 text-sm text-muted-foreground text-center">
                      Aucune destination disponible pour l'instant.
                    </li>
                  ) : (
                    popularCities.map((c) => (
                      <li key={c.label}>
                        <button
                          type="button"
                          onClick={() =>
                            handleSelect({ kind: "city", label: c.label, sublabel: c.region, count: c.count })
                          }
                          className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-muted/50 active:bg-muted transition-colors"
                        >
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <Compass className="h-4 w-4" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-medium text-foreground truncate">
                              {c.label}
                            </span>
                            {c.region && (
                              <span className="block text-xs text-muted-foreground truncate">
                                {c.region}
                              </span>
                            )}
                          </span>
                          <span className="text-[0.7rem] text-muted-foreground shrink-0">
                            {c.count} lieu{c.count > 1 ? "x" : ""}
                          </span>
                        </button>
                      </li>
                    ))
                  )}
                </ul>
              </>
            ) : suggestions.length === 0 ? (
              <div className="text-center py-12 px-4">
                <Search className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
                <p className="text-sm text-foreground font-medium">Aucune destination trouvée</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Appuyez sur Entrée pour rechercher « {query.trim()} » quand même.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 rounded-full"
                  onClick={handleSubmitFreeText}
                >
                  Rechercher « {query.trim()} »
                </Button>
              </div>
            ) : (
              <ul className="rounded-2xl border bg-card overflow-hidden divide-y">
                {suggestions.slice(0, 30).map((s, i) => (
                  <li key={`${s.kind}-${s.label}-${i}`}>
                    <button
                      type="button"
                      onClick={() => handleSelect(s)}
                      className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-muted/50 active:bg-muted transition-colors"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground/70">
                        {s.kind === "city" ? <MapPin className="h-4 w-4" /> : <Compass className="h-4 w-4" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium text-foreground truncate">
                          {s.label}
                        </span>
                        <span className="block text-xs text-muted-foreground truncate">
                          {s.kind === "city"
                            ? s.sublabel || "Ville"
                            : "Région"}
                        </span>
                      </span>
                      <span className="text-[0.7rem] text-muted-foreground shrink-0">
                        {s.count} lieu{s.count > 1 ? "x" : ""}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
