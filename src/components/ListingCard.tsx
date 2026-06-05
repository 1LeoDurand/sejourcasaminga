import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";
import { MapPin, Users, Heart } from "lucide-react";
import { LISTING_TYPE_LABELS, RELATIONSHIP_LABELS } from "@/data/demo";
import { listingUrl } from "@/hooks/use-listings";
import { useEffect, useState } from "react";
import type { Tables } from "@/integrations/supabase/types";
import listingPlaceholder from "@/assets/listing-placeholder.webp";

type ListingWithPlace = Tables<"listings"> & {
  places: Tables<"places"> | null;
  profiles?: Tables<"profiles"> | null;
};

interface Props {
  listing: ListingWithPlace;
}

const FALLBACK_IMG = listingPlaceholder;

const ListingCard = ({ listing }: Props) => {
  const [liked, setLiked] = useState(false);
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const place = listing.places;
  const profile = listing.profiles;

  const photos: string[] = (() => {
    const arr = Array.isArray(listing.images) ? listing.images.filter(Boolean) as string[] : [];
    if (arr.length) return arr;
    if (listing.image) return [listing.image];
    return [FALLBACK_IMG];
  })();

  useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    api.on("select", () => setCurrent(api.selectedScrollSnap()));
  }, [api]);

  const typeLabel = LISTING_TYPE_LABELS[listing.listing_type as keyof typeof LISTING_TYPE_LABELS] || listing.listing_type;
  const relLabel = RELATIONSHIP_LABELS[listing.collective_relationship as keyof typeof RELATIONSHIP_LABELS] || listing.collective_relationship;

  const excerpt = listing.description || place?.short_desc || "";
  const locationText = place ? `${place.name}${place.region ? `, ${place.region}` : place.city ? `, ${place.city}` : ""}` : "";
  const dotsToShow = Math.min(photos.length, 5);

  return (
    <div className="group overflow-hidden rounded-xl border bg-card transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
      <div className="relative">
        <Carousel setApi={setApi} opts={{ loop: photos.length > 1 }} className="w-full">
          <CarouselContent>
            {photos.map((src, i) => (
              <CarouselItem key={i}>
                <Link to={listingUrl(listing.id, listing.slug)} className="block">
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={src}
                      alt={`${listing.title} – photo ${i + 1}`}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
          {photos.length > 1 && (
            <>
              <CarouselPrevious className="left-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CarouselNext className="right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity" />
            </>
          )}
        </Carousel>

        {photos.length > 1 && (
          <div className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1">
            {Array.from({ length: dotsToShow }).map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full bg-white transition-all ${
                  i === current % dotsToShow ? "w-3 opacity-100" : "w-1.5 opacity-60"
                }`}
              />
            ))}
            {photos.length > dotsToShow && (
              <span className="ml-1 rounded-full bg-background/70 px-1.5 py-0.5 text-[0.55rem] font-medium text-foreground">
                +{photos.length - dotsToShow}
              </span>
            )}
          </div>
        )}

        <button
          onClick={(e) => { e.preventDefault(); setLiked(!liked); }}
          className="absolute right-3 top-3 z-10 rounded-full bg-background/90 p-2 shadow-sm backdrop-blur-sm transition-colors hover:bg-background"
          aria-label={liked ? "Retirer des favoris" : "Ajouter aux favoris"}
        >
          <Heart className={`h-4 w-4 ${liked ? "fill-rosa text-rosa" : "text-foreground"}`} />
        </button>
      </div>

      <Link to={listingUrl(listing.id, listing.slug)} className="block p-4">
        <div className="flex items-center gap-1.5 text-[0.7rem] text-muted-foreground">
          <Badge variant="outline" className="rounded-full px-2 py-0 text-[0.6rem] font-normal">
            {typeLabel}
          </Badge>
          {locationText && (
            <span className="flex items-center gap-1 truncate">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">{locationText}</span>
            </span>
          )}
        </div>

        <h3 className="mt-1.5 font-serif text-lg leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-2">
          {listing.title}
        </h3>

        {excerpt && (
          <p className="mt-1.5 text-sm italic text-muted-foreground line-clamp-2">
            « {excerpt} »
          </p>
        )}

        <div className="mt-3 flex items-center justify-between gap-2 border-t pt-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2 min-w-0">
            {profile && (
              <>
                <img
                  src={profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.display_name)}&background=random`}
                  alt={profile.display_name}
                  className="h-6 w-6 rounded-full object-cover ring-1 ring-border shrink-0"
                />
                <span className="truncate text-foreground font-medium">{profile.display_name}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {listing.capacity || 1}
            </span>
            <Badge variant="secondary" className="text-[0.6rem] font-normal">
              {relLabel}
            </Badge>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ListingCard;
