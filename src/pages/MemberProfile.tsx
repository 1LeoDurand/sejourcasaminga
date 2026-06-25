import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Loader2, MapPin, Star, Quote, Award, MessageSquare, Languages as LanguagesIcon } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { breadcrumbLd } from "@/lib/structured-data";
import ListingCard from "@/components/ListingCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useHostProfile } from "@/hooks/use-profile";
import { useHostListings } from "@/hooks/use-listings";
import { useGuestHostReviews } from "@/hooks/use-host-reviews";
import { useIsMemberVerified } from "@/hooks/use-verification";
import MemberBadges from "@/components/MemberBadges";

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

const MemberProfile = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { data: profile, isLoading: loadingProfile } = useHostProfile(id);
  const { data: listings, isLoading: loadingListings } = useHostListings(id);
  const { data: reviews } = useGuestHostReviews(id);
  const { data: isVerified } = useIsMemberVerified(id);

  // Average rating from received reviews that carry a score.
  const ratedReviews = (reviews ?? []).filter((r) => typeof r.rating === "number" && r.rating > 0);
  const avgRating =
    ratedReviews.length > 0
      ? ratedReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / ratedReviews.length
      : null;

  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container px-5 py-20 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container px-5 py-20 text-center">
          <h1 className="text-2xl text-foreground">{t("memberProfile.notFound")}</h1>
          <Link to="/discover" className="mt-4 inline-block text-primary underline">
            {t("memberProfile.explore")}
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const name = profile.display_name || t("memberProfile.member");
  const avatar = profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
  const memberSince = profile.created_at
    ? format(new Date(profile.created_at), "MMMM yyyy", { locale: fr })
    : null;
  const languages: string[] = Array.isArray((profile as any).languages) ? (profile as any).languages : [];
  // Soft location derived from a published place (profiles have no location field)
  const placeRegion = (listings?.[0] as any)?.places?.region || (listings?.[0] as any)?.places?.city || null;

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={`${name} | Casa Minga`}
        description={t("memberProfile.seoDesc", { name })}
        canonical={`/membre/${id}`}
        image={profile?.avatar_url || undefined}
        jsonLd={breadcrumbLd([
          { name: "Accueil", url: "/" },
          { name, url: `/membre/${id}` },
        ])}
      />
      <Navbar />

      <div className="container px-5 py-8 max-w-5xl">
        {/* ── Header ── */}
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <Avatar className="h-20 w-20">
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback className="text-xl">{name.slice(0, 1).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h1 className="text-2xl md:text-3xl text-foreground">{name}</h1>
            {avgRating !== null && (
              <div className="mt-1.5 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-sm font-medium text-foreground">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  {avgRating.toFixed(1)}
                </span>
                <span className="text-sm text-muted-foreground">
                  {t("memberProfile.reviewCount", { count: ratedReviews.length })}
                </span>
              </div>
            )}
            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              {placeRegion && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" /> {placeRegion}
                </span>
              )}
              {memberSince && <span>{t("memberProfile.memberSince", { date: memberSince })}</span>}
            </div>
            {languages.length > 0 && (
              <div className="mt-1.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                <LanguagesIcon className="h-4 w-4" />
                {languages.join(" · ")}
              </div>
            )}
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="mt-5 max-w-2xl text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
            {profile.bio}
          </p>
        )}

        {/* Hosting style / experience */}
        {(profile.hosting_style || profile.collective_experience) && (
          <div className="mt-4 flex flex-wrap gap-2">
            {profile.hosting_style && (
              <Badge variant="secondary" className="text-xs">{profile.hosting_style}</Badge>
            )}
            {profile.collective_experience && (
              <Badge variant="outline" className="text-xs">{profile.collective_experience}</Badge>
            )}
          </div>
        )}

        {/* ── Badges ── */}
        <div className="mt-8">
          <h2 className="text-lg text-foreground mb-3 flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            {t("memberProfile.badges")}
          </h2>
          <MemberBadges
            verified={isVerified}
            createdAt={profile.created_at}
            placeIds={(listings ?? []).map((l: any) => l.place_id).filter(Boolean)}
          />
        </div>

        {/* ── Published stays ── */}
        <div className="mt-8">
          <h2 className="text-lg text-foreground mb-4">{t("memberProfile.stays")}</h2>
          {loadingListings ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : listings && listings.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {listings.map((l: any) => (
                <ListingCard key={l.id} listing={l} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed bg-card px-4 py-8 text-center">
              <p className="text-sm text-muted-foreground">{t("memberProfile.noStays")}</p>
            </div>
          )}
        </div>

        {/* ── Reviews received ── */}
        <div className="mt-8">
          <h2 className="text-lg text-foreground mb-4 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            {t("memberProfile.reviewsReceived")}
          </h2>
          {reviews && reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((r) => {
                const authorName = r.host?.display_name || t("memberProfile.host");
                const authorAvatar =
                  r.host?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=random`;
                return (
                  <div key={r.id} className="rounded-xl border bg-card p-4">
                    <div className="flex items-start gap-3">
                      <img src={authorAvatar} alt={authorName} className="h-9 w-9 rounded-full object-cover shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium text-foreground">{authorName}</p>
                          {r.created_at && (
                            <p className="text-xs text-muted-foreground shrink-0">
                              {format(new Date(r.created_at), "d MMM yyyy", { locale: fr })}
                            </p>
                          )}
                        </div>
                        {r.rating && <StarRating rating={r.rating} />}
                        {r.text && (
                          <p className="mt-1.5 flex gap-1.5 text-sm text-muted-foreground leading-relaxed">
                            <Quote className="h-3.5 w-3.5 shrink-0 text-primary/30 mt-0.5" />
                            {r.text}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed bg-card px-4 py-8 text-center">
              <p className="text-sm text-muted-foreground">{t("memberProfile.noReviews")}</p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default MemberProfile;
