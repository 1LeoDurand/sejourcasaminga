import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Loader2 } from "lucide-react";

type GeoPoint = { lat: number; lon: number };
type GeoCache = Record<string, GeoPoint | null>;

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

async function geocode(query: string): Promise<GeoPoint | null> {
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

/**
 * Privacy-friendly location map for the public listing page.
 * Shows an approximate area (circle) centered on the city/region,
 * never the exact address.
 */
export default function ListingLocationMap({
  city,
  region,
  country,
  label,
}: {
  city?: string | null;
  region?: string | null;
  country?: string | null;
  label?: string | null;
}) {
  const query = [city, region, country].filter(Boolean).join(", ");
  const [point, setPoint] = useState<GeoPoint | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!query) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    const cache = readCache();
    if (query in cache) {
      setPoint(cache[query]);
      setLoading(false);
      return;
    }
    setLoading(true);
    geocode(query).then((r) => {
      if (cancelled) return;
      const next = { ...readCache(), [query]: r };
      writeCache(next);
      setPoint(r);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [query]);

  const displayLabel = label || [city, region].filter(Boolean).join(", ") || country || "";

  if (!query) return null;

  return (
    <div className="mt-8">
      <h2 className="text-lg text-foreground mb-3 flex items-center gap-2">
        <MapPin className="h-5 w-5 text-primary" />
        Localisation
      </h2>

      <div className="relative h-72 w-full overflow-hidden rounded-2xl border">
        {loading ? (
          <div className="flex h-full items-center justify-center bg-muted/40">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : point ? (
          <MapContainer
            center={[point.lat, point.lon]}
            zoom={13}
            scrollWheelZoom={false}
            className="h-full w-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Circle
              center={[point.lat, point.lon]}
              radius={1200}
              pathOptions={{
                color: "hsl(42 85% 55%)",
                fillColor: "hsl(42 85% 62%)",
                fillOpacity: 0.25,
                weight: 1.5,
              }}
            />
          </MapContainer>
        ) : (
          <div className="flex h-full items-center justify-center bg-muted/40 text-sm text-muted-foreground">
            Localisation indisponible
          </div>
        )}
      </div>

      {displayLabel && (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          {displayLabel} — localisation approximative pour préserver la confidentialité de l'hôte.
        </p>
      )}
    </div>
  );
}
