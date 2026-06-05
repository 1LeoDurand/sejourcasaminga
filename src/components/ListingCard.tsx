import { Link } from "react-router-dom";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";
import { Users, Heart, Star, BadgeCheck } from "lucide-react";
import { LISTING_TYPE_LABELS, RELATIONSHIP_LABELS } from "@/data/demo";
import { listingUrl } from "@/hooks/use-listings";
import { useEffect, useState } from "react";
import type { Tables } from "@/integrations/supabase/types";
import listingPlaceholder from "@/assets/listing-placeholder.webp";

type ListingWithPlace = Tables<"listings"> & {
  places: Tables<"places"> | null;
  profiles?: Tables<"profiles"> | null;
  // optional aggregates (shown when available)
  rating?: number | null;
  review_count?: number | null;
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
    const arr = Array.isArray(listing.images) ? (listing.images.filter(Boolean) as string[]) : [];
    if (arr.length) return arr;
    if (listing.image) return [listing.image];
    return [FALLBACK_IMG];
  })();

  useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    api.on("select", () => setCurrent(api.selectedScrollSnap()));
  }, [api]);

  const relLabel = RELATIONSHIP_LABELS[listing.collective_relationship as keyof typeof RELATIONSHIP_LABELS] || listing.collective_relationship;
  const typeLabel = LISTING_TYPE_LABELS[listing.listing_type as keyof typeof LISTING_TYPE_LABELS] || listing.listing_type;

  // "Toulouse, France" style location
  const locationText = place
    ? [place.city, place.country || "France"].filter(Boolean).join(", ")
    : "";

  const dotsToShow = Math.min(photos.length, 5);
  const isAvailable = listing.available ?? true;
  const rating = listing.rating ?? null;
  const reviewCount = listing.review_count ?? null;

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl bg-card transition-all duration-200 hover:shadow-lg">
      {/* Image */}
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

        {/* Dots */}
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
          </div>
        )}

        {/* Favorite */}
        <button
          onClick={(e) => { e.preventDefault(); setLiked(!liked); }}
          className="absolute right-3 top-3 z-10 rounded-full p-1.5 text-white drop-shadow-md transition-transform hover:scale-110"
          aria-label={liked ? "Retirer des favoris" : "Ajouter aux favoris"}
        >
          <Heart className={`h-6 w-6 ${liked ? "fill-rosa text-rosa" : "fill-black/20 text-white"}`} />
        </button>

        {/* Host avatar badge (bottom-right of image) */}
        {profile && (
          <div className="absolute -bottom-5 right-4 z-10">
            <div className="relative">
              <img
                src={profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.display_name)}&background=random`}
                alt={profile.display_name}
                className="h-11 w-11 rounded-full object-cover ring-2 ring-card"
              />
              <span className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary ring-2 ring-card">
                <BadgeCheck className="h-3 w-3 text-primary-foreground" />
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Body */}
      <Link to={listingUrl(listing.id, listing.slug)} className="flex flex-1 flex-col p-4 pt-3">
        {/* Location */}
        {locationText && (
          <p className="text-xs text-muted-foreground">{locationText}</p>
        )}

        {/* Title + verified + rating */}
        <div className="mt-0.5 flex items-start justify-between gap-2">
          <h3 className="flex items-center gap-1.5 font-serif text-base font-semibold leading-snug text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {listing.title}
            {profile && <BadgeCheck className="h-4 w-4 shrink-0 text-primary" />}
          </h3>
          {rating != null && (
            <span className="flex shrink-0 items-center gap-1 text-sm font-medium text-foreground">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              {rating.toFixed(1)}
              {reviewCount != null && <span className="text-muted-foreground font-normal">({reviewCount})</span>}
            </span>
          )}
        </div>

        {/* Meta: capacity · type */}
        <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
          <Users className="h-3.5 w-3.5" />
          {listing.capacity || 1} voyageur{(listing.capacity || 1) > 1 ? "s" : ""}
          <span className="text-muted-foreground/50">·</span>
          {typeLabel}
        </p>

        {/* Availability */}
        <p className="mt-1.5 flex items-center gap-1.5 text-sm">
          <span className={`h-2 w-2 rounded-full ${isAvailable ? "bg-olive" : "bg-muted-foreground/40"}`} />
          <span className={isAvailable ? "font-medium text-olive" : "text-muted-foreground"}>
            {isAvailable ? "Disponible" : "Indisponible"}
          </span>
        </p>

        {/* Footer: relation type (replaces price — exchange is free) */}
        <div className="mt-auto pt-3 text-right">
          <span className="text-sm font-semibold text-foreground">{relLabel}</span>
        </div>
      </Link>
    </div>
  );
};

export default ListingCard;
