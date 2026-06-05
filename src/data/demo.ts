/* ─── Casa Minga — Shared constants & static content ─── */
import avatar1 from "@/assets/avatar-1.webp";
import avatar2 from "@/assets/avatar-2.webp";
import avatar3 from "@/assets/avatar-3.webp";

export type ListingType = "home_exchange" | "private_room" | "guest_room" | "immersion_stay" | "hosted_stay";
export type CollectiveRelationship = "personal" | "known_by_collective" | "collective_supported" | "collective_run";

// ═══════════ CONSTANTS ═══════════

export const HABITAT_TYPES = [
  "Habitat participatif",
  "Écolieu",
  "Coopérative d'habitants",
  "Colocation intergénérationnelle",
  "Tiers-lieu résidentiel",
  "Communauté intentionnelle",
];

export const LISTING_TYPE_LABELS: Record<ListingType, string> = {
  home_exchange: "Échange de logement",
  private_room: "Chambre privée",
  guest_room: "Chambre d'amis",
  immersion_stay: "Séjour immersif",
  hosted_stay: "Séjour accompagné",
};

export const RELATIONSHIP_LABELS: Record<CollectiveRelationship, string> = {
  personal: "Annonce personnelle",
  known_by_collective: "Connue du collectif",
  collective_supported: "Soutenue par le collectif",
  collective_run: "Gérée par le collectif",
};

export const VALUE_TAGS = [
  "Écologie", "Gouvernance partagée", "Sobriété", "Agroécologie",
  "Famille", "Artistes", "Seniors", "Permaculture", "Low-tech",
  "Bien-être", "Éducation alternative", "Spiritualité laïque",
  "Inclusion", "Autonomie alimentaire", "Résilience",
];

export const VIBE_OPTIONS = [
  { value: "calm", label: "Calme & contemplatif", shortLabel: "Calme" },
  { value: "balanced", label: "Équilibré", shortLabel: "Équilibré" },
  { value: "festive", label: "Animé & festif", shortLabel: "Festif" },
];

export const HOSPITALITY_TYPES = [
  { value: "private_room", label: "Chambre privée", shortLabel: "Ch. privée" },
  { value: "independent_apartment", label: "Appartement indépendant", shortLabel: "Appart." },
  { value: "immersion", label: "Séjour immersif", shortLabel: "Immersion" },
  { value: "participatory", label: "Séjour participatif", shortLabel: "Participatif" },
  { value: "occasional", label: "Hébergement ponctuel", shortLabel: "Ponctuel" },
];

export const HOSPITALITY_MANAGED_BY = [
  { value: "one_member", label: "Un·e membre", shortLabel: "1 membre" },
  { value: "several_members", label: "Plusieurs membres", shortLabel: "Plusieurs" },
  { value: "collective", label: "Le collectif entier", shortLabel: "Collectif" },
];

export const PLACE_OFFERINGS = [
  { value: "stays", label: "Séjours", shortLabel: "Séjours" },
  { value: "discovery_visits", label: "Visites de découverte", shortLabel: "Visites" },
  { value: "participatory_stays", label: "Séjours participatifs", shortLabel: "Participatifs" },
  { value: "training", label: "Formations", shortLabel: "Formations" },
  { value: "events", label: "Événements", shortLabel: "Événements" },
  { value: "workshops", label: "Ateliers", shortLabel: "Ateliers" },
];

// ═══════════ TESTIMONIALS (static editorial content) ═══════════

export const DEMO_TESTIMONIALS = [
  {
    text: "On est arrivés chez Jean-Marc au Plessis avec nos enfants. Dès le premier soir, on était à table avec le collectif. Les gamins ont nourri les poules, fait du pain, dormi sous les étoiles.",
    author: "Marine & Romain",
    habitat: "Chez Jean-Marc, Écohameau du Plessis",
    avatar: avatar1,
  },
  {
    text: "J'ai passé une semaine dans la chambre d'amis du Village Vertical. Éric m'a fait découvrir la sociocratie, j'en suis reparti avec des amis et une vision du possible.",
    author: "Thomas",
    habitat: "Chambre d'amis du Village Vertical",
    avatar: avatar2,
  },
  {
    text: "Chez Thierry à Verfeil, c'est l'autoconstruction, la musique, les repas dehors. On a dormi dans une maison bâtie à la main. Ce n'est pas du tourisme, c'est de l'hospitalité.",
    author: "Amina",
    habitat: "Chez Thierry, Écohameau de Verfeil",
    avatar: avatar3,
  },
];
