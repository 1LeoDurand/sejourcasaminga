import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ListingCard from "@/components/ListingCard";
import { useListings } from "@/hooks/use-listings";

/**
 * "Members also viewed" — horizontal scroll of other listings,
 * shown at the bottom of a listing page.
 */
export default function AlsoViewedListings({ currentId, placeId }: { currentId: string; placeId?: string }) {
  const { data: listings = [] } = useListings();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Exclude current listing and (optionally) same-place listings already shown above
  const others = listings.filter((l) => l.id !== currentId && l.place_id !== placeId).slice(0, 10);

  if (others.length === 0) return null;

  const scroll = (dir: -1 | 1) => {
    scrollRef.current?.scrollBy({ left: dir * 320, behavior: "smooth" });
  };

  return (
    <div className="mt-12 border-t pt-8">
      <div className="flex items-end justify-between gap-4 mb-1">
        <h2 className="text-lg text-foreground">Nos membres ont également consulté…</h2>
        <div className="hidden sm:flex gap-2">
          <button
            onClick={() => scroll(-1)}
            className="flex h-8 w-8 items-center justify-center rounded-full border text-muted-foreground hover:bg-muted transition-colors"
            aria-label="Précédent"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => scroll(1)}
            className="flex h-8 w-8 items-center justify-center rounded-full border text-muted-foreground hover:bg-muted transition-colors"
            aria-label="Suivant"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Ceux qui ont regardé ce séjour ont aussi consulté ceux-ci.
      </p>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-none"
      >
        {others.map((listing) => (
          <div key={listing.id} className="w-64 shrink-0 snap-start">
            <ListingCard listing={listing as any} />
          </div>
        ))}
      </div>
    </div>
  );
}
