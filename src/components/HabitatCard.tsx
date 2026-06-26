import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Users, Heart } from "lucide-react";
import { useState } from "react";
import type { Tables } from "@/integrations/supabase/types";
import placePlaceholder from "@/assets/place-placeholder.webp";

type Place = Tables<"places">;

interface Props {
  place: Place;
}

const HabitatCard = ({ place }: Props) => {
  const [liked, setLiked] = useState(false);

  return (
    <div className="group overflow-hidden rounded-xl border bg-card transition-all hover:shadow-lg">
      <Link to={`/habitat/${place.slug || place.id}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={place.image || placePlaceholder}
            alt={place.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <button
            onClick={(e) => { e.preventDefault(); setLiked(!liked); }}
            className="absolute right-3 top-3 rounded-full bg-background/80 p-2 backdrop-blur-sm transition-colors hover:bg-background"
          >
            <Heart className={`h-4 w-4 ${liked ? "fill-rosa text-rosa" : "text-foreground"}`} />
          </button>
        </div>
        <div className="p-4">
          <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="outline" className="text-xs font-normal">{place.type}</Badge>
          </div>
          <h3 className="font-serif text-lg text-foreground group-hover:text-primary transition-colors">
            {place.name}
          </h3>
          <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            {place.region || place.city || ""}
          </p>
          {place.short_desc && (
            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{place.short_desc}</p>
          )}
          {place.values && place.values.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {place.values.slice(0, 3).map((v) => (
                <Badge key={v} variant="secondary" className="text-xs font-normal">{v}</Badge>
              ))}
            </div>
          )}
          <div className="mt-3 flex items-center text-sm text-muted-foreground">
            <Users className="h-3.5 w-3.5 mr-1" />
            {place.inhabitants || "?"} habitant·es
          </div>
        </div>
      </Link>
    </div>
  );
};

export default HabitatCard;
