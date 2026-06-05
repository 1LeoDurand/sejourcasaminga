import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Compass, BookOpen, Home, Search } from "lucide-react";

const NotFound = () => {
  const { t } = useTranslation();
  const location = useLocation();

  useEffect(() => {
    console.error("404 — route inexistante :", location.pathname);
  }, [location.pathname]);

  const LINKS = [
    { to: "/discover", label: t("notFound.linkDiscover"), icon: Compass },
    { to: "/ressources", label: t("notFound.linkResources"), icon: BookOpen },
    { to: "/comment-ca-marche", label: t("notFound.linkHow"), icon: Search },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO title={`${t("notFound.title")} — Casa Minga`} noindex />
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-5 py-20">
        <div className="text-center max-w-lg">
          <p className="font-serif text-6xl md:text-7xl text-primary/30 mb-2">404</p>
          <h1 className="font-serif text-2xl md:text-3xl text-foreground mb-3">{t("notFound.title")}</h1>
          <p className="text-muted-foreground mb-8">{t("notFound.message")}</p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
            <Link to="/">
              <Button size="lg" className="rounded-full px-7">
                <Home className="h-4 w-4" /> {t("notFound.home")}
              </Button>
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="group rounded-xl border bg-card p-4 transition-shadow hover:shadow-md"
              >
                <l.icon className="h-5 w-5 text-primary mb-2 mx-auto" />
                <span className="text-sm font-medium text-foreground group-hover:text-primary">{l.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
