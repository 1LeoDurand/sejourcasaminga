import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import logo from "@/assets/logo.png";

const Footer = () => {
  const { t } = useTranslation();
  return (
    <footer className="border-t bg-card">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img src={logo} alt="Casa Minga" className="h-8 w-8 object-contain" />
              <span className="font-serif text-lg text-foreground">Casa Minga</span>
            </Link>
            <p className="text-sm text-muted-foreground">{t("footer.tagline")}</p>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold text-foreground">{t("footer.discover")}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/discover" className="hover:text-foreground transition-colors">{t("footer.allPlaces")}</Link></li>
              <li><Link to="/discover?type=ecolieu" className="hover:text-foreground transition-colors">{t("footer.ecolieux")}</Link></li>
              <li><Link to="/discover?type=cooperatif" className="hover:text-foreground transition-colors">{t("footer.coops")}</Link></li>
              <li><Link to="/discover?type=colocation" className="hover:text-foreground transition-colors">{t("footer.shared")}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold text-foreground">{t("footer.casaMinga")}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/a-propos" className="hover:text-foreground transition-colors">{t("footer.casaMinga")}</Link></li>
              <li><Link to="/comment-ca-marche" className="hover:text-foreground transition-colors">{t("footer.howItWorks")}</Link></li>
              <li><Link to="/hospitalite" className="hover:text-foreground transition-colors">{t("footer.hospitality")}</Link></li>
              <li><Link to="/auth?tab=signup" className="hover:text-foreground transition-colors">{t("footer.createAccount")}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold text-foreground">{t("footer.community")}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/communaute" className="hover:text-foreground transition-colors">{t("footer.community")}</Link></li>
              <li><Link to="/charte" className="hover:text-foreground transition-colors">{t("footer.charter")}</Link></li>
              <li><Link to="/contact" className="hover:text-foreground transition-colors">{t("footer.contact")}</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-6 text-center text-xs text-muted-foreground">
          {t("footer.copyright")}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
