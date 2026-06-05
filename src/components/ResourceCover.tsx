import { BookOpen, Film, Clapperboard, Mic, FileText, Compass, LucideIcon } from "lucide-react";

const TYPE_ICON: Record<string, LucideIcon> = {
  livre: BookOpen,
  film: Film,
  documentaire: Clapperboard,
  podcast: Mic,
  article: FileText,
  guide: Compass,
};

/**
 * Resource cover image with a typed fallback (gradient + icon) when no image is set.
 * Keeps resource cards visually consistent even without a cover.
 */
export default function ResourceCover({
  image,
  title,
  type,
  className = "",
}: {
  image?: string | null;
  title: string;
  type: string;
  className?: string;
}) {
  if (image) {
    return <img src={image} alt={title} className={className} loading="lazy" />;
  }
  const Icon = TYPE_ICON[type] || FileText;
  return (
    <div
      className={`flex items-center justify-center bg-gradient-to-br from-primary/15 to-primary/5 ${className}`}
      aria-hidden="true"
    >
      <Icon className="h-10 w-10 text-primary/40" />
    </div>
  );
}
