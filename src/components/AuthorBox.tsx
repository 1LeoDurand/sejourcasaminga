import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

/**
 * Author byline shown at the foot of articles/guides, linking to the dedicated
 * author page. Image is a static optimized asset (public/images/auteur/leo.webp).
 */
export default function AuthorBox() {
  const { t } = useTranslation();
  return (
    <Link
      to="/auteur"
      className="mt-14 flex items-center gap-4 rounded-xl border bg-card p-4 transition-shadow hover:shadow-md"
    >
      <img
        src="/images/auteur/leo.webp"
        alt={t("author.name")}
        className="h-14 w-14 shrink-0 rounded-full object-cover"
        loading="lazy"
        width={56}
        height={56}
      />
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{t("author.name")}</p>
        <p className="text-sm text-muted-foreground">{t("author.tagline")}</p>
      </div>
    </Link>
  );
}
