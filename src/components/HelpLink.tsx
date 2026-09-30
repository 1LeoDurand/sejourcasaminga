import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { HelpCircle } from "lucide-react";

/**
 * Contextual help: links to a help article by slug. If the slug does not exist
 * (yet) the article route redirects to /aide, so this never leads to a 404.
 */
const HelpLink = ({ slug, className = "" }: { slug: string; className?: string }) => {
  const { t } = useTranslation();
  return (
    <Link
      to={`/aide/${slug}`}
      className={`inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors ${className}`}
    >
      <HelpCircle className="h-4 w-4" aria-hidden="true" />
      {t("aide.helpLink")}
    </Link>
  );
};

export default HelpLink;
