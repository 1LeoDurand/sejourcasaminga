import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import listingPlaceholder from "@/assets/listing-placeholder.webp";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft, MapPin, Users, Home, Shield, Heart, Mail,
  ChevronRight, Eye, Loader2, Send, Pencil, Clock,
  Star, X, ZoomIn, CheckCircle2, MessageSquare, Sparkles,
  ChevronDown, HelpCircle, ListChecks,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import ListingCard from "@/components/ListingCard";
import { LISTING_TYPE_LABELS, RELATIONSHIP_LABELS } from "@/data/demo";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateExchangeRequest, stayPointsCost } from "@/hooks/use-exchange-requests";
import { useListing, usePlaceListings } from "@/hooks/use-listings";
import { useHostProfile } from "@/hooks/use-profile";
import { useStayReviews } from "@/hooks/use-stay-reviews";
import { useListingAvailabilities } from "@/hooks/use-availabilities";
import { toast } from "@/hooks/use-toast";
import { formatDistanceToNow, format } from "date-fns";
import { fr } from "date-fns/locale";
import TrustBadges from "@/components/TrustBadges";
import ReportButton from "@/components/ReportButton";
import AvailabilityCalendar from "@/components/AvailabilityCalendar";
import ListingLocationMap from "@/components/ListingLocationMap";
import AlsoViewedListings from "@/components/AlsoViewedListings";

// ─── Phase 1 : Galerie photos ────────────────────────────────────────────────

function PhotoGallery({ images, title }: { images: string[]; title: string }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (images.length === 0) return null;

  const open = (i: number) => setLightboxIndex(i);
  const close = () => setLightboxIndex(null);
  const prev = () => setLightboxIndex((i) => (i !== null ? (i - 1 + images.length) % images.length : 0));
  const next = () => setLightboxIndex((i) => (i !== null ? (i + 1) % images.length : 0));

  return (
    <>
      {/* Mosaïque */}
      <div className="container px-5">
        <div className={`grid gap-2 rounded-2xl overflow-hidden ${images.length === 1 ? "grid-cols-1" : "grid-cols-2 md:grid-cols-3"}`}>
          {/* Image principale */}
          <div
            className={`relative cursor-pointer group ${images.length > 1 ? "col-span-2 md:col-span-2 row-span-2" : ""}`}
            onClick={() => open(0)}
          >
            <img
              src={images[0]}
              alt={title}
              className="w-full h-64 md:h-96 object-cover transition-transform group-hover:scale-[1.01]"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
              <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
            </div>
          </div>

          {/* Images secondaires */}
          {images.slice(1, 5).map((src, idx) => (
            <div key={idx} className="relative cursor-pointer group overflow-hidden" onClick={() => open(idx + 1)}>
              <img
                src={src}
                alt={`${title} ${idx + 2}`}
                className="w-full h-32 md:h-48 object-cover transition-transform group-hover:scale-[1.02]"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              {/* Overlay "+N" sur la dernière vignette si plus de 5 images */}
              {idx === 3 && images.length > 5 && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="text-white text-lg font-semibold">+{images.length - 5}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Compteur */}
        {images.length > 1 && (
          <p className="text-xs text-muted-foreground mt-1.5 text-right">
            {images.length} photos
          </p>
        )}
      </div>

      {/* Lightbox */}
      <Dialog open={lightboxIndex !== null} onOpenChange={close}>
        <DialogContent className="max-w-5xl w-full p-0 bg-black border-0 gap-0">
          <button
            onClick={close}
            className="absolute top-3 right-3 z-50 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80"
          >
            <X className="h-5 w-5" />
          </button>

          {lightboxIndex !== null && (
            <div className="relative flex items-center justify-center min-h-[60vh]">
              <img
                src={images[lightboxIndex]}
                alt={`${title} ${lightboxIndex + 1}`}
                className="max-h-[80vh] max-w-full object-contain"
              />

              {images.length > 1 && (
                <>
                  <button
                    onClick={prev}
                    className="absolute left-3 rounded-full bg-black/60 p-2 text-white hover:bg-black/80"
                  >
                    <ChevronRight className="h-5 w-5 rotate-180" />
                  </button>
                  <button
                    onClick={next}
                    className="absolute right-3 rounded-full bg-black/60 p-2 text-white hover:bg-black/80"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                  <p className="absolute bottom-3 left-1/2 -translate-x-1/2 text-white/70 text-sm">
                    {lightboxIndex + 1} / {images.length}
                  </p>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─── Phase 2 : Carte hôte enrichie ───────────────────────────────────────────

function HostCard({
  hostId,
  name,
  avatar,
  hostingStyle,
  experience,
  createdAt,
}: {
  hostId: string;
  name: string;
  avatar: string;
  hostingStyle?: string | null;
  experience?: string | null;
  createdAt?: string | null;
}) {
  const memberSince = createdAt
    ? new Date(createdAt).getFullYear()
    : null;

  return (
    <div className="mt-6 rounded-xl border bg-warm p-4">
      <div className="flex items-start gap-4">
        <img src={avatar} alt={name} className="h-16 w-16 rounded-full object-cover ring-2 ring-border shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">Accueilli par {name}</p>
          {memberSince && (
            <p className="text-xs text-muted-foreground mt-0.5">
              Membre depuis {memberSince} · {new Date().getFullYear() - memberSince} ans sur la plateforme
            </p>
          )}
          {hostingStyle && <p className="text-xs text-muted-foreground mt-1">{hostingStyle}</p>}
          {experience && <p className="text-xs text-muted-foreground">{experience}</p>}
        </div>
      </div>

      <TrustBadges
        userId={hostId}
        createdAt={createdAt}
        hasAvatar={!!avatar && !avatar.includes("ui-avatars")}
        hasBio={!!hostingStyle}
        variant="compact"
      />
    </div>
  );
}

// ─── Phase 3 : Disponibilité visuelle ────────────────────────────────────────

function AvailabilitySection({ listingId, notes }: { listingId: string; notes: string | null }) {
  const { data: avails = [], isLoading } = useListingAvailabilities(listingId);

  if (isLoading) {
    return (
      <div className="mt-8 flex justify-center py-4">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <AvailabilityCalendar availabilities={avails as any[]} notes={notes} />;
}

// ─── Phase 4 : Avis ──────────────────────────────────────────────────────────

function StarRating({ rating }: { rating: number | null }) {
  if (!rating) return null;
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`h-3.5 w-3.5 ${n <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`}
        />
      ))}
    </div>
  );
}

function ReviewItem({ review }: { review: any }) {
  const [textExpanded, setTextExpanded] = useState(false);
  const authorName = review.author?.display_name || "Membre";
  const authorAvatar =
    review.author?.avatar_url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=random`;
  const date = formatDistanceToNow(new Date(review.created_at), { addSuffix: true, locale: fr });
  const isLong = (review.text || "").length > 250;

  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-start gap-3">
        <img src={authorAvatar} alt={authorName} className="h-9 w-9 rounded-full object-cover shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-foreground">{authorName}</p>
            <p className="text-xs text-muted-foreground shrink-0">{date}</p>
          </div>
          {review.rating && <StarRating rating={review.rating} />}
          {review.text && (
            <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
              {isLong && !textExpanded ? review.text.slice(0, 250) + "…" : review.text}
              {isLong && (
                <button
                  onClick={() => setTextExpanded(!textExpanded)}
                  className="ml-1 text-primary underline-offset-2 hover:underline text-xs"
                >
                  {textExpanded ? "Voir moins" : "Lire la suite"}
                </button>
              )}
            </p>
          )}
          {review.photos_urls?.length > 0 && (
            <div className="mt-2 flex gap-2">
              {review.photos_urls.slice(0, 3).map((url: string, i: number) => (
                <img key={i} src={url} alt="" className="h-16 w-16 rounded-lg object-cover border" />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ReviewsSection({ placeId, listingTitle }: { placeId: string; listingTitle: string }) {
  const [expanded, setExpanded] = useState(false);
  const { data: reviews = [], isLoading } = useStayReviews(placeId, 20);

  if (isLoading) return null;
  if (reviews.length === 0) return (
    <div className="mt-8">
      <h2 className="text-lg text-foreground mb-3 flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-primary" />
        Avis
      </h2>
      <p className="text-sm text-muted-foreground">Aucun avis pour l'instant. Soyez le premier !</p>
    </div>
  );

  const avgRating = reviews.filter(r => r.rating).reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.filter(r => r.rating).length;
  const displayed = expanded ? reviews : reviews.slice(0, 3);

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg text-foreground flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          Avis
          <span className="text-sm font-normal text-muted-foreground">({reviews.length})</span>
        </h2>
        {avgRating > 0 && (
          <div className="flex items-center gap-1.5">
            <StarRating rating={Math.round(avgRating)} />
            <span className="text-sm font-medium">{avgRating.toFixed(1)}</span>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {displayed.map((review) => (
          <ReviewItem key={review.id} review={review} />
        ))}
      </div>

      {reviews.length > 3 && (
        <Button variant="outline" className="mt-4 w-full" onClick={() => setExpanded(!expanded)}>
          {expanded ? "Voir moins" : `Voir les ${reviews.length - 3} autres avis`}
        </Button>
      )}
    </div>
  );
}

// ─── Highlights ──────────────────────────────────────────────────────────────

function HighlightsSection({ highlights }: { highlights: string[] | null }) {
  if (!highlights || highlights.length === 0) return null;
  return (
    <div className="mt-8 rounded-2xl border bg-warm p-5">
      <h2 className="text-lg text-foreground mb-4 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        Ce que vous allez adorer
      </h2>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {highlights.map((h, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-foreground">
            <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <span>{h}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── House Rules ─────────────────────────────────────────────────────────────

function HouseRulesSection({ rules }: { rules: string[] | null }) {
  if (!rules || rules.length === 0) return null;
  return (
    <div className="mt-8">
      <h2 className="text-lg text-foreground mb-3 flex items-center gap-2">
        <ListChecks className="h-5 w-5 text-primary" />
        Règles de la maison
      </h2>
      <div className="rounded-xl border bg-card divide-y">
        {rules.map((r, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3 text-sm text-foreground">
            <span className="h-2 w-2 rounded-full bg-primary/60 shrink-0" />
            {r}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── FAQ ─────────────────────────────────────────────────────────────────────

function FaqSection({ faq }: { faq: { q: string; a: string }[] | null }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  if (!faq || faq.length === 0) return null;
  return (
    <div className="mt-8">
      <h2 className="text-lg text-foreground mb-3 flex items-center gap-2">
        <HelpCircle className="h-5 w-5 text-primary" />
        Questions fréquentes
      </h2>
      <div className="rounded-xl border bg-card divide-y">
        {faq.map((item, i) => (
          <div key={i}>
            <button
              className="w-full flex items-center justify-between gap-4 px-4 py-3.5 text-left text-sm font-medium text-foreground hover:bg-muted/40 transition-colors"
              onClick={() => setOpenIdx(openIdx === i ? null : i)}
            >
              <span>{item.q}</span>
              <ChevronDown className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform ${openIdx === i ? "rotate-180" : ""}`} />
            </button>
            {openIdx === i && (
              <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">
                {item.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Phase 5 : Séjours similaires ────────────────────────────────────────────

function SimilarListings({ placeId, currentId }: { placeId: string; currentId: string }) {
  const { data: listings = [] } = usePlaceListings(placeId);
  const others = listings.filter((l) => l.id !== currentId);

  if (others.length === 0) return null;

  return (
    <div className="mt-12 border-t pt-8">
      <h2 className="text-lg text-foreground mb-4">Autres séjours dans ce lieu</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {others.slice(0, 4).map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────

const ListingDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const createRequest = useCreateExchangeRequest();

  const { data: listing, isLoading } = useListing(id);
  const place = listing?.places || null;
  const { data: hostProfile } = useHostProfile(listing?.host_id);

  const [showRequestForm, setShowRequestForm] = useState(false);
  const [message, setMessage] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [guests, setGuests] = useState("1");
  const [exchangeType, setExchangeType] = useState("free");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [sending, setSending] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container px-5 py-20 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container px-5 py-20 text-center">
          <h1 className="text-2xl text-foreground">Séjour introuvable</h1>
          <Link to="/discover" className="mt-4 inline-block text-primary underline">Retour aux séjours</Link>
        </div>
      </div>
    );
  }

  const hostName = hostProfile?.display_name || "l'hôte";
  const hostAvatar = hostProfile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(hostName)}&background=random`;
  const typeLabel = LISTING_TYPE_LABELS[listing.listing_type as keyof typeof LISTING_TYPE_LABELS] || listing.listing_type;
  const relLabel = RELATIONSHIP_LABELS[listing.collective_relationship as keyof typeof RELATIONSHIP_LABELS] || listing.collective_relationship;

  // Galerie : image principale + images supplémentaires
  const allImages = [
    ...(listing.image ? [listing.image] : []),
    ...(listing.images || []),
  ].filter(Boolean) as string[];
  if (allImages.length === 0) {
    allImages.push(listingPlaceholder);
  }

  const pointsPerNight = (listing as any).points_per_night ?? 0;
  const previewPointsCost =
    startDate && endDate ? stayPointsCost(startDate, endDate, pointsPerNight) : pointsPerNight;

  const EXCHANGE_LABELS: Record<string, string> = {
    free: "Accueil gratuit",
    reciprocal: "Échange réciproque",
    points: `Réglé en points (${pointsPerNight} pts/nuit)`,
    other: "Autre arrangement",
  };

  const handleGoToPreview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Connexion requise", description: "Inscrivez-vous pour envoyer une demande.", variant: "destructive" });
      return;
    }
    if (!acceptedTerms) {
      toast({ title: "Conditions requises", description: "Vous devez accepter les conditions.", variant: "destructive" });
      return;
    }
    setShowPreview(true);
  };

  const handleConfirmSend = async () => {
    if (!user) return;
    setSending(true);
    try {
      await createRequest.mutateAsync({
        listing_id: listing.id,
        from_user_id: user.id,
        to_member_id: listing.host_id,
        message,
        start_date: startDate,
        end_date: endDate,
        number_of_guests: parseInt(guests) || 1,
        exchange_type: exchangeType,
        accepted_terms: acceptedTerms,
      });
      toast({ title: "Demande envoyée !", description: `Votre demande a été envoyée pour "${listing.title}".` });
      setShowRequestForm(false);
      setShowPreview(false);
      setMessage("");
      setAcceptedTerms(false);
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const placeName = place?.name || "habitat collectif";
  const placeCity = place?.city ? ` à ${place.city}` : "";
  const seoTitle = `${listing.title} — ${placeName}${placeCity} | Casa Minga`;
  const rawDesc = (listing.description || "").replace(/\s+/g, " ").trim();
  const seoDesc = rawDesc
    ? rawDesc.slice(0, 155)
    : `${typeLabel} chez ${placeName}${placeCity}. Échangez votre logement avec un habitat participatif sur Casa Minga.`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    "name": listing.title,
    "description": seoDesc,
    "image": allImages[0] || undefined,
    "url": `https://sejour.casaminga.com/listing/${listing.id}`,
    "maximumAttendeeCapacity": listing.capacity || 1,
    "address": place ? {
      "@type": "PostalAddress",
      "addressLocality": place.city || undefined,
      "addressRegion": place.region || undefined,
      "addressCountry": "FR",
    } : undefined,
    "containedInPlace": place ? {
      "@type": "Place",
      "name": place.name,
      "url": `https://sejour.casaminga.com/habitat/${place.id}`,
    } : undefined,
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={seoTitle}
        description={seoDesc}
        canonical={`/listing/${listing.id}`}
        image={listing.image || undefined}
        jsonLd={jsonLd}
      />
      <Navbar />

      {/* Breadcrumb */}
      <div className="container px-5 py-4">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Accueil</Link>
          <ChevronRight className="h-3 w-3" />
          {place && (
            <>
              <Link to={`/habitat/${place.id}`} className="hover:text-foreground">{place.name}</Link>
              <ChevronRight className="h-3 w-3" />
            </>
          )}
          <span className="text-foreground">{listing.title}</span>
          {user && listing.host_id === user.id && (
            <Link to={`/edit-listing/${listing.id}`} className="ml-auto">
              <Button variant="outline" size="sm">
                <Pencil className="mr-1.5 h-3.5 w-3.5" /> Modifier
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Phase 1 — Galerie photos */}
      <PhotoGallery images={allImages} title={listing.title} />

      {/* Content */}
      <div className="container px-5 py-8 max-w-6xl pb-28 lg:pb-8">
       <div className="lg:grid lg:grid-cols-[1fr_22rem] lg:gap-10 lg:items-start">
        <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <Badge className="bg-primary/10 text-primary border-0 text-xs">{typeLabel}</Badge>
          <Badge variant="secondary" className="text-xs">{relLabel}</Badge>
        </div>

        <h1 className="text-2xl md:text-3xl text-foreground">{listing.title}</h1>

        {place && (
          <p className="mt-1.5 flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            {place.region || place.city || ""}
          </p>
        )}

        {/* Phase 2 — Carte hôte enrichie */}
        <HostCard
          hostId={listing.host_id}
          name={hostName}
          avatar={hostAvatar}
          hostingStyle={hostProfile?.hosting_style}
          experience={hostProfile?.collective_experience}
          createdAt={(hostProfile as any)?.created_at}
        />

        {/* Place context */}
        {place && (
          <Link to={`/habitat/${place.id}`} className="mt-4 flex items-center gap-3 rounded-xl border p-4 transition-colors hover:bg-muted/50">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Home className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{place.name}</p>
              <p className="text-xs text-muted-foreground">{place.type} · {place.inhabitants || "?"} habitant·es</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
          </Link>
        )}

        {/* Highlights */}
        <HighlightsSection highlights={(listing as any).highlights} />

        {/* Description */}
        {listing.description && (
          <div className="mt-8">
            <h2 className="text-lg text-foreground mb-2">Le séjour</h2>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{listing.description}</p>
          </div>
        )}

        {/* Video */}
        {(listing as any).video_url && (() => {
          const url = (listing as any).video_url;
          const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
          const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
          const embedUrl = ytMatch ? `https://www.youtube.com/embed/${ytMatch[1]}` : vimeoMatch ? `https://player.vimeo.com/video/${vimeoMatch[1]}` : null;
          if (!embedUrl) return null;
          return (
            <div className="mt-8">
              <h2 className="text-lg text-foreground mb-2">Vidéo de présentation</h2>
              <div className="rounded-xl overflow-hidden border aspect-video">
                <iframe src={embedUrl} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title="Vidéo" />
              </div>
            </div>
          );
        })()}

        {/* Details grid */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <DetailBlock icon={Users} label="Capacité" value={`${listing.capacity || 1} voyageur${(listing.capacity || 1) > 1 ? "s" : ""}`} />
          {listing.autonomy_level && <DetailBlock icon={Shield} label="Autonomie" value={listing.autonomy_level} />}
          {listing.interaction_level && <DetailBlock icon={Eye} label="Interaction avec le collectif" value={listing.interaction_level} />}
          {listing.collective_access && <DetailBlock icon={Home} label="Accès aux espaces communs" value={listing.collective_access} />}
        </div>

        {/* House rules */}
        <HouseRulesSection rules={listing.practical_rules} />

        {/* Phase 3 — Disponibilité visuelle */}
        <AvailabilitySection listingId={listing.id} notes={listing.availability_notes} />

        {/* Carte — localisation approximative */}
        {place && (
          <ListingLocationMap
            city={place.city}
            region={place.region}
            country={place.country}
            label={place.region || place.city}
          />
        )}

        {/* Demande de séjour — modale partagée (déclenchée par l'aside desktop + la barre mobile) */}
        <Dialog
          open={showRequestForm}
          onOpenChange={(o) => { setShowRequestForm(o); if (!o) setShowPreview(false); }}
        >
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            {showPreview ? (
              <div className="space-y-4">
                <DialogHeader>
                  <DialogTitle>Confirmez votre demande</DialogTitle>
                </DialogHeader>
                <dl className="text-sm divide-y rounded-lg border bg-muted/30">
                  <PreviewRow label="Habitat" value={listing.title} />
                  <PreviewRow label="Hôte" value={hostName} />
                  <PreviewRow label="Arrivée" value={startDate} />
                  <PreviewRow label="Départ" value={endDate} />
                  <PreviewRow label="Voyageurs" value={guests} />
                  <PreviewRow label="Type d'échange" value={EXCHANGE_LABELS[exchangeType]} />
                  {exchangeType === "points" && <PreviewRow label="Coût en points" value={`🛎️ ${previewPointsCost} pts`} />}
                  {message && <PreviewRow label="Message" value={message} />}
                </dl>
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" /> L'habitant répondra sous 48h.
                </p>
                <div className="flex gap-3">
                  <Button onClick={handleConfirmSend} disabled={sending}>
                    {sending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Send className="mr-2 h-4 w-4" /> Envoyer la demande
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowPreview(false)}>Retour</Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleGoToPreview} className="space-y-4">
                <DialogHeader>
                  <DialogTitle>Demande de séjour</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start">Date d'arrivée *</Label>
                    <Input id="start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
                  </div>
                  <div>
                    <Label htmlFor="end">Date de départ *</Label>
                    <Input id="end" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="guests">Nombre de voyageurs</Label>
                    <Input id="guests" type="number" min="1" max={listing.capacity || 10} value={guests} onChange={(e) => setGuests(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="exchange-type">Type d'échange</Label>
                    <Select value={exchangeType} onValueChange={setExchangeType}>
                      <SelectTrigger id="exchange-type"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="free">Accueil gratuit</SelectItem>
                        <SelectItem value="reciprocal">Échange réciproque</SelectItem>
                        <SelectItem value="points">Réglé en points</SelectItem>
                        <SelectItem value="other">Autre arrangement</SelectItem>
                      </SelectContent>
                    </Select>
                    {exchangeType === "points" && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        🛎️ {previewPointsCost} points{startDate && endDate ? "" : ` (${pointsPerNight}/nuit)`} débités à l'acceptation.
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <Label htmlFor="message">Pourquoi veux-tu visiter ce lieu&nbsp;?</Label>
                  <Textarea
                    id="message"
                    placeholder="Pourquoi veux-tu visiter ce lieu ?"
                    value={message}
                    onChange={(e) => setMessage(e.target.value.slice(0, 200))}
                    rows={4}
                    maxLength={200}
                  />
                  <p className="mt-1 text-xs text-muted-foreground text-right">{message.length}/200</p>
                </div>
                <label className="flex items-start gap-2 text-sm text-foreground">
                  <Checkbox
                    checked={acceptedTerms}
                    onCheckedChange={(v) => setAcceptedTerms(Boolean(v))}
                    className="mt-0.5"
                  />
                  <span className="text-muted-foreground">
                    J'accepte les conditions d'accueil et m'engage à respecter le lieu et ses habitant·es.
                  </span>
                </label>
                <Button type="submit" className="w-full" disabled={!startDate || !endDate || !acceptedTerms}>
                  Aperçu de la demande
                </Button>
              </form>
            )}
          </DialogContent>
        </Dialog>

        {/* FAQ */}
        <FaqSection faq={Array.isArray((listing as any).faq) ? (listing as any).faq : null} />

        {/* Phase 4 — Avis */}
        {place?.id && <ReviewsSection placeId={place.id} listingTitle={listing.title} />}

        {/* Phase 5 — Séjours similaires */}
        {place?.id && <SimilarListings placeId={place.id} currentId={listing.id} />}

        {/* Signalement */}
        <div className="mt-6 flex justify-center">
          <ReportButton targetType="listing" targetId={listing.id} variant="text" />
        </div>
        </div>{/* /colonne principale */}

        {/* Carte de demande — sticky desktop */}
        <aside className="hidden lg:block">
          <div className="lg:sticky lg:top-24 rounded-2xl border bg-card p-5 shadow-sm">
            <p className="text-sm font-semibold text-foreground">{t("listing.asideTitle")}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("listing.asideText", { host: hostName })}
            </p>
            <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Users className="h-3.5 w-3.5" /> {t("listing.capacity", { count: listing.capacity || 1 })}
            </div>
            <div className="mt-4">
              {user ? (
                listing.host_id === user.id ? (
                  <Button variant="outline" className="w-full" asChild>
                    <Link to={`/edit-listing/${listing.id}`}><Pencil className="mr-1.5 h-4 w-4" /> {t("listing.editStay")}</Link>
                  </Button>
                ) : (
                  <Button size="lg" className="w-full" onClick={() => { setShowPreview(false); setShowRequestForm(true); }}>
                    <Send className="mr-2 h-4 w-4" /> {t("listing.sendRequest")}
                  </Button>
                )
              ) : (
                <Button size="lg" className="w-full" asChild>
                  <Link to="/auth?tab=signup">{t("listing.signupToContact")}</Link>
                </Button>
              )}
            </div>
          </div>
        </aside>
       </div>{/* /grille */}
      </div>

      {/* Suggestions pleine largeur — hors grid */}
      <div className="container px-5 max-w-6xl pb-8">
        <AlsoViewedListings currentId={listing.id} placeId={place?.id} />
      </div>

      {/* Barre d'action fixe — mobile */}
      {!(user && listing.host_id === user.id) && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur px-4 py-3 lg:hidden">
          <div className="mx-auto flex max-w-6xl items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{typeLabel}</p>
              <p className="truncate text-xs text-muted-foreground">{place?.region || place?.city || ""}</p>
            </div>
            {user ? (
              <Button onClick={() => { setShowPreview(false); setShowRequestForm(true); }}>
                <Send className="mr-1.5 h-4 w-4" /> {t("listing.requestShort")}
              </Button>
            ) : (
              <Button asChild><Link to="/auth?tab=signup">{t("listing.signup")}</Link></Button>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

function DetailBlock({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-center gap-2 mb-1.5">
        <Icon className="h-4 w-4 text-primary" />
        <span className="text-xs font-medium text-foreground">{label}</span>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">{value}</p>
    </div>
  );
}

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 px-3 py-2">
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="text-sm text-foreground text-right whitespace-pre-wrap">{value}</dd>
    </div>
  );
}

export default ListingDetail;
