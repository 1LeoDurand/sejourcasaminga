import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft, MapPin, Users, Home, Shield, Heart, Mail,
  ChevronRight, Eye, Loader2, Calendar, Send, Pencil, Clock,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { LISTING_TYPE_LABELS, RELATIONSHIP_LABELS } from "@/data/demo";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateExchangeRequest } from "@/hooks/use-exchange-requests";
import { useListing } from "@/hooks/use-listings";
import { useHostProfile } from "@/hooks/use-profile";
import { toast } from "@/hooks/use-toast";

const ListingDetail = () => {
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

  const EXCHANGE_LABELS: Record<string, string> = {
    free: "Accueil gratuit",
    reciprocal: "Échange réciproque",
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

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={seoTitle}
        description={seoDesc}
        canonical={`/listing/${listing.id}`}
        image={listing.image || undefined}
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

      {/* Hero image */}
      <div className="container px-5">
        <div className="overflow-hidden rounded-2xl">
          <img src={listing.image || "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&h=600&fit=crop"} alt={listing.title} className="w-full h-64 md:h-96 object-cover" />
        </div>
      </div>

      {/* Content */}
      <div className="container px-5 py-8 max-w-3xl">
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

        {/* Host card */}
        <div className="mt-6 rounded-xl border bg-warm p-4 flex items-center gap-4">
          <img src={hostAvatar} alt={hostName} className="h-14 w-14 rounded-full object-cover ring-2 ring-border" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">Accueilli par {hostName}</p>
            {hostProfile?.hosting_style && <p className="text-xs text-muted-foreground mt-0.5">{hostProfile.hosting_style}</p>}
            {hostProfile?.collective_experience && <p className="text-xs text-muted-foreground">{hostProfile.collective_experience}</p>}
          </div>
        </div>

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

        {/* Description */}
        {listing.description && (
          <div className="mt-8">
            <h2 className="text-lg text-foreground mb-2">Le séjour</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{listing.description}</p>
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

        {/* Rules */}
        {listing.practical_rules && listing.practical_rules.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg text-foreground mb-2">Règles pratiques</h2>
            <ul className="space-y-1">
              {listing.practical_rules.map((r) => (
                <li key={r} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-primary mt-1">•</span> {r}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Availability */}
        {listing.availability_notes && (
          <div className="mt-6 rounded-xl bg-crema border p-4">
            <p className="text-sm font-medium text-foreground mb-1">Disponibilité</p>
            <p className="text-sm text-muted-foreground">{listing.availability_notes}</p>
          </div>
        )}

        {/* CTA */}
        <div className="mt-8 space-y-4">
          {!showRequestForm ? (
            <div className="flex flex-col sm:flex-row gap-3">
              {user ? (
                <Button size="lg" onClick={() => setShowRequestForm(true)}>
                  <Send className="mr-2 h-4 w-4" />
                  Envoyer une demande de séjour
                </Button>
              ) : (
                <Link to="/auth?tab=signup">
                  <Button size="lg" className="w-full sm:w-auto">
                    Inscrivez-vous pour contacter {hostName}
                  </Button>
                </Link>
              )}
            </div>
          ) : showPreview ? (
            <div className="rounded-xl border bg-card p-6 space-y-4">
              <h3 className="text-lg text-foreground font-medium">Confirmez votre demande</h3>
              <dl className="text-sm divide-y rounded-lg border bg-muted/30">
                <PreviewRow label="Habitat" value={listing.title} />
                <PreviewRow label="Hôte" value={hostName} />
                <PreviewRow label="Arrivée" value={startDate} />
                <PreviewRow label="Départ" value={endDate} />
                <PreviewRow label="Voyageurs" value={guests} />
                <PreviewRow label="Type d'échange" value={EXCHANGE_LABELS[exchangeType]} />
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
            <form onSubmit={handleGoToPreview} className="rounded-xl border bg-card p-6 space-y-4">
              <h3 className="text-lg text-foreground font-medium">Demande de séjour</h3>
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
                      <SelectItem value="other">Autre arrangement</SelectItem>
                    </SelectContent>
                  </Select>
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
              <div className="flex gap-3">
                <Button type="submit" disabled={!startDate || !endDate || !acceptedTerms}>
                  Aperçu de la demande
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowRequestForm(false)}>Annuler</Button>
              </div>
            </form>
          )}
        </div>
      </div>

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
