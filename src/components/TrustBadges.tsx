import { CheckCircle2, Star, Calendar, MessageSquare, Home, Shield } from "lucide-react";
import { useGuestHostReviews } from "@/hooks/use-host-reviews";
import { useMyListings } from "@/hooks/use-listings";

interface TrustBadgesProps {
  userId: string;
  createdAt?: string | null;
  hasAvatar?: boolean;
  hasBio?: boolean;
  /** Affichage compact (pour la carte hôte) ou complet (page profil) */
  variant?: "compact" | "full";
}

interface Badge {
  icon: React.ElementType;
  label: string;
  color: string;
}

function computeBadges({
  createdAt,
  hasAvatar,
  hasBio,
  reviewCount,
  listingCount,
}: {
  createdAt?: string | null;
  hasAvatar?: boolean;
  hasBio?: boolean;
  reviewCount: number;
  listingCount: number;
}): Badge[] {
  const badges: Badge[] = [];

  // Email vérifié — toujours vrai si l'utilisateur est connecté et visible
  badges.push({ icon: CheckCircle2, label: "Email vérifié", color: "text-emerald-600 bg-emerald-50 border-emerald-200" });

  // Photo de profil
  if (hasAvatar) {
    badges.push({ icon: Shield, label: "Profil avec photo", color: "text-blue-600 bg-blue-50 border-blue-200" });
  }

  // Ancienneté
  if (createdAt) {
    const years = new Date().getFullYear() - new Date(createdAt).getFullYear();
    if (years >= 1) {
      badges.push({
        icon: Calendar,
        label: years === 1 ? "Membre depuis 1 an" : `Membre depuis ${years} ans`,
        color: "text-violet-600 bg-violet-50 border-violet-200",
      });
    }
  }

  // Avis reçus
  if (reviewCount >= 1) {
    badges.push({
      icon: Star,
      label: reviewCount === 1 ? "1 avis" : `${reviewCount} avis`,
      color: "text-amber-600 bg-amber-50 border-amber-200",
    });
  }

  // Séjour actif
  if (listingCount >= 1) {
    badges.push({
      icon: Home,
      label: listingCount === 1 ? "1 séjour publié" : `${listingCount} séjours publiés`,
      color: "text-teal-600 bg-teal-50 border-teal-200",
    });
  }

  // Super hôte (5+ avis)
  if (reviewCount >= 5) {
    badges.push({ icon: Star, label: "Super hôte", color: "text-orange-600 bg-orange-50 border-orange-200" });
  }

  return badges;
}

export default function TrustBadges({ userId, createdAt, hasAvatar, hasBio, variant = "compact" }: TrustBadgesProps) {
  const { data: reviews = [] } = useGuestHostReviews(userId);
  const { data: listings = [] } = useMyListings(userId);

  const badges = computeBadges({
    createdAt,
    hasAvatar,
    hasBio,
    reviewCount: reviews.length,
    listingCount: listings.filter((l: any) => l.published).length,
  });

  const displayed = variant === "compact" ? badges.slice(0, 3) : badges;

  if (displayed.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {displayed.map((badge) => (
        <span
          key={badge.label}
          className={`inline-flex items-center gap-1 text-xs border rounded-full px-2 py-0.5 ${badge.color}`}
        >
          <badge.icon className="h-3 w-3" />
          {badge.label}
        </span>
      ))}
      {variant === "compact" && badges.length > 3 && (
        <span className="inline-flex items-center text-xs text-muted-foreground px-1">
          +{badges.length - 3}
        </span>
      )}
    </div>
  );
}
