import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Grid3x3, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Carousel, CarouselContent, CarouselItem, type CarouselApi,
} from "@/components/ui/carousel";

interface Props {
  images: string[];
  name: string;
}

const MAX_PHOTOS = 15;

/**
 * Airbnb-style place gallery: desktop mosaic (1 large + up to 4 thumbs) with an
 * "Afficher toutes les photos" button, swipeable carousel on mobile, and a
 * full-screen keyboard-navigable viewer. Handles up to 15 photos.
 */
const PlaceGallery = ({ images, name }: Props) => {
  const { t } = useTranslation();
  const pics = images.filter(Boolean).slice(0, MAX_PHOTOS);

  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    api.on("select", () => setCurrent(api.selectedScrollSnap()));
  }, [api]);

  const openAt = (i: number) => { setIndex(i); setOpen(true); };
  const prev = useCallback(() => setIndex((i) => (i - 1 + pics.length) % pics.length), [pics.length]);
  const next = useCallback(() => setIndex((i) => (i + 1) % pics.length), [pics.length]);

  // Keyboard navigation while the viewer is open (Esc is handled by Dialog).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, prev, next]);

  if (pics.length === 0) return null;

  const alt = (i: number) => t("placeGallery.photoAlt", { name, index: i + 1 });
  const n = pics.length;

  // Mosaic cell classes per index, tiled with no gaps for 1..5+ images.
  const cellClass = (i: number): string => {
    if (n === 1) return "col-span-2 row-span-2";
    if (n === 2) return "row-span-2"; // two equal tall columns
    if (n === 3) return i === 0 ? "col-span-1 row-span-2" : "col-span-1 row-span-1";
    if (n === 4) return "col-span-1 row-span-1"; // 2×2 equal
    // n >= 5 → big left (2×2) + 2×2 thumbs
    return i === 0 ? "col-span-2 row-span-2" : "col-span-1 row-span-1";
  };
  const gridCols = n === 1 || n === 3 ? "grid-cols-2" : n === 2 || n === 4 ? "grid-cols-2" : "grid-cols-4";
  const mosaic = pics.slice(0, n >= 5 ? 5 : n);

  return (
    <>
      {/* Mobile — swipeable carousel */}
      <div className="relative md:hidden">
        <Carousel setApi={setApi} opts={{ loop: n > 1 }}>
          <CarouselContent>
            {pics.map((src, i) => (
              <CarouselItem key={i}>
                <button type="button" onClick={() => openAt(i)} className="block w-full">
                  <div className="aspect-[4/3] overflow-hidden rounded-xl">
                    <img
                      src={src}
                      alt={alt(i)}
                      className="h-full w-full object-cover"
                      loading={i === 0 ? undefined : "lazy"}
                    />
                  </div>
                </button>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
        {n > 1 && (
          <div className="pointer-events-none absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
            {pics.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full bg-white transition-all ${i === current ? "w-3 opacity-100" : "w-1.5 opacity-60"}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Desktop — mosaic */}
      <div className="relative hidden md:block">
        <div className={`grid ${gridCols} grid-rows-2 gap-2 h-[420px] overflow-hidden rounded-2xl`}>
          {mosaic.map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => openAt(i)}
              className={`group relative overflow-hidden ${cellClass(i)}`}
            >
              <img
                src={src}
                alt={alt(i)}
                loading={i === 0 ? undefined : "lazy"}
                className="h-full w-full object-cover transition-transform group-hover:scale-[1.02]"
              />
              <span className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
              {/* "+N" overlay on the last mosaic thumb when there are more photos */}
              {n > 5 && i === 4 && (
                <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-lg font-semibold text-white">
                  +{n - 5}
                </span>
              )}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => openAt(0)}
          className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-lg bg-background/90 px-3 py-1.5 text-sm font-medium text-foreground shadow-sm backdrop-blur transition-colors hover:bg-background"
        >
          <Grid3x3 className="h-4 w-4" /> {t("placeGallery.showAll")}
        </button>
      </div>

      {/* Full-screen viewer */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-6xl w-full gap-0 border-0 bg-black p-0">
          <button
            onClick={() => setOpen(false)}
            aria-label={t("placeGallery.close")}
            className="absolute right-3 top-3 z-50 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="relative flex min-h-[60vh] items-center justify-center">
            <img src={pics[index]} alt={alt(index)} className="max-h-[85vh] max-w-full object-contain" />
            {n > 1 && (
              <>
                <button
                  onClick={prev}
                  aria-label={t("placeGallery.prev")}
                  className="absolute left-3 rounded-full bg-black/60 p-2 text-white hover:bg-black/80"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={next}
                  aria-label={t("placeGallery.next")}
                  className="absolute right-3 rounded-full bg-black/60 p-2 text-white hover:bg-black/80"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
                <p className="absolute bottom-3 left-1/2 -translate-x-1/2 text-sm text-white/70">
                  {index + 1} / {n}
                </p>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PlaceGallery;
