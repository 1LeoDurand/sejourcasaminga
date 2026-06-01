import { Badge } from "@/components/ui/badge";
import { MapPin, Users, Home, Calendar, Sparkles } from "lucide-react";

interface PreviewData {
  name?: string;
  type?: string;
  city?: string;
  region?: string;
  country?: string;
  short_desc?: string;
  description?: string;
  inhabitants?: number;
  year_founded?: number;
  governance?: string;
  ambiance?: string;
  values?: string[];
  offerings?: string[];
  hospitality_types?: string[];
  shared_amenities?: string[];
  images?: string[];
  published?: boolean;
  is_visible?: boolean;
}

const PlaceLivePreview = ({ data }: { data: PreviewData }) => {
  const cover = data.images?.[0];
  const location = [data.city, data.region, data.country].filter(Boolean).join(" · ");

  return (
    <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
      <div className="px-4 py-2 border-b bg-muted/40 flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Aperçu</span>
        {!data.published ? (
          <Badge variant="outline" className="text-[10px]">Brouillon</Badge>
        ) : !data.is_visible ? (
          <Badge variant="outline" className="text-[10px]">Caché</Badge>
        ) : (
          <Badge className="text-[10px] bg-primary/15 text-primary hover:bg-primary/15">Publié</Badge>
        )}
      </div>

      <div className="aspect-[4/3] bg-muted relative overflow-hidden">
        {cover ? (
          <img src={cover} alt={data.name || "Aperçu"} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full flex flex-col items-center justify-center text-muted-foreground text-xs gap-2">
            <Home className="h-8 w-8 opacity-40" />
            Ajoutez une photo de couverture
          </div>
        )}
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-serif text-lg leading-tight text-foreground">
              {data.name || <span className="text-muted-foreground italic">Nom du lieu</span>}
            </h3>
            {location && (
              <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {location}
              </p>
            )}
          </div>
          {data.type && <Badge variant="outline" className="text-[10px] shrink-0">{data.type}</Badge>}
        </div>

        {data.short_desc && (
          <p className="text-sm text-foreground/80 italic">"{data.short_desc}"</p>
        )}

        {data.description && (
          <p className="text-xs text-muted-foreground line-clamp-3">{data.description}</p>
        )}

        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          {!!data.inhabitants && (
            <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" /> {data.inhabitants} hab.</span>
          )}
          {data.year_founded && (
            <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" /> {data.year_founded}</span>
          )}
          {data.governance && (
            <span className="inline-flex items-center gap-1"><Sparkles className="h-3 w-3" /> {data.governance}</span>
          )}
        </div>

        {data.values && data.values.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {data.values.slice(0, 6).map((v) => (
              <Badge key={v} variant="secondary" className="text-[10px] font-normal">{v}</Badge>
            ))}
          </div>
        )}

        {data.hospitality_types && data.hospitality_types.length > 0 && (
          <div className="pt-2 border-t">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Accueil</p>
            <div className="flex flex-wrap gap-1">
              {data.hospitality_types.map((h) => (
                <Badge key={h} variant="outline" className="text-[10px] font-normal">{h}</Badge>
              ))}
            </div>
          </div>
        )}

        {data.shared_amenities && data.shared_amenities.length > 0 && (
          <div className="pt-2 border-t">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Espaces partagés</p>
            <p className="text-xs text-foreground/80">{data.shared_amenities.join(" · ")}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaceLivePreview;
