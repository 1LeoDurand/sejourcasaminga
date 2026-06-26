import { useEffect, useMemo, useState } from "react";
import listingPlaceholder from "@/assets/listing-placeholder.webp";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";

// Fix Leaflet default icon paths (Vite bundling)
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

type AnyListing = any;

type GeoCache = Record<string, { lat: number; lon: number } | null>;

const CACHE_KEY = "casaminga.geocache.v1";

const readCache = (): GeoCache => {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
  } catch {
    return {};
  }
};

const writeCache = (c: GeoCache) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(c));
  } catch {
    /* ignore */
  }
};

const buildQuery = (place: any) =>
  [place?.city, place?.region, place?.country].filter(Boolean).join(", ");

async function geocode(query: string): Promise<{ lat: number; lon: number } | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`,
      { headers: { Accept: "application/json" } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (Array.isArray(data) && data[0]) {
      return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
    }
    return null;
  } catch {
    return null;
  }
}

interface Props {
  listings: AnyListing[];
}

interface MarkerPoint {
  id: string;
  lat: number;
  lon: number;
  listing: AnyListing;
}

const ListingsMap = ({ listings }: Props) => {
  const [cache, setCache] = useState<GeoCache>(() => readCache());
  const [loading, setLoading] = useState(false);

  const queries = useMemo(() => {
    const unique = new Map<string, AnyListing>();
    listings.forEach((l) => {
      const q = buildQuery(l.places);
      if (q && !unique.has(q)) unique.set(q, l);
    });
    return unique;
  }, [listings]);

  useEffect(() => {
    let cancelled = false;
    const missing = [...queries.keys()].filter((q) => !(q in cache));
    if (missing.length === 0) return;
    setLoading(true);
    (async () => {
      const next: GeoCache = { ...cache };
      for (const q of missing) {
        if (cancelled) return;
        const r = await geocode(q);
        next[q] = r;
        // Be polite with Nominatim
        await new Promise((res) => setTimeout(res, 250));
      }
      if (!cancelled) {
        setCache(next);
        writeCache(next);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queries]);

  const points: MarkerPoint[] = useMemo(() => {
    const pts: MarkerPoint[] = [];
    listings.forEach((l) => {
      const q = buildQuery(l.places);
      const c = cache[q];
      if (c) pts.push({ id: l.id, lat: c.lat, lon: c.lon, listing: l });
    });
    return pts;
  }, [listings, cache]);

  const center: [number, number] = points.length
    ? [points[0].lat, points[0].lon]
    : [46.6, 2.5]; // France fallback

  return (
    <div className="relative h-[70vh] w-full overflow-hidden rounded-xl border">
      {loading && (
        <div className="absolute right-3 top-3 z-[1000] flex items-center gap-2 rounded-full bg-background/90 px-3 py-1.5 text-xs shadow-sm backdrop-blur">
          <Loader2 className="h-3 w-3 animate-spin" /> Localisation des séjours…
        </div>
      )}
      <MapContainer
        center={center}
        zoom={points.length ? 5 : 5}
        scrollWheelZoom
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {points.map((p) => {
          const l = p.listing;
          const place = l.places;
          const img =
            (Array.isArray(l.images) && l.images[0]) ||
            l.image ||
            listingPlaceholder;
          return (
            <Marker key={p.id} position={[p.lat, p.lon]}>
              <Popup>
                <Link to={`/listing/${l.slug || l.id}`} className="block w-48 no-underline">
                  <img
                    src={img}
                    alt={l.title}
                    className="mb-2 h-24 w-full rounded object-cover"
                  />
                  <div className="font-serif text-sm font-medium text-foreground">
                    {l.title}
                  </div>
                  {place && (
                    <div className="text-xs text-muted-foreground">
                      {place.name}
                      {place.city ? ` · ${place.city}` : place.region ? ` · ${place.region}` : ""}
                    </div>
                  )}
                </Link>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default ListingsMap;
