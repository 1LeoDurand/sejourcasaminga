import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { MapPin, CalendarDays, Camera, Filter } from "lucide-react";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";

type ActivityType = "new_habitat" | "event" | "story";

interface ActivityItem {
  id: string;
  type: ActivityType;
  created_at: string;
  payload: any;
}

const TYPE_META: Record<ActivityType, { label: string; icon: any; tone: string }> = {
  new_habitat: { label: "Nouveaux habitats", icon: MapPin, tone: "bg-primary/10 text-primary" },
  event:       { label: "Événements",        icon: CalendarDays, tone: "bg-emerald-500/10 text-emerald-700" },
  story:       { label: "Stories",           icon: Camera, tone: "bg-rose-500/10 text-rose-700" },
};

const RANGE_OPTIONS = [
  { value: 7,  label: "7 jours" },
  { value: 30, label: "30 jours" },
  { value: 90, label: "90 jours" },
];

function timeAgo(iso: string) {
  try { return formatDistanceToNow(new Date(iso), { addSuffix: true, locale: fr }); }
  catch { return ""; }
}

function useActivityFeed(types: ActivityType[], days: number) {
  return useQuery({
    queryKey: ["activity-feed", [...types].sort().join(","), days],
    queryFn: async (): Promise<ActivityItem[]> => {
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
      const items: ActivityItem[] = [];

      if (types.includes("new_habitat")) {
        const { data } = await supabase
          .from("places")
          .select("id, slug, name, type, region, image, created_at")
          .eq("published", true)
          .eq("is_visible", true)
          .gte("created_at", since)
          .order("created_at", { ascending: false })
          .limit(40);
        (data ?? []).forEach((p: any) =>
          items.push({ id: `h-${p.id}`, type: "new_habitat", created_at: p.created_at, payload: p })
        );
      }

      if (types.includes("event")) {
        const { data } = await supabase
          .from("habitat_events")
          .select("id, title, description, event_type, date_start, place_id, places:place_id(name, slug, region, image)")
          .eq("is_public", true)
          .gte("created_at", since)
          .order("created_at", { ascending: false })
          .limit(40);
        (data ?? []).forEach((e: any) =>
          items.push({ id: `e-${e.id}`, type: "event", created_at: e.date_start, payload: e })
        );
      }

      if (types.includes("story")) {
        const { data } = await supabase
          .from("stay_reviews")
          .select("id, text, photos_urls, rating, created_at, user_id, place_id, places:place_id(name, slug, region), profiles:user_id(display_name, avatar_url)")
          .eq("is_public", true)
          .eq("approved_by_habitat", true)
          .gte("created_at", since)
          .order("created_at", { ascending: false })
          .limit(40);
        (data ?? []).forEach((r: any) =>
          items.push({ id: `s-${r.id}`, type: "story", created_at: r.created_at, payload: r })
        );
      }

      return items.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
    },
  });
}

const TypeBadge = ({ type }: { type: ActivityType }) => {
  const meta = TYPE_META[type];
  const Icon = meta.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${meta.tone}`}>
      <Icon className="h-3.5 w-3.5" />
      {meta.label}
    </span>
  );
};

const FeedCard = ({ item }: { item: ActivityItem }) => {
  const { type, payload, created_at } = item;

  if (type === "new_habitat") {
    return (
      <article className="overflow-hidden rounded-xl border bg-card">
        {payload.image && (
          <Link to={`/habitat/${payload.slug || payload.id}`} className="block">
            <img src={payload.image} alt={payload.name} loading="lazy" className="h-56 w-full object-cover" />
          </Link>
        )}
        <div className="space-y-2 p-5">
          <div className="flex items-center justify-between gap-3">
            <TypeBadge type={type} />
            <span className="text-xs text-muted-foreground">{timeAgo(created_at)}</span>
          </div>
          <h3 className="font-serif text-lg text-foreground">
            <Link to={`/habitat/${payload.slug || payload.id}`} className="hover:text-primary">
              📍 {payload.name} <span className="text-muted-foreground font-sans text-sm">vient de rejoindre Casa Minga</span>
            </Link>
          </h3>
          <p className="text-sm text-muted-foreground">
            {[payload.type, payload.region].filter(Boolean).join(" · ")}
          </p>
          <Button asChild variant="outline" size="sm" className="mt-2">
            <Link to={`/habitat/${payload.slug || payload.id}`}>Découvrir</Link>
          </Button>
        </div>
      </article>
    );
  }

  if (type === "event") {
    const placeName = payload.places?.name ?? "Casa Minga";
    const placeSlug = payload.places?.slug;
    return (
      <article className="overflow-hidden rounded-xl border bg-card">
        {payload.places?.image && (
          <img src={payload.places.image} alt={placeName} loading="lazy" className="h-44 w-full object-cover" />
        )}
        <div className="space-y-2 p-5">
          <div className="flex items-center justify-between gap-3">
            <TypeBadge type={type} />
            <span className="text-xs text-muted-foreground">{timeAgo(created_at)}</span>
          </div>
          <h3 className="font-serif text-lg text-foreground">
            📅 {placeName} organise « {payload.title} »
          </h3>
          <p className="text-sm text-muted-foreground">
            {new Date(payload.date_start).toLocaleDateString("fr-FR", { dateStyle: "long" })}
            {payload.event_type ? ` · ${payload.event_type}` : ""}
          </p>
          {placeSlug && (
            <Button asChild variant="outline" size="sm" className="mt-2">
              <Link to={`/habitat/${placeSlug}`}>S'intéresser</Link>
            </Button>
          )}
        </div>
      </article>
    );
  }

  // story
  const author = payload.profiles?.display_name ?? "Un voyageur";
  const placeName = payload.places?.name ?? "un habitat";
  const placeSlug = payload.places?.slug;
  const photos: string[] = (payload.photos_urls ?? []).slice(0, 4);
  return (
    <article className="overflow-hidden rounded-xl border bg-card">
      <div className="space-y-3 p-5">
        <div className="flex items-center justify-between gap-3">
          <TypeBadge type="story" />
          <span className="text-xs text-muted-foreground">{timeAgo(created_at)}</span>
        </div>
        <div className="flex items-center gap-2">
          {payload.profiles?.avatar_url ? (
            <img src={payload.profiles.avatar_url} alt={author} className="h-8 w-8 rounded-full object-cover" />
          ) : (
            <div className="h-8 w-8 rounded-full bg-muted" />
          )}
          <p className="text-sm">
            <span className="font-medium">📸 {author}</span>{" "}
            <span className="text-muted-foreground">a séjourné à</span>{" "}
            {placeSlug ? (
              <Link to={`/habitat/${placeSlug}`} className="font-medium hover:text-primary">{placeName}</Link>
            ) : (
              <span className="font-medium">{placeName}</span>
            )}
          </p>
        </div>
        {photos.length > 0 && (
          <div className={`grid gap-1.5 ${photos.length === 1 ? "grid-cols-1" : photos.length === 2 ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-4"}`}>
            {photos.map((url, i) => (
              <img key={i} src={url} alt="" loading="lazy" className="aspect-square w-full rounded-md object-cover" />
            ))}
          </div>
        )}
        {payload.text && (
          <p className="text-sm text-foreground/80 leading-relaxed">
            « {payload.text.slice(0, 200)}{payload.text.length > 200 ? "…" : ""} »
          </p>
        )}
      </div>
    </article>
  );
};

const FilterControls = ({
  selected, onToggle, days, setDays,
}: {
  selected: Set<ActivityType>;
  onToggle: (t: ActivityType) => void;
  days: number;
  setDays: (n: number) => void;
}) => (
  <div className="space-y-5">
    <div>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Type</h3>
      <div className="space-y-2">
        {(Object.keys(TYPE_META) as ActivityType[]).map((t) => (
          <label key={t} className="flex items-center gap-2.5 cursor-pointer rounded-md px-2 py-1.5 hover:bg-muted/40">
            <Checkbox checked={selected.has(t)} onCheckedChange={() => onToggle(t)} />
            <span className="text-sm">{TYPE_META[t].label}</span>
          </label>
        ))}
      </div>
    </div>
    <div>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Période</h3>
      <div className="flex flex-wrap gap-2">
        {RANGE_OPTIONS.map((r) => (
          <button
            key={r.value}
            onClick={() => setDays(r.value)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              days === r.value
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-foreground hover:border-primary/40"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>
    </div>
  </div>
);

const PAGE_SIZE = 10;

const CommunityFeed = () => {
  const [selected, setSelected] = useState<Set<ActivityType>>(
    new Set<ActivityType>(["new_habitat", "event", "story"])
  );
  const [days, setDays] = useState(30);
  const [visible, setVisible] = useState(PAGE_SIZE);

  const toggleType = (t: ActivityType) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(t) ? next.delete(t) : next.add(t);
      return next;
    });
    setVisible(PAGE_SIZE);
  };

  const types = useMemo(() => [...selected], [selected]);
  const { data: items, isLoading } = useActivityFeed(types, days);
  const shown = (items ?? []).slice(0, visible);
  const hasMore = (items ?? []).length > visible;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container max-w-6xl px-4 py-10">
        <header className="mb-8 max-w-2xl">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-primary">Actualités Casa Minga</p>
          <h1 className="font-serif text-3xl text-foreground sm:text-4xl">Le fil de la communauté</h1>
          <p className="mt-3 text-muted-foreground">
            Habitats qui rejoignent l'aventure, ateliers à venir et récits de séjour — tout ce qui anime Casa Minga, par ordre chronologique.
          </p>
        </header>

        <div className="mb-4 flex items-center justify-between lg:hidden">
          <span className="text-sm text-muted-foreground">
            {items?.length ?? 0} publications
          </span>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" /> Filtres
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <div className="pt-8">
                <FilterControls selected={selected} onToggle={toggleType} days={days} setDays={setDays} />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-xl border bg-card p-5">
              <FilterControls selected={selected} onToggle={toggleType} days={days} setDays={setDays} />
            </div>
          </aside>

          <section className="space-y-5">
            {isLoading && (
              <div className="rounded-xl border bg-card p-10 text-center text-sm text-muted-foreground">
                Chargement du fil…
              </div>
            )}
            {!isLoading && shown.length === 0 && (
              <div className="rounded-xl border bg-card p-10 text-center">
                <p className="font-serif text-lg text-foreground">Rien à afficher pour cette période</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Élargissez la période ou activez d'autres types de publications.
                </p>
              </div>
            )}
            {shown.map((item) => (
              <FeedCard key={item.id} item={item} />
            ))}
            {hasMore && (
              <div className="flex justify-center pt-4">
                <Button variant="outline" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
                  Voir plus
                </Button>
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CommunityFeed;
