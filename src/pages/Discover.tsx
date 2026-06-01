import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import { Search, SlidersHorizontal, X, Loader2, MapPin, LayoutGrid, Map as MapIcon, ArrowUpDown } from "lucide-react";
import ListingCard from "@/components/ListingCard";
import { lazy, Suspense } from "react";
const ListingsMap = lazy(() => import("@/components/ListingsMap"));
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { useListings } from "@/hooks/use-listings";
import { useIsMobile } from "@/hooks/use-mobile";
import { LISTING_TYPE_LABELS } from "@/data/demo";

const LISTING_TYPES = Object.entries(LISTING_TYPE_LABELS);

// Thématiques regroupant les tags existants pour une UX plus lisible
const VALUE_THEMES = [
  {
    key: "ecology",
    label: "Écologie / Environnement",
    tags: ["Écologie", "Permaculture", "Agroécologie", "Sobriété", "Low-tech", "Résilience", "Autonomie alimentaire"],
  },
  {
    key: "community",
    label: "Partage / Communauté",
    tags: ["Famille", "Inclusion", "Artistes", "Seniors", "Bien-être"],
  },
  {
    key: "governance",
    label: "Gouvernance partagée",
    tags: ["Gouvernance partagée"],
  },
  {
    key: "learning",
    label: "Apprentissage / Formation",
    tags: ["Éducation alternative", "Spiritualité laïque"],
  },
  {
    key: "nature",
    label: "Nature / Territoire",
    tags: ["Permaculture", "Agroécologie", "Autonomie alimentaire", "Résilience"],
  },
] as const;
type ThemeKey = (typeof VALUE_THEMES)[number]["key"];

const SIZE_BUCKETS = [
  { key: "sm", label: "1–5 personnes (petit)", min: 1, max: 5 },
  { key: "md", label: "6–20 personnes (moyen)", min: 6, max: 20 },
  { key: "lg", label: "20+ personnes (grand)", min: 21, max: Infinity },
] as const;
type SizeKey = (typeof SIZE_BUCKETS)[number]["key"];

const SORT_OPTIONS = [
  { key: "relevance", label: "Pertinence" },
  { key: "recent", label: "Plus récents" },
] as const;
type SortKey = (typeof SORT_OPTIONS)[number]["key"];

const LS_KEY = "discover:filters:v2";

const normalize = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

const Discover = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const cityParam = searchParams.get("city") || "";
  const regionParam = searchParams.get("region") || "";
  const isMobile = useIsMobile();

  // Hydrate URL from localStorage once on mount if no filters in URL
  useEffect(() => {
    const hasAny =
      searchParams.get("type") ||
      searchParams.get("themes") ||
      searchParams.get("sizes") ||
      searchParams.get("sort");
    if (hasAny) return;
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as Record<string, string>;
      const sp = new URLSearchParams(searchParams);
      Object.entries(saved).forEach(([k, v]) => v && sp.set(k, v));
      setSearchParams(sp, { replace: true });
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // URL-persisted filters
  const typeFilter = searchParams.get("type") || "all";
  const selectedThemes = useMemo(
    () => (searchParams.get("themes") || "").split(",").filter(Boolean) as ThemeKey[],
    [searchParams]
  );
  const selectedSizes = useMemo(
    () => (searchParams.get("sizes") || "").split(",").filter(Boolean) as SizeKey[],
    [searchParams]
  );
  const sort = (searchParams.get("sort") || "relevance") as SortKey;

  // Persist to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(
        LS_KEY,
        JSON.stringify({
          type: typeFilter !== "all" ? typeFilter : "",
          themes: selectedThemes.join(","),
          sizes: selectedSizes.join(","),
          sort: sort !== "relevance" ? sort : "",
        })
      );
    } catch {}
  }, [typeFilter, selectedThemes, selectedSizes, sort]);

  const expandedTags = useMemo(() => {
    const set = new Set<string>();
    selectedThemes.forEach((k) => {
      VALUE_THEMES.find((t) => t.key === k)?.tags.forEach((tag) => set.add(tag));
    });
    return [...set];
  }, [selectedThemes]);

  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "map">("grid");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const { data: listings, isLoading } = useListings();

  const updateParams = (mut: (sp: URLSearchParams) => void) => {
    const sp = new URLSearchParams(searchParams);
    mut(sp);
    setSearchParams(sp, { replace: true });
  };

  const setTypeFilter = (key: string) =>
    updateParams((sp) => (key === "all" ? sp.delete("type") : sp.set("type", key)));

  const toggleTheme = (key: ThemeKey) =>
    updateParams((sp) => {
      const next = selectedThemes.includes(key)
        ? selectedThemes.filter((t) => t !== key)
        : [...selectedThemes, key];
      next.length ? sp.set("themes", next.join(",")) : sp.delete("themes");
    });

  const toggleSize = (key: SizeKey) =>
    updateParams((sp) => {
      const next = selectedSizes.includes(key)
        ? selectedSizes.filter((t) => t !== key)
        : [...selectedSizes, key];
      next.length ? sp.set("sizes", next.join(",")) : sp.delete("sizes");
    });

  const setSort = (key: SortKey) =>
    updateParams((sp) => (key === "relevance" ? sp.delete("sort") : sp.set("sort", key)));

  const clearAll = () =>
    updateParams((sp) => {
      sp.delete("type");
      sp.delete("themes");
      sp.delete("sizes");
      sp.delete("sort");
    });

  // Popular destinations
  const popularDestinations = useMemo(() => {
    const counts = new Map<string, number>();
    (listings || []).forEach((l: any) => {
      const key = l.places?.region || l.places?.country;
      if (key) counts.set(key, (counts.get(key) || 0) + 1);
    });
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name]) => name);
  }, [listings]);

  const setRegion = (region: string) =>
    updateParams((sp) => {
      sp.delete("city");
      regionParam === region ? sp.delete("region") : sp.set("region", region);
    });

  const matchesSize = (place: any) => {
    if (!selectedSizes.length) return true;
    const n = place?.inhabitants ?? 0;
    return selectedSizes.some((k) => {
      const b = SIZE_BUCKETS.find((s) => s.key === k)!;
      return n >= b.min && n <= b.max;
    });
  };

  const filtered = (listings || []).filter((l: any) => {
    const place = l.places;
    if (cityParam) {
      const c = normalize(cityParam);
      if (!normalize(place?.city || "").includes(c)) return false;
    } else if (regionParam) {
      const r = normalize(regionParam);
      if (
        !normalize(place?.region || "").includes(r) &&
        !normalize(place?.country || "").includes(r)
      )
        return false;
    }
    if (search) {
      const s = normalize(search);
      if (
        !normalize(l.title || "").includes(s) &&
        !normalize(place?.region || "").includes(s) &&
        !normalize(place?.city || "").includes(s) &&
        !normalize(place?.name || "").includes(s)
      )
        return false;
    }
    if (typeFilter && typeFilter !== "all" && l.listing_type !== typeFilter) return false;
    if (expandedTags.length > 0) {
      const placeValues: string[] = place?.values || [];
      if (!expandedTags.some((t) => placeValues.includes(t))) return false;
    }
    if (!matchesSize(place)) return false;
    return true;
  });

  // Sort: relevance score = |place.values ∩ selectedTags| * 3, then recency
  const sorted = useMemo(() => {
    const arr = [...filtered];
    if (sort === "recent" || expandedTags.length === 0) {
      arr.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
      return arr;
    }
    return arr
      .map((l: any) => {
        const pv: string[] = l.places?.values || [];
        const score = pv.filter((v) => expandedTags.includes(v)).length * 3;
        return { l, score };
      })
      .sort((a, b) => b.score - a.score || +new Date(b.l.created_at) - +new Date(a.l.created_at))
      .map((x) => x.l);
  }, [filtered, sort, expandedTags]);

  const activeDestination = cityParam || regionParam;
  const clearDestination = () =>
    updateParams((sp) => {
      sp.delete("city");
      sp.delete("region");
    });

  const count = sorted.length;
  const activeFilterCount =
    (typeFilter !== "all" ? 1 : 0) + selectedThemes.length + selectedSizes.length;

  const seoTitle = activeDestination
    ? `Séjours à ${activeDestination} — habitats participatifs | Casa Minga`
    : "Découvrir des séjours en habitat participatif | Casa Minga";
  const seoDesc = activeDestination
    ? `Découvrez ${count} séjour${count > 1 ? "s" : ""} en habitat participatif et écolieu à ${activeDestination}.`
    : "Parcourez tous les séjours proposés par les habitats participatifs et écolieux de la communauté Casa Minga.";

  // ─── Filters panel (reused in sidebar + drawer) ───
  const FiltersPanel = (
    <div className="space-y-6">
      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">Valeurs clés</span>
          {selectedThemes.length > 0 && (
            <button
              type="button"
              onClick={() => updateParams((sp) => sp.delete("themes"))}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Effacer
            </button>
          )}
        </div>
        <div className="space-y-1.5">
          {VALUE_THEMES.map((theme) => {
            const id = `theme-${theme.key}`;
            const checked = selectedThemes.includes(theme.key);
            return (
              <label
                key={theme.key}
                htmlFor={id}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted/50 cursor-pointer"
              >
                <Checkbox id={id} checked={checked} onCheckedChange={() => toggleTheme(theme.key)} />
                <span className="select-none">{theme.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">Taille de l'habitat</span>
          {selectedSizes.length > 0 && (
            <button
              type="button"
              onClick={() => updateParams((sp) => sp.delete("sizes"))}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Effacer
            </button>
          )}
        </div>
        <div className="space-y-1.5">
          {SIZE_BUCKETS.map((b) => {
            const id = `size-${b.key}`;
            const checked = selectedSizes.includes(b.key);
            return (
              <label
                key={b.key}
                htmlFor={id}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted/50 cursor-pointer"
              >
                <Checkbox id={id} checked={checked} onCheckedChange={() => toggleSize(b.key)} />
                <span className="select-none">{b.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      {activeFilterCount > 0 && (
        <Button variant="ghost" size="sm" onClick={clearAll} className="w-full">
          <X className="mr-1 h-3 w-3" /> Tout réinitialiser
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen">
      <SEO
        title={seoTitle}
        description={seoDesc}
        canonical={activeDestination ? `/discover?city=${encodeURIComponent(activeDestination)}` : "/discover"}
      />
      <Navbar />
      <div className="container py-8 px-4 md:px-8">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-serif text-3xl md:text-4xl text-foreground">
              Maisons &amp; appartements à échanger
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Des hôtes ouvrent leur maison ou leur chambre dans des lieux collectifs.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="rounded-full text-xs">
              {count} séjour{count > 1 ? "s" : ""}
              {activeDestination && <> · {activeDestination}</>}
            </Badge>
            <div className="inline-flex rounded-full border bg-background p-0.5">
              <button
                type="button"
                onClick={() => setView("grid")}
                aria-pressed={view === "grid"}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  view === "grid" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" /> Grille
              </button>
              <button
                type="button"
                onClick={() => setView("map")}
                aria-pressed={view === "map"}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  view === "map" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <MapIcon className="h-3.5 w-3.5" /> Carte
              </button>
            </div>
          </div>
        </div>

        {activeDestination && (
          <div className="mt-3">
            <button
              type="button"
              onClick={clearDestination}
              className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 pl-3 pr-2 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
            >
              <MapPin className="h-3.5 w-3.5" />
              {activeDestination}
              <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary/15">
                <X className="h-3 w-3" />
              </span>
            </button>
          </div>
        )}

        {/* Type chips */}
        <div className="mt-6 -mx-4 md:mx-0 overflow-x-auto px-4 md:px-0 scrollbar-none">
          <div className="flex gap-2 w-max md:w-auto md:flex-wrap">
            <button
              type="button"
              onClick={() => setTypeFilter("all")}
              className={`whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                typeFilter === "all"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-foreground border-border hover:border-primary/40"
              }`}
            >
              Tous
            </button>
            {LISTING_TYPES.map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setTypeFilter(key)}
                className={`whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                  typeFilter === key
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-foreground border-border hover:border-primary/40"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Popular destinations */}
        {popularDestinations.length > 0 && (
          <div className="mt-3 -mx-4 md:mx-0 overflow-x-auto px-4 md:px-0 scrollbar-none">
            <div className="flex items-center gap-2 w-max md:w-auto md:flex-wrap">
              <span className="text-[0.7rem] uppercase tracking-wider text-muted-foreground mr-1 shrink-0">
                Destinations
              </span>
              {popularDestinations.map((dest) => {
                const active = regionParam === dest;
                return (
                  <button
                    key={dest}
                    type="button"
                    onClick={() => setRegion(dest)}
                    className={`whitespace-nowrap inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs transition-colors ${
                      active
                        ? "bg-foreground text-background border-foreground"
                        : "bg-background text-foreground border-border hover:border-foreground/40"
                    }`}
                  >
                    <MapPin className="h-3 w-3" />
                    {dest}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Search + (mobile) Filters trigger + Sort */}
        <div className="mt-4 flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Affiner par nom, ville, lieu…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-10 text-sm"
            />
          </div>

          {isMobile && (
            <Drawer open={filtersOpen} onOpenChange={setFiltersOpen}>
              <DrawerTrigger asChild>
                <Button variant={activeFilterCount > 0 ? "secondary" : "outline"} className="h-10">
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  Filtres
                  {activeFilterCount > 0 && (
                    <Badge variant="default" className="ml-2 h-5 rounded-full px-1.5 text-[10px]">
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Filtres</DrawerTitle>
                </DrawerHeader>
                <div className="px-4 pb-2 max-h-[60vh] overflow-y-auto">{FiltersPanel}</div>
                <DrawerFooter className="flex-row gap-2">
                  <Button variant="ghost" onClick={clearAll} className="flex-1">
                    Réinitialiser
                  </Button>
                  <DrawerClose asChild>
                    <Button className="flex-1">Voir {count} séjours</Button>
                  </DrawerClose>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          )}

          <div className="inline-flex items-center gap-1 rounded-md border bg-background h-10 px-1">
            <ArrowUpDown className="ml-1 h-3.5 w-3.5 text-muted-foreground" />
            {SORT_OPTIONS.map((o) => (
              <button
                key={o.key}
                type="button"
                onClick={() => setSort(o.key)}
                className={`rounded-sm px-2 py-1 text-xs transition-colors ${
                  sort === o.key
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        {/* Desktop: sticky sidebar + results, Mobile: results only (filters in drawer) */}
        <div className="mt-8 grid gap-6 md:grid-cols-[260px_1fr]">
          {!isMobile && (
            <aside className="hidden md:block">
              <div className="sticky top-20 rounded-xl border bg-card p-4">
                <div className="mb-3 flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
                  <h2 className="text-sm font-medium">Filtres</h2>
                  {activeFilterCount > 0 && (
                    <Badge variant="default" className="ml-auto h-5 rounded-full px-1.5 text-[10px]">
                      {activeFilterCount}
                    </Badge>
                  )}
                </div>
                {FiltersPanel}
              </div>
            </aside>
          )}

          <div>
            {isLoading ? (
              <div className="mt-8 flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : count > 0 ? (
              view === "map" ? (
                <Suspense fallback={<div className="flex h-[70vh] items-center justify-center rounded-xl border"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>}>
                  <ListingsMap listings={sorted} />
                </Suspense>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {sorted.map((l: any) => (
                    <ListingCard key={l.id} listing={l} />
                  ))}
                </div>
              )
            ) : (
              <div className="mt-8 text-center">
                <Search className="mx-auto mb-4 h-12 w-12 text-muted-foreground/40" />
                <h3 className="text-xl text-foreground">Aucun séjour trouvé</h3>
                <p className="mt-2 text-muted-foreground">Essayez d'élargir vos critères.</p>
                <Button variant="outline" className="mt-4" onClick={() => { setSearch(""); clearAll(); clearDestination(); }}>
                  Réinitialiser les filtres
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Discover;
