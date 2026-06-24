/* ─── Casa Minga — Single source of truth for the 5 listing types ───
 * Label + short description + icon for each `listing_type` enum value.
 * Every surface (card, detail, create/edit, filters) must read from here
 * so the "mix of 3" stays consistent and immediately understandable.
 */
import {
  ArrowLeftRight,
  BedDouble,
  DoorOpen,
  Sprout,
  HeartHandshake,
  type LucideIcon,
} from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

export type ListingType = Database["public"]["Enums"]["listing_type"];

export interface ListingTypeMeta {
  /** Short, clear French label */
  label: string;
  /** One sentence explaining what this type implies for the guest */
  shortDescription: string;
  /** lucide-react icon (already the project's icon set) */
  icon: LucideIcon;
}

export const LISTING_TYPE_META: Record<ListingType, ListingTypeMeta> = {
  home_exchange: {
    label: "Échange de logement",
    shortDescription: "Vous échangez votre logement avec l'hôte, chacun chez l'autre.",
    icon: ArrowLeftRight,
  },
  private_room: {
    label: "Chambre privée",
    shortDescription: "Une chambre rien que pour vous, dans un logement partagé avec l'hôte.",
    icon: BedDouble,
  },
  guest_room: {
    label: "Chambre d'amis",
    shortDescription: "La chambre d'amis de l'hôte, qui vous accueille chez lui.",
    icon: DoorOpen,
  },
  immersion_stay: {
    label: "Séjour immersif",
    shortDescription: "Vous partagez le quotidien du lieu et participez à sa vie collective.",
    icon: Sprout,
  },
  hosted_stay: {
    label: "Séjour accompagné",
    shortDescription: "Un séjour accompagné par l'hôte, présent pour vous guider.",
    icon: HeartHandshake,
  },
};

/** Stable display order for selects and filters. */
export const LISTING_TYPE_ORDER: ListingType[] = [
  "home_exchange",
  "private_room",
  "guest_room",
  "immersion_stay",
  "hosted_stay",
];

/** Safe label lookup with a sensible fallback for unknown values. */
export function listingTypeLabel(type: string | null | undefined): string {
  if (!type) return "";
  return LISTING_TYPE_META[type as ListingType]?.label ?? type;
}

/** Meta lookup (label + description + icon) for a given type, or undefined. */
export function listingTypeMeta(type: string | null | undefined): ListingTypeMeta | undefined {
  if (!type) return undefined;
  return LISTING_TYPE_META[type as ListingType];
}
