import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { ArrowRight, HeartHandshake, RefreshCw, DoorOpen } from "lucide-react";

const Hospitality = () => {
  const { t } = useTranslation();

  const PILLARS = [
    { icon: DoorOpen, title: t("hospitality.pillar1Title"), body: t("hospitality.pillar1Body") },
    { icon: RefreshCw, title: t("hospitality.pillar2Title"), body: t("hospitality.pillar2Body") },
    { icon: HeartHandshake, title: t("hospitality.pillar3Title"), body: t("hospitality.pillar3Body") },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO
        title={`${t("hospitality.heroTitle")} — Casa Minga`}
        description={t("hospitality.heroSubtitle")}
        canonical="/hospitalite"
      />
      <Navbar />
      <main className="flex-1">
        <section className="bg-warm py-16 md:py-24">
          <div className="container max-w-3xl text-center">
            <h1 className="text-3xl md:text-5xl font-serif font-bold text-foreground mb-4">
              {t("hospitality.heroTitle")}
            </h1>
            <p className="text-muted-foreground text-base md:text-lg">{t("hospitality.heroSubtitle")}</p>
          </div>
        </section>

        <section className="container max-w-3xl py-12 md:py-16 space-y-6">
          <p className="text-muted-foreground leading-relaxed">{t("hospitality.intro1")}</p>
          <p className="text-muted-foreground leading-relaxed">{t("hospitality.intro2")}</p>
        </section>

        <section className="border-y bg-crema py-12 md:py-16">
          <div className="container max-w-5xl">
            <h2 className="text-2xl md:text-3xl font-serif text-foreground mb-8">{t("hospitality.pillarsTitle")}</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {PILLARS.map((p) => (
                <div key={p.title} className="rounded-2xl border bg-background p-6">
                  <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <p.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{p.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{p.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="container max-w-3xl py-14 text-center">
          <p className="text-muted-foreground mb-7">{t("hospitality.ctaText")}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/charte">
              <Button size="lg" className="rounded-full px-7">
                {t("hospitality.ctaCharter")} <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/discover">
              <Button size="lg" variant="outline" className="rounded-full px-7">
                {t("hospitality.ctaExplore")}
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Hospitality;
