import { useParams, Link } from "react-router-dom";
import placePlaceholder from "@/assets/place-placeholder.webp";
import { useAuth } from "@/contexts/AuthContext";
import PlaceClaimRequestForm from "@/components/PlaceClaimRequestForm";
import ClaimPlaceModal from "@/components/ClaimPlaceModal";
import PlaceClaimBadge from "@/components/PlaceClaimBadge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  MapPin, Users, Heart, ArrowLeft, ExternalLink,
  Check, X as XIcon, Leaf, Baby, Dog, Accessibility, ChefHat,
  Loader2, Pencil, Calendar, TreePine, Home, Handshake,
  UserRound, Users2, Sparkles, Mail, Star, MessageSquare,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import ReportButton from "@/components/ReportButton";
import TrustBadges from "@/components/TrustBadges";
import { usePlace } from "@/hooks/use-places";
import { usePlaceListings } from "@/hooks/use-listings";
import { useEffect, useState } from "react";
import { trackEvent } from "@/lib/analytics";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import ListingCard from "@/components/ListingCard";
import HabitatEvents from "@/components/HabitatEvents";
import CollapsibleBadges from "@/components/CollapsibleBadges";
import { useIsMobile } from "@/hooks/use-mobile";
import { HOSPITALITY_TYPES, HOSPITALITY_MANAGED_BY, PLACE_OFFERINGS, VIBE_OPTIONS } from "@/data/demo";
import { computeCompletion } from "@/lib/profile-completion";
import { BadgeCheck } from "lucide-react";
import { useHabitatReviews } from "@/hooks/use-habitat-reviews";
import { useStayReviews } from "@/hooks/use-stay-reviews";


const ENVIRONMENT_LABELS: Record<string, string> = {
  urban: "Urbain",
  "peri-urban": "Péri-urbain",
  rural: "Rural",
};

const HOSTING_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  yes: { label: "Accueil ouvert", color: "bg-green-100 text-green-800 border-green-200" },
  soon: { label: "Bientôt ouvert", color: "bg-amber-100 text-amber-800 border-amber-200" },
  no: { label: "Pas d'accueil pour l'instant", color: "bg-muted text-muted-foreground border-border" },
};

const labelFromOptions = (options: { value: string; label: string; shortLabel?: string }[], value: string | null | undefined, useShort = false) =>
  options.find((o) => o.value === value)?.[useShort ? "shortLabel" : "label"] || value || "";

function usePlaceMembers(placeId: string | undefined) {
  return useQuery({
    queryKey: ["place-members", placeId],
    enabled: !!placeId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("place_members")
        .select("*, profiles:user_id(*)")
        .eq("place_id", placeId!);
      if (error) {
        const { data: d2, error: e2 } = await supabase
          .from("place_members")
          .select("*")
          .eq("place_id", placeId!);
        if (e2) throw e2;
        return d2;
      }
      return data;
    },
  });
}

function useMemberPreferences(userIds: string[]) {
  return useQuery({
    queryKey: ["member-prefs", userIds.sort().join(",")],
    enabled: userIds.length > 0,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("user_preferences")
        .select("user_id, preferred_values, preferred_regions")
        .in("user_id", userIds);
      if (error) throw error;
      const map: Record<string, any> = {};
      (data || []).forEach((r: any) => (map[r.user_id] = r));
      return map;
    },
  });
}

const HabitatDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { data: place, isLoading } = usePlace(id);
  const { data: listings } = usePlaceListings(id);
  const { data: members } = usePlaceMembers(id);
  const { data: reviews } = useHabitatReviews(id, 5);
  const { data: stayReviews } = useStayReviews(id, 10);
  const [expandedReviews, setExpandedReviews] = useState<Record<string, boolean>>({});
  const [showAllStayReviews, setShowAllStayReviews] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const memberUserIds = (members || []).map((m: any) => m.user_id).filter(Boolean);
  const { data: memberPrefs } = useMemberPreferences(memberUserIds);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    if (id) trackEvent("page_view", { page: "habitat_detail", reference_id: id });
  }, [id]);
  const [selectedImage, setSelectedImage] = useState(0);


  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container py-20 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!place) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container py-20 text-center">
          <h1 className="text-2xl text-foreground">Lieu introuvable</h1>
          <p className="mt-2 text-muted-foreground">Ce lieu n'existe pas ou a été retiré.</p>
          <Link to="/discover"><Button className="mt-4">Retour à la recherche</Button></Link>
        </div>
      </div>
    );
  }

  const p = place as any;
  const images = place.images && place.images.length > 0 ? place.images : [place.image || placePlaceholder];
  const values = place.values || [];
  const amenities = place.shared_amenities || [];
  const rules = place.house_rules || [];

  const features = [
    { icon: Baby, label: "Enfants bienvenus", value: place.children_friendly },
    { icon: Users2, label: "Adapté aux familles", value: p.family_friendly },
    { icon: UserRound, label: "Adapté aux voyageurs solo", value: p.solo_friendly },
    { icon: Dog, label: "Animaux acceptés", value: place.animals_allowed },
    { icon: Accessibility, label: "Accessible PMR", value: place.accessible },
    { icon: Leaf, label: "Séjour participatif", value: p.participatory_stay },
  ];

  const hostingStatus = HOSTING_STATUS_LABELS[p.hosting_status] || HOSTING_STATUS_LABELS.no;
  const hospitalityTypes: string[] = p.hospitality_types || [];
  const offerings: string[] = p.offerings || [];
  const vibeLabel = labelFromOptions(VIBE_OPTIONS, p.vibe);
  const managedByLabel = labelFromOptions(HOSPITALITY_MANAGED_BY, p.hospitality_managed_by);
  const hasListings = listings && listings.length > 0;

  const scrollToListings = () => {
    document.getElementById("place-stays")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const isMember = !!user && (members || []).some((m: any) => m.user_id === user.id);
  const isOwnerOrManager = !!user && (place.created_by === user.id || p.claimed_by_user_id === user.id || isMember);

  const placeTypeLabel = hospitalityTypes[0] ? labelFromOptions(HOSPITALITY_TYPES, hospitalityTypes[0]) : "Habitat participatif";
  const seoTitle = `${place.name}${place.city ? ` à ${place.city}` : ""} — ${placeTypeLabel} | Casa Minga`;
  const seoDesc =
    (place.description && place.description.replace(/\s+/g, " ").trim().slice(0, 155)) ||
    `Découvrez ${place.name}, ${placeTypeLabel.toLowerCase()}${place.city ? ` à ${place.city}` : ""}. Échangez votre logement et vivez une expérience collective sincère.`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Place",
    "name": place.name,
    "description": seoDesc,
    "image": images[0] || undefined,
    "url": `https://sejour.casaminga.com/habitat/${place.id}`,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": place.city || undefined,
      "addressRegion": place.region || undefined,
      "addressCountry": place.country || "FR",
    },
    ...(place.website ? { "sameAs": place.website } : {}),
  };

  return (
    <div className="min-h-screen">
      <SEO
        title={seoTitle}
        description={seoDesc}
        canonical={`/habitat/${place.id}`}
        image={images[0]}
        jsonLd={jsonLd}
      />
      <Navbar />
      <div className="container py-8">
        <div className="mb-6 flex items-center justify-between">
          <Link to="/discover" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> Retour aux résultats
          </Link>
          {user && (place.created_by === user.id || p.claimed_by_user_id === user.id) && (
            <Link to={`/edit-place/${place.id}`}>
              <Button variant="outline" size="sm">
                <Pencil className="mr-1.5 h-3.5 w-3.5" /> Modifier
              </Button>
            </Link>
          )}
        </div>

        {/* Hero images */}
        <div className="mb-8 grid gap-2 md:grid-cols-[2fr_1fr]">
          <div className="overflow-hidden rounded-xl">
            <img src={images[selectedImage]} alt={place.name} className="h-80 w-full object-cover md:h-[420px]" />
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 md:flex-col">
              {images.slice(1, 3).map((img, i) => (
                <button key={i} onClick={() => setSelectedImage(i + 1)} className="flex-1 overflow-hidden rounded-xl">
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* ─── Main content ─── */}
          <div>
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{place.type}</Badge>
                  {p.environment_type && <Badge variant="secondary">{ENVIRONMENT_LABELS[p.environment_type] || p.environment_type}</Badge>}
                  <PlaceClaimBadge claimStatus={p.claim_status || "claimed"} isImported={p.is_imported || false} />
                  <Badge className={`text-xs border ${hostingStatus.color}`}>{hostingStatus.label}</Badge>
                </div>
                <h1 className="mt-2 text-3xl font-serif text-foreground">{place.name}</h1>
                {place.short_desc && <p className="mt-1 text-muted-foreground">{place.short_desc}</p>}
                <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" /> {[place.city, place.region].filter(Boolean).join(", ") || "France"}
                </p>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Key facts */}
            <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="rounded-lg border bg-card p-3 text-center">
                <Users className="mx-auto h-5 w-5 text-primary mb-1" />
                <p className="text-lg font-semibold text-foreground">{place.inhabitants || "?"}</p>
                <p className="text-xs text-muted-foreground">habitant·es</p>
              </div>
              {p.year_founded && (
                <div className="rounded-lg border bg-card p-3 text-center">
                  <Calendar className="mx-auto h-5 w-5 text-primary mb-1" />
                  <p className="text-lg font-semibold text-foreground">{p.year_founded}</p>
                  <p className="text-xs text-muted-foreground">année de création</p>
                </div>
              )}
              {place.governance && (
                <div className="rounded-lg border bg-card p-3 text-center">
                  <Handshake className="mx-auto h-5 w-5 text-primary mb-1" />
                  <p className="text-sm font-medium text-foreground leading-tight">{place.governance}</p>
                  <p className="text-xs text-muted-foreground">gouvernance</p>
                </div>
              )}
              {p.environment_type && (
                <div className="rounded-lg border bg-card p-3 text-center">
                  <TreePine className="mx-auto h-5 w-5 text-primary mb-1" />
                  <p className="text-sm font-medium text-foreground">{ENVIRONMENT_LABELS[p.environment_type] || p.environment_type}</p>
                  <p className="text-xs text-muted-foreground">environnement</p>
                </div>
              )}
            </div>

            {/* Description */}
            {place.description && (
              <div className="mb-6">
                <h2 className="mb-3 text-xl font-serif text-foreground">À propos du lieu</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{place.description}</p>
              </div>
            )}

            {/* Video */}
            {p.video_url && (() => {
              const url = p.video_url;
              const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
              const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
              const embedUrl = ytMatch ? `https://www.youtube.com/embed/${ytMatch[1]}` : vimeoMatch ? `https://player.vimeo.com/video/${vimeoMatch[1]}` : null;
              if (!embedUrl) return null;
              return (
                <div className="mb-6">
                  <h2 className="mb-3 text-xl font-serif text-foreground">Vidéo de présentation</h2>
                  <div className="rounded-xl overflow-hidden border aspect-video">
                    <iframe src={embedUrl} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title="Vidéo du lieu" />
                  </div>
                </div>
              );
            })()}

            {/* Ambiance */}
            {place.ambiance && (
              <div className="mb-6">
                <h2 className="mb-3 text-xl font-serif text-foreground">Ambiance & atmosphère</h2>
                <p className="text-muted-foreground leading-relaxed">{place.ambiance}</p>
              </div>
            )}

            {/* Values */}
            {values.length > 0 && (
              <div className="mb-6">
                <h2 className="mb-3 text-xl font-serif text-foreground">Valeurs & mode de vie</h2>
                <CollapsibleBadges mobileLimit={6}>
                  {values.map((v) => (<Badge key={v} variant="secondary">{v}</Badge>))}
                </CollapsibleBadges>
              </div>
            )}

            {/* Features */}
            <div className="mb-6">
              <h2 className="mb-3 text-xl font-serif text-foreground">Caractéristiques</h2>
              <div className="grid grid-cols-2 gap-3">
                {features.map(({ icon: I, label, value: val }) => (
                  <div key={label} className="flex items-center gap-2 text-sm">
                    {val ? <Check className="h-4 w-4 text-primary" /> : <XIcon className="h-4 w-4 text-muted-foreground/40" />}
                    <I className="h-4 w-4 text-muted-foreground" />
                    <span className={val ? "text-foreground" : "text-muted-foreground/60"}>{label}</span>
                  </div>
                ))}
                {place.diet && (
                  <div className="flex items-center gap-2 text-sm">
                    <ChefHat className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">{place.diet}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Rules */}
            {rules.length > 0 && (
              <div className="mb-6">
                <h2 className="mb-3 text-xl font-serif text-foreground">Règles du lieu</h2>
                <ul className="space-y-2">
                  {rules.map((r) => (
                    <li key={r} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{r}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Amenities */}
            {amenities.length > 0 && (
              <div className="mb-6">
                <h2 className="mb-3 text-xl font-serif text-foreground">Espaces partagés</h2>
                <CollapsibleBadges mobileLimit={6}>
                  {amenities.map((a) => (<Badge key={a} variant="outline">{a}</Badge>))}
                </CollapsibleBadges>
              </div>
            )}

            {/* Hospitality block */}
            <div className="mb-6 rounded-xl border bg-card p-5">
              <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
                <h2 className="text-xl font-serif text-foreground">Accueil & hospitalité</h2>
                <Badge className={`text-xs border ${hostingStatus.color}`}>{hostingStatus.label}</Badge>
              </div>

              {hospitalityTypes.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5">Types d'accueil possibles</p>
                  <CollapsibleBadges mobileLimit={4} useShortLabels>
                    {hospitalityTypes.map((t) => (
                      <Badge key={t} variant="secondary" data-short-label={labelFromOptions(HOSPITALITY_TYPES, t, true)}>
                        {labelFromOptions(HOSPITALITY_TYPES, t)}
                      </Badge>
                    ))}
                  </CollapsibleBadges>
                </div>
              )}

              <div className="grid gap-2 text-sm text-muted-foreground">
                {p.hosting_style && <p><strong className="text-foreground">Style d'accueil :</strong> {p.hosting_style}</p>}
                {managedByLabel && <p><strong className="text-foreground">Gestion de l'hospitalité :</strong> {managedByLabel}</p>}
                {p.hospitality_manager && <p><strong className="text-foreground">Référent·e :</strong> {p.hospitality_manager}</p>}
                {vibeLabel && <p><strong className="text-foreground">Ambiance :</strong> {vibeLabel}</p>}
              </div>

              {p.hosting_status === "yes" && (
                <Button onClick={scrollToListings} className="mt-4 w-full sm:w-auto" size="sm">
                  Voir les séjours disponibles
                </Button>
              )}
            </div>

            {/* What this place offers */}
            {offerings.length > 0 && (
              <div className="mb-6">
                <h2 className="mb-1 text-xl font-serif text-foreground">Ce que ce lieu propose</h2>
                <p className="text-xs text-muted-foreground mb-3">Aperçu général — tous les services ne sont pas forcément actifs en permanence.</p>
                <CollapsibleBadges mobileLimit={4} useShortLabels>
                  {offerings.map((o) => (
                    <Badge key={o} variant="outline" className="border-primary/30 text-foreground" data-short-label={labelFromOptions(PLACE_OFFERINGS, o, true)}>
                      <Sparkles className="mr-1 h-3 w-3 text-primary" />
                      {labelFromOptions(PLACE_OFFERINGS, o)}
                    </Badge>
                  ))}
                </CollapsibleBadges>
              </div>
            )}

            {/* Listings in this place */}
            {/* Events */}
            <HabitatEvents
              placeId={place.id}
              canManage={!!user && (place.created_by === user.id || p.claimed_by_user_id === user.id)}
            />

            {/* Listings in this place */}
            <div id="place-stays" className="mb-6 scroll-mt-24">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="text-xl font-serif text-foreground">Séjours disponibles dans ce lieu</h2>
                {hasListings && user && (
                  <Link to={`/listing/${listings[0].id}`}>
                    <Button size="sm">Proposer une visite</Button>
                  </Link>
                )}
              </div>
              {hasListings ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {listings.map((l: any) => (
                    <ListingCard key={l.id} listing={l} />
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed bg-muted/30 p-6 text-center">
                  <Home className="mx-auto h-8 w-8 text-muted-foreground/50 mb-2" />
                  <p className="text-sm font-medium text-foreground">
                    {p.hosting_status === "soon"
                      ? "Bientôt prêts à accueillir"
                      : p.hosting_status === "no"
                      ? "Ce lieu n'accueille pas encore de séjours"
                      : "Aucun séjour publié pour le moment"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
                    {p.hosting_status === "yes" && "Le collectif est ouvert à l'accueil. Revenez bientôt ou contactez-les pour explorer une possibilité."}
                    {p.hosting_status === "soon" && "Le collectif prépare son accueil. Suivez ce lieu pour être prévenu·e dès qu'un séjour est publié."}
                    {p.hosting_status === "no" && "Vous pouvez tout de même découvrir leur projet et leurs valeurs sur cette page."}
                  </p>
                  {isOwnerOrManager ? (
                    <Link to={`/create-listing?place=${place.id}`}>
                      <Button variant="outline" size="sm" className="mt-4">Proposer un séjour</Button>
                    </Link>
                  ) : user ? (
                    <p className="text-xs text-muted-foreground mt-4 italic">
                      Pour proposer un séjour ici, rejoignez d'abord ce lieu.
                    </p>
                  ) : null}
                </div>
              )}
            </div>
          </div>

          {/* ─── Sidebar ─── */}
          <div className="lg:sticky lg:top-24 lg:self-start space-y-4">
            <div className="rounded-xl border bg-card p-6">
              <div className="space-y-3">
                {hasListings && (
                  <Button onClick={scrollToListings} className="w-full" size="lg">
                    <Home className="mr-2 h-4 w-4" />
                    Voir les séjours disponibles
                  </Button>
                )}
                {p.contact_enabled && (
                  <Button variant="outline" className="w-full" size="lg" onClick={scrollToListings}>
                    <Mail className="mr-2 h-4 w-4" />
                    Contacter le lieu
                  </Button>
                )}
                {place.website && (
                  <a href={place.website} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="w-full" size="lg">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Voir leur site
                    </Button>
                  </a>
                )}
                <Button variant="ghost" className="w-full" onClick={() => setLiked(!liked)}>
                  <Heart className={`mr-2 h-4 w-4 ${liked ? "fill-rosa text-rosa" : ""}`} />
                  {liked ? "Enregistré" : "Enregistrer en favori"}
                </Button>
              </div>
            </div>

            {/* Members */}
            {members && members.length > 0 && (
              <div className="rounded-xl border bg-card p-6">
                <h3 className="text-sm font-medium text-foreground mb-3">Membres du collectif</h3>
                <div className="space-y-3">
                  {members.map((m: any) => {
                    const profile = m.profiles;
                    const name = profile?.display_name || "Membre";
                    const avatar = profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
                    const prefs = memberPrefs?.[m.user_id];
                    const { pct } = computeCompletion({
                      avatar_url: profile?.avatar_url,
                      bio: profile?.bio,
                      languages: profile?.languages,
                      preferred_values: prefs?.preferred_values,
                      preferred_regions: prefs?.preferred_regions,
                    });
                    return (
                      <div key={m.id} className="flex items-center gap-3">
                        <img src={avatar} alt={name} className="h-10 w-10 rounded-full object-cover" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
                            <span className="truncate">{name}</span>
                            {pct >= 90 && (
                              <span title="Profil complet" className="inline-flex items-center gap-0.5 rounded-full bg-emerald-100 text-emerald-700 px-1.5 py-0.5 text-[10px] font-semibold">
                                <BadgeCheck className="h-3 w-3" /> Profil complet
                              </span>
                            )}
                          </p>
                          {m.relationship_to_place && <p className="text-xs text-muted-foreground">{m.relationship_to_place}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Reviews — Retours d'expérience */}
            <div className="rounded-xl border bg-card p-6">
              <div className="flex items-center justify-between gap-2 mb-3">
                <h3 className="text-sm font-medium text-foreground">Retours d'expérience</h3>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  {(stayReviews?.length || 0) + (reviews?.length || 0)}
                </span>
              </div>

              {(() => {
                const all = [
                  ...(stayReviews || []).map((r) => ({
                    id: r.id,
                    name: r.author?.display_name || "Visiteur·euse",
                    avatar: r.author?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(r.author?.display_name || "V")}&background=random`,
                    text: r.text || "",
                    rating: r.rating,
                    photos: r.photos_urls || [],
                    created_at: r.created_at,
                  })),
                  ...(reviews || []).map((r) => ({
                    id: r.id,
                    name: r.author?.display_name || "Visiteur·euse",
                    avatar: r.author?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(r.author?.display_name || "V")}&background=random`,
                    text: r.review_text || "",
                    rating: r.hospitality_rating || r.collective_experience_rating || r.clarity_rating || null,
                    photos: [] as string[],
                    created_at: r.created_at,
                  })),
                ];

                if (all.length === 0) {
                  return (
                    <div className="text-center py-3">
                      <MessageSquare className="mx-auto h-6 w-6 text-muted-foreground/40 mb-1.5" />
                      <p className="text-xs text-muted-foreground">Aucun retour pour le moment.</p>
                    </div>
                  );
                }

                const visible = showAllStayReviews ? all : all.slice(0, 5);
                const relativeDate = (d: string | null) => {
                  if (!d) return null;
                  const diff = Date.now() - new Date(d).getTime();
                  const days = Math.floor(diff / 86_400_000);
                  if (days < 1) return "Aujourd'hui";
                  if (days < 7) return `Il y a ${days} j`;
                  if (days < 30) return `Il y a ${Math.floor(days / 7)} sem.`;
                  if (days < 365) return `Il y a ${Math.floor(days / 30)} mois`;
                  return `Il y a ${Math.floor(days / 365)} an${days >= 730 ? "s" : ""}`;
                };

                return (
                  <div className="space-y-5">
                    {visible.map((rv) => {
                      const isExpanded = expandedReviews[rv.id];
                      const shouldTruncate = rv.text.length > 300;
                      const displayText = shouldTruncate && !isExpanded ? rv.text.slice(0, 300) + "…" : rv.text;
                      return (
                        <div key={rv.id} className="space-y-2">
                          <div className="flex items-center gap-2.5">
                            <img src={rv.avatar} alt={rv.name} className="h-8 w-8 rounded-full object-cover" />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-foreground truncate">{rv.name}</p>
                              <p className="text-[10px] text-muted-foreground">{relativeDate(rv.created_at)}</p>
                            </div>
                          </div>
                          {rv.rating !== null && rv.rating !== undefined && (
                            <div className="flex items-center gap-0.5">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3.5 w-3.5 ${i < (rv.rating as number) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`}
                                />
                              ))}
                            </div>
                          )}
                          {rv.text && (
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {displayText}
                              {shouldTruncate && (
                                <button
                                  onClick={() => setExpandedReviews((prev) => ({ ...prev, [rv.id]: !prev[rv.id] }))}
                                  className="ml-1 text-xs font-medium text-primary hover:underline"
                                >
                                  {isExpanded ? "Réduire" : "Lire la suite"}
                                </button>
                              )}
                            </p>
                          )}
                          {rv.photos.length > 0 && (
                            <div className="flex gap-1.5 pt-1">
                              {rv.photos.slice(0, 3).map((p, i) => (
                                <button
                                  key={i}
                                  type="button"
                                  onClick={() => setLightbox(p)}
                                  className="relative h-16 w-16 rounded-md overflow-hidden border bg-muted hover:opacity-90"
                                >
                                  <img src={p} alt="" className="h-full w-full object-cover" />
                                  {i === 2 && rv.photos.length > 3 && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-xs font-medium text-white">
                                      +{rv.photos.length - 3}
                                    </div>
                                  )}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {all.length > 5 && (
                      <button
                        onClick={() => setShowAllStayReviews((v) => !v)}
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        {showAllStayReviews ? "Voir moins" : `Voir tous les retours (${all.length})`}
                      </button>
                    )}
                  </div>
                );
              })()}

              <div className="mt-4 pt-3 border-t space-y-2">
                <Link to={`/post-stay-review?place_id=${place.id}`}>
                  <Button variant="outline" size="sm" className="w-full">
                    <MessageSquare className="mr-1.5 h-3.5 w-3.5" />
                    Partager mon expérience
                  </Button>
                </Link>
                <p className="text-[10px] text-muted-foreground text-center italic">
                  Retours modérés pour qualité
                </p>
              </div>
            </div>

            {/* Lightbox */}
            {lightbox && (
              <div
                onClick={() => setLightbox(null)}
                className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 cursor-zoom-out"
              >
                <img src={lightbox} alt="" className="max-h-[90vh] max-w-full rounded-lg" />
              </div>
            )}

            {/* Claim — quick "I live here too" entry */}
            {user && place.created_by !== user.id && p.claimed_by_user_id !== user.id && (
              <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-5 flex flex-col sm:flex-row sm:items-center gap-3">
                <Home className="h-5 w-5 text-primary shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">J'habite ici aussi</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Rejoignez {place.name} en tant que co-habitant·e et participez à la fiche.
                  </p>
                </div>
                <Button size="sm" variant="secondary" onClick={() => setShowClaimModal(true)}>
                  J'habite ici
                </Button>
              </div>
            )}

            {/* Full claim form (admin-review flow) — shown to anonymous users or as fallback */}
            {!user && (
              <PlaceClaimRequestForm placeId={place.id} placeName={place.name} claimStatus={p.claim_status || "claimed"} />
            )}

            <ClaimPlaceModal
              placeId={place.id}
              placeName={place.name}
              isOpen={showClaimModal}
              onClose={() => setShowClaimModal(false)}
            />
          </div>
        </div>
      </div>
      {/* Signalement */}
      <div className="container px-5 py-4 flex justify-center">
        <ReportButton targetType="place" targetId={p.id} variant="text" />
      </div>

      {/* Barre d'action fixe — mobile */}
      {(hasListings || p.contact_enabled) && (
        <>
          <div className="h-20 lg:hidden" />
          <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur px-4 py-3 lg:hidden">
            <div className="mx-auto flex max-w-6xl items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{place.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {[place.city, place.region].filter(Boolean).join(", ")}
                </p>
              </div>
              <Button onClick={scrollToListings}>
                <Home className="mr-1.5 h-4 w-4" /> {hasListings ? "Voir les séjours" : "Contacter"}
              </Button>
            </div>
          </div>
        </>
      )}
      <Footer />
    </div>
  );
};

export default HabitatDetail;
