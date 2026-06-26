import { Link, useParams } from "react-router-dom";
import listingPlaceholder from "@/assets/listing-placeholder.webp";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Heart, Loader2, Copy, Check } from "lucide-react";
import { useSharedWishlistByToken } from "@/hooks/use-favorites";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { toast } from "sonner";

const FALLBACK_IMG = listingPlaceholder;

const SharedWishlist = () => {
  const { token } = useParams<{ token: string }>();
  const { data, isLoading } = useSharedWishlistByToken(token);
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success("Lien copié");
    setTimeout(() => setCopied(false), 2000);
  };

  const ownerName = data?.owner?.display_name || "Un voyageur";

  return (
    <div className="min-h-screen">
      <SEO
        title={`Wishlist de ${ownerName} | Casa Minga`}
        description={`Découvrez les habitats favoris de ${ownerName} sur Casa Minga.`}
      />
      <Navbar />
      <div className="container py-8 px-4 md:px-8">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : !data ? (
          <div className="py-20 text-center">
            <h1 className="font-serif text-2xl">Wishlist introuvable</h1>
            <p className="mt-2 text-muted-foreground">Le lien n'est plus valide.</p>
            <Button asChild className="mt-4">
              <Link to="/discover">Découvrir des habitats</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h1 className="font-serif text-3xl md:text-4xl text-foreground">
                  La wishlist de {ownerName}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  {data.favorites.length} habitat{data.favorites.length > 1 ? "s" : ""} sélectionné
                  {data.favorites.length > 1 ? "s" : ""}.
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={copyLink}>
                  {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                  Copier le lien
                </Button>
                {!user && (
                  <Button asChild>
                    <Link to="/auth">Créer un compte pour sauvegarder</Link>
                  </Button>
                )}
              </div>
            </div>

            {data.favorites.length === 0 ? (
              <div className="mt-12 text-center">
                <Heart className="mx-auto mb-4 h-12 w-12 text-muted-foreground/40" />
                <p className="text-muted-foreground">Cette wishlist est encore vide.</p>
              </div>
            ) : (
              <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {data.favorites.map((f: any) => {
                  const l = f.listings;
                  if (!l) return null;
                  const place = l.places;
                  const img =
                    (Array.isArray(l.images) && l.images[0]) || l.image || FALLBACK_IMG;
                  const location = place
                    ? `${place.name}${place.region ? `, ${place.region}` : ""}`
                    : "";
                  const values: string[] = place?.values || [];
                  return (
                    <Link
                      to={`/listing/${l.slug || l.id}`}
                      key={f.id}
                      className="group overflow-hidden rounded-xl border bg-card transition-all hover:shadow-md hover:-translate-y-0.5"
                    >
                      <div className="aspect-[4/3] overflow-hidden">
                        <img src={img} alt={l.title} className="h-full w-full object-cover" />
                      </div>
                      <div className="p-4">
                        <h3 className="font-serif text-lg leading-snug line-clamp-2 group-hover:text-primary">
                          {l.title}
                        </h3>
                        {location && (
                          <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" /> {location}
                          </div>
                        )}
                        {values.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {values.slice(0, 3).map((v) => (
                              <Badge key={v} variant="secondary" className="text-[0.6rem]">
                                {v}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default SharedWishlist;
