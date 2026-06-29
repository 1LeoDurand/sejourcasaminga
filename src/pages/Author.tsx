import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO, { SITE_URL } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

const Author = () => {
  const { t } = useTranslation();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Léo Durand",
    url: `${SITE_URL}/auteur`,
    image: `${SITE_URL}/images/auteur/leo.webp`,
    jobTitle: t("author.role"),
    description: t("author.bio"),
    worksFor: { "@type": "Organization", name: "Casa Minga", url: SITE_URL },
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO
        title="Léo Durand — Casa Minga"
        description={t("author.metaDesc")}
        canonical="/auteur"
        image={`${SITE_URL}/images/auteur/leo.webp`}
        jsonLd={jsonLd}
      />
      <Navbar />
      <main className="flex-1">
        <article className="container max-w-2xl py-10 md:py-14">
          <nav
            aria-label="Fil d'Ariane"
            className="mb-8 flex items-center gap-1.5 text-xs text-muted-foreground"
          >
            <Link to="/" className="hover:text-foreground transition-colors">{t("nav.home")}</Link>
            <ChevronRight className="h-3 w-3" aria-hidden="true" />
            <span className="text-foreground">Léo Durand</span>
          </nav>

          <div className="flex flex-col items-center text-center">
            <img
              src="/images/auteur/leo.webp"
              alt="Léo Durand"
              className="h-32 w-32 rounded-full object-cover ring-2 ring-border"
              width={128}
              height={128}
            />
            <h1 className="mt-5 font-serif font-bold text-3xl md:text-4xl text-foreground">Léo Durand</h1>
            <p className="mt-1 text-muted-foreground">{t("author.role")}</p>
          </div>

          <div className="prose prose-stone max-w-none mt-8 prose-p:leading-relaxed">
            {t("author.bio")
              .split("\n\n")
              .map((para, i) => (
                <p key={i}>{para}</p>
              ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild variant="outline">
              <Link to="/a-propos">{t("author.linkAbout")}</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/contact">{t("author.linkContact")}</Link>
            </Button>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
};

export default Author;
