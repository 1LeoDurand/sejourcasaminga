import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import {
  Loader2, MapPin, Filter, Crosshair, Maximize2, Minimize2,
  Share2, X as XIcon, RotateCcw,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { usePlaces } from "@/hooks/use-places";
import { toast } from "@/hooks/use-toast";

// ---------------- Types & constants ----------------
type AnyPlace = any;
type LatLng = { lat: number; lon: number };
type GeoCache = Record<string, LatLng | null>;

const CACHE_KEY = "casaminga.geocache.v1";

const TYPE_META: Record<string, { label: string; emoji: string; color: string }> = {
  participatif: { label: "Participatif", emoji: "🏘️", color: "#3b82f6" },
  ecolieu:      { label: "Écolieu",      emoji: "🌿", color: "#16a34a" },
  coliving:     { label: "Coliving",     emoji: "🏢", color: "#f97316" },
  autre:        { label: "Autre",        emoji: "🏠", color: "#6b7280" },
};

const VALUE_OPTIONS = [
  { id: "ecologie",       label: "Écologie" },
  { id: "partage",        label: "Partage" },
  { id: "gouvernance",    label: "Gouvernance" },
  { id: "apprentissage",  label: "Apprentissage" },
  { id: "nature",         label: "Nature" },
];

const normalizeType = (t: string | null | undefined): keyof typeof TYPE_META => {
  if (!t) return "autre";
  const s = t.toLowerCase();
  if (s.includes("partic")) return "participatif";
  if (s.includes("eco") || s.includes("éco")) return "ecolieu";
  if (s.includes("coliv")) return "coliving";
  return "autre";
};

// ---------------- Geocoding (Nominatim, cached) ----------------
const readCache = (): GeoCache => {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY) || "{}"); } catch { return {}; }
};
const writeCache = (c: GeoCache) => {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(c)); } catch { /* ignore */ }
};
const buildQuery = (p: AnyPlace) =>
  [p?.city, p?.region, p?.country].filter(Boolean).join(", ");

async function geocode(q: string): Promise<LatLng | null> {
  try {
    const r = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`, { headers: { Accept: "application/json" } });
    if (!r.ok) return null;
    const data = await r.json();
    if (Array.isArray(data) && data[0]) return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
  } catch { /* ignore */ }
  return null;
}

// ---------------- Distance ----------------
const haversine = (a: LatLng, b: LatLng) => {
  const R = 6371;
  const dLat = (b.lat - a.lat) * Math.PI / 180;
  const dLon = (b.lon - a.lon) * Math.PI / 180;
  const la1 = a.lat * Math.PI / 180;
  const la2 = b.lat * Math.PI / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};

// ---------------- Custom marker icons ----------------
const makeIcon = (type: keyof typeof TYPE_META, size: number) => {
  const meta = TYPE_META[type];
  const html = `
    <div style="
      width:${size}px;height:${size}px;border-radius:50%;
      background:${meta.color};color:#fff;display:flex;align-items:center;justify-content:center;
      font-size:${Math.round(size * 0.55)}px;box-shadow:0 2px 6px rgba(0,0,0,.25);
      border:2px solid #fff;
    ">${meta.emoji}</div>`;
  return L.divIcon({
    html, className: "casaminga-pin",
    iconSize: [size, size], iconAnchor: [size / 2, size / 2],
  });
};

// ---------------- Cluster icon (mini-donut) ----------------
const makeClusterIcon = (cluster: any) => {
  const markers = cluster.getAllChildMarkers();
  const counts: Record<string, number> = {};
  markers.forEach((m: any) => {
    const t = m.options.placeType || "autre";
    counts[t] = (counts[t] || 0) + 1;
  });
  const total = markers.length;
  const types = Object.keys(counts);

  // Build donut conic-gradient
  let start = 0;
  const stops = types.map((t) => {
    const pct = (counts[t] / total) * 100;
    const color = TYPE_META[t as keyof typeof TYPE_META]?.color || "#999";
    const seg = `${color} ${start}% ${start + pct}%`;
    start += pct;
    return seg;
  }).join(", ");

  const html = `
    <div style="
      position:relative;width:46px;height:46px;border-radius:50%;
      background:conic-gradient(${stops});
      display:flex;align-items:center;justify-content:center;
      box-shadow:0 2px 8px rgba(0,0,0,.3);
    ">
      <div style="
        width:32px;height:32px;border-radius:50%;background:#fff;
        display:flex;align-items:center;justify-content:center;
        font-size:12px;font-weight:600;color:#1f2937;
      ">${total}</div>
    </div>`;
  return L.divIcon({ html, className: "casaminga-cluster", iconSize: [46, 46] });
};

// ---------------- Marker cluster layer (custom hook) ----------------
interface ClusterLayerProps {
  points: { id: string; lat: number; lon: number; place: AnyPlace; type: keyof typeof TYPE_META; size: number }[];
  onPopupHtml: (place: AnyPlace, distanceKm?: number) => string;
  userLocation: LatLng | null;
}

const ClusterLayer = ({ points, onPopupHtml, userLocation }: ClusterLayerProps) => {
  const map = useMap();
  const groupRef = useRef<any>(null);

  useEffect(() => {
    // @ts-ignore - markerClusterGroup added by plugin
    const group = (L as any).markerClusterGroup({
      iconCreateFunction: makeClusterIcon,
      showCoverageOnHover: false,
      spiderfyOnMaxZoom: true,
      disableClusteringAtZoom: 12,
    });
    groupRef.current = group;
    map.addLayer(group);
    return () => { map.removeLayer(group); };
  }, [map]);

  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;
    group.clearLayers();
    points.forEach((p) => {
      const distKm = userLocation ? haversine(userLocation, { lat: p.lat, lon: p.lon }) : undefined;
      const m = L.marker([p.lat, p.lon], {
        icon: makeIcon(p.type, p.size),
        // @ts-ignore - custom prop used in cluster grouping
        placeType: p.type,
      });
      m.bindPopup(onPopupHtml(p.place, distKm), { minWidth: 220 });
      group.addLayer(m);
    });
  }, [points, userLocation, onPopupHtml]);

  return null;
};

// ---------------- Bounds tracker (debounced) ----------------
const BoundsWatcher = ({ onBounds }: { onBounds: (b: L.LatLngBounds) => void }) => {
  const timeoutRef = useRef<any>(null);
  const map = useMapEvents({
    moveend: () => {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => onBounds(map.getBounds()), 500);
    },
    zoomend: () => {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => onBounds(map.getBounds()), 500);
    },
  });
  useEffect(() => { onBounds(map.getBounds()); }, [map, onBounds]);
  return null;
};

// ---------------- Recentre helper ----------------
const RecentreOn = ({ target }: { target: LatLng | null }) => {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo([target.lat, target.lon], 10, { duration: 1 });
  }, [target, map]);
  return null;
};

// ============== Page ==============
const MapView = () => {
  const { data: places, isLoading } = usePlaces();
  const [cache, setCache] = useState<GeoCache>(() => readCache());
  const [geocoding, setGeocoding] = useState(false);

  // Filters
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [distanceKm, setDistanceKm] = useState<number>(200);
  const [userLocation, setUserLocation] = useState<LatLng | null>(null);
  const [bounds, setBounds] = useState<L.LatLngBounds | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Read initial bounds from URL hash if any
  const initialBounds = useMemo(() => {
    if (typeof window === "undefined") return null;
    const m = window.location.hash.match(/bounds=([\d.\-,]+)/);
    if (!m) return null;
    const [a, b, c, d] = m[1].split(",").map(parseFloat);
    if ([a, b, c, d].some(isNaN)) return null;
    return L.latLngBounds([a, b], [c, d]);
  }, []);

  // Geocode missing places
  useEffect(() => {
    if (!places) return;
    const queries = new Set<string>();
    places.forEach((p: AnyPlace) => {
      const q = buildQuery(p);
      if (q) queries.add(q);
    });
    const missing = [...queries].filter((q) => !(q in cache));
    if (missing.length === 0) return;
    let cancelled = false;
    setGeocoding(true);
    (async () => {
      const next: GeoCache = { ...cache };
      for (const q of missing) {
        if (cancelled) return;
        next[q] = await geocode(q);
        await new Promise((r) => setTimeout(r, 250));
      }
      if (!cancelled) { setCache(next); writeCache(next); setGeocoding(false); }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [places]);

  // Points (after geocoding + filters)
  const allPoints = useMemo(() => {
    if (!places) return [];
    return places.flatMap((p: AnyPlace) => {
      const q = buildQuery(p);
      const c = q ? cache[q] : null;
      if (!c) return [];
      const type = normalizeType(p.type);
      const pop = Number(p.inhabitants) || 0;
      const size = Math.min(48, Math.max(28, 28 + Math.round(pop / 5)));
      return [{ id: p.id, lat: c.lat, lon: c.lon, place: p, type, size }];
    });
  }, [places, cache]);

  const filteredPoints = useMemo(() => {
    return allPoints.filter(({ place, lat, lon, type }) => {
      if (selectedTypes.length && !selectedTypes.includes(type)) return false;
      if (selectedValues.length) {
        const placeValues: string[] = [
          ...(place.values || []),
          ...(place.tags || []),
        ].map((s: string) => s.toLowerCase());
        const ok = selectedValues.some((v) => placeValues.some((pv) => pv.includes(v)));
        if (!ok) return false;
      }
      if (userLocation && distanceKm < 200) {
        const d = haversine(userLocation, { lat, lon });
        if (d > distanceKm) return false;
      }
      return true;
    });
  }, [allPoints, selectedTypes, selectedValues, distanceKm, userLocation]);

  // Visible (in current bounds)
  const visiblePoints = useMemo(() => {
    if (!bounds) return filteredPoints;
    return filteredPoints.filter((p) => bounds.contains([p.lat, p.lon]));
  }, [filteredPoints, bounds]);

  const nearbyCount = useMemo(() => {
    if (!userLocation) return null;
    return filteredPoints.filter((p) => haversine(userLocation, { lat: p.lat, lon: p.lon }) <= 25).length;
  }, [filteredPoints, userLocation]);

  // ----- Actions -----
  const handleLocate = useCallback(() => {
    if (!navigator.geolocation) {
      toast({ title: "Géolocalisation non disponible", variant: "destructive" });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        setUserLocation(loc);
        toast({ title: "Localisation activée", description: "Cercle de 25 km affiché." });
      },
      () => toast({ title: "Impossible d'obtenir la position", variant: "destructive" }),
      { enableHighAccuracy: false, timeout: 8000 }
    );
  }, []);

  const handleShare = useCallback(() => {
    if (!bounds) return;
    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();
    const hash = `bounds=${sw.lat.toFixed(4)},${sw.lng.toFixed(4)},${ne.lat.toFixed(4)},${ne.lng.toFixed(4)}`;
    const url = `${window.location.origin}/map#${hash}`;
    navigator.clipboard.writeText(url).then(
      () => toast({ title: "Lien copié", description: "Partage cette vue de carte." }),
      () => toast({ title: url })
    );
  }, [bounds]);

  const toggleFullscreen = () => setFullscreen((f) => !f);

  const resetFilters = () => {
    setSelectedTypes([]); setSelectedValues([]); setDistanceKm(200);
  };

  const popupHtml = useCallback((p: AnyPlace, distKm?: number) => {
    const img = (Array.isArray(p.images) && p.images[0]) || p.image || "";
    const type = normalizeType(p.type);
    const meta = TYPE_META[type];
    return `
      <div style="width:220px;font-family:inherit">
        ${img ? `<img src="${img}" style="width:100%;height:96px;object-fit:cover;border-radius:6px;margin-bottom:8px"/>` : ""}
        <div style="font-weight:600;color:#1f2937;margin-bottom:2px">${p.name || ""}</div>
        <div style="font-size:11px;color:#6b7280;margin-bottom:6px">
          <span style="color:${meta.color}">${meta.emoji} ${meta.label}</span>
          ${p.region ? ` · ${p.region}` : ""}
        </div>
        ${distKm !== undefined ? `<div style="font-size:11px;color:#6b7280;margin-bottom:6px">${distKm.toFixed(1)} km de toi</div>` : ""}
        <a href="/habitat/${p.id}" style="display:inline-block;padding:6px 10px;background:#D65D39;color:#fff;border-radius:4px;font-size:12px;text-decoration:none">Voir détails</a>
      </div>`;
  }, []);

  // ----- Filters panel -----
  const FiltersPanel = (
    <div className="space-y-6 p-4">
      <div>
        <Label className="text-sm font-medium mb-2 block">Type d'habitat</Label>
        <div className="space-y-2">
          {Object.entries(TYPE_META).map(([k, m]) => (
            <label key={k} className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox
                checked={selectedTypes.includes(k)}
                onCheckedChange={(v) => setSelectedTypes((s) => v ? [...s, k] : s.filter((x) => x !== k))}
              />
              <span style={{ color: m.color }}>{m.emoji}</span> {m.label}
            </label>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium mb-2 block">Valeurs</Label>
        <div className="space-y-2">
          {VALUE_OPTIONS.map((v) => (
            <label key={v.id} className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox
                checked={selectedValues.includes(v.id)}
                onCheckedChange={(c) => setSelectedValues((s) => c ? [...s, v.id] : s.filter((x) => x !== v.id))}
              />
              {v.label}
            </label>
          ))}
        </div>
      </div>

      {userLocation && (
        <div>
          <Label className="text-sm font-medium mb-2 block">
            Distance max&nbsp;: {distanceKm === 200 ? "∞" : `${distanceKm} km`}
          </Label>
          <Slider value={[distanceKm]} onValueChange={(v) => setDistanceKm(v[0])} min={5} max={200} step={5} />
        </div>
      )}

      <div className="flex items-center gap-2 pt-2">
        <Button variant="outline" size="sm" onClick={resetFilters} className="flex-1">
          <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Réinitialiser
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO title="Carte des habitats — Casa Minga" description="Explore la carte des écolieux, habitats participatifs et colivings de Casa Minga." />
      {!fullscreen && <Navbar />}

      <main className={fullscreen ? "fixed inset-0 z-50 bg-background flex flex-col" : "flex-1 flex flex-col"}>
        {/* Header bar */}
        <div className="border-b bg-card px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <MapPin className="h-5 w-5 text-primary shrink-0" />
            <div className="min-w-0">
              <h1 className="font-serif text-lg text-foreground truncate">Carte des habitats</h1>
              <p className="text-xs text-muted-foreground">
                {visiblePoints.length} lieu{visiblePoints.length !== 1 ? "x" : ""} visible{visiblePoints.length !== 1 ? "s" : ""}
                {nearbyCount !== null && ` · ${nearbyCount} à moins de 25 km`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {/* Mobile filters */}
            <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="md:hidden">
                  <Filter className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[80vh] overflow-y-auto">
                <SheetHeader><SheetTitle>Filtres</SheetTitle></SheetHeader>
                {FiltersPanel}
              </SheetContent>
            </Sheet>
            <Button variant="outline" size="sm" onClick={handleLocate} title="Me localiser">
              <Crosshair className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare} title="Partager cette vue">
              <Share2 className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={toggleFullscreen} title="Plein écran">
              {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 flex min-h-0">
          {/* Desktop filters sidebar */}
          <aside className="hidden md:block w-72 border-r bg-card overflow-y-auto">
            <div className="px-4 py-3 border-b">
              <h2 className="text-sm font-semibold flex items-center gap-1.5">
                <Filter className="h-4 w-4" /> Filtres
              </h2>
            </div>
            {FiltersPanel}
          </aside>

          {/* Map */}
          <div ref={mapContainerRef} className="flex-1 relative">
            {(isLoading || geocoding) && (
              <div className="absolute right-3 top-3 z-[1000] flex items-center gap-2 rounded-full bg-background/95 px-3 py-1.5 text-xs shadow-sm">
                <Loader2 className="h-3 w-3 animate-spin" />
                {isLoading ? "Chargement…" : "Localisation des lieux…"}
              </div>
            )}
            <MapContainer
              bounds={initialBounds || undefined}
              center={initialBounds ? undefined : [46.6, 2.5]}
              zoom={initialBounds ? undefined : 6}
              scrollWheelZoom
              className="h-full w-full"
            >
              <TileLayer
                attribution='&copy; OpenStreetMap'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <BoundsWatcher onBounds={setBounds} />
              <RecentreOn target={userLocation} />
              {userLocation && (
                <>
                  <Circle
                    center={[userLocation.lat, userLocation.lon]}
                    radius={25_000}
                    pathOptions={{ color: "#D65D39", fillColor: "#D65D39", fillOpacity: 0.08, weight: 1 }}
                  />
                  <Marker
                    position={[userLocation.lat, userLocation.lon]}
                    icon={L.divIcon({
                      html: `<div style="width:14px;height:14px;background:#D65D39;border:3px solid #fff;border-radius:50%;box-shadow:0 0 0 4px rgba(214,93,57,.25)"></div>`,
                      className: "casaminga-user-pin",
                      iconSize: [14, 14], iconAnchor: [7, 7],
                    })}
                  />
                </>
              )}
              <ClusterLayer points={filteredPoints} onPopupHtml={popupHtml} userLocation={userLocation} />
            </MapContainer>

            {fullscreen && (
              <Button
                onClick={toggleFullscreen}
                size="icon"
                variant="secondary"
                className="absolute top-3 left-3 z-[1000] rounded-full shadow"
              >
                <XIcon className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </main>

      {!fullscreen && <Footer />}
    </div>
  );
};

export default MapView;
