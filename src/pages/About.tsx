import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Heart, Users, Leaf, ArrowRight } from "lucide-react";

const About = () => {
  const { t } = useTranslation();

  const VALUES = [
    { icon: Heart, title: t("about.value1Title"), body: t("about.value1Body") },
    { icon: Users, title: t("about.value2Title"), body: t("about.value2Body") },
    { icon: Leaf, title: t("about.value3Title"), body: t("about.value3Body") },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO
        title="Casa Minga — La plateforme d'échange entre habitats participatifs"
        description={t("about.heroSubtitle")}
        canonical="/a-propos"
      />
      <Navbar />
      <main className="flex-1">
        <section className="bg-warm py-16 md:py-24">
          <div className="container max-w-3xl text-center">
            <h1 className="text-3xl md:text-5xl font-serif font-bold text-foreground mb-4">Casa Minga</h1>
            <p className="text-muted-foreground text-base md:text-lg">{t("about.heroSubtitle")}</p>
          </div>
        </section>

        <section className="container max-w-3xl py-12 md:py-16 space-y-6">
          <h2 className="text-2xl font-serif text-foreground">{t("about.reasonTitle")}</h2>
          <p className="text-muted-foreground leading-relaxed">{t("about.reason1")}</p>
          <p className="text-muted-foreground leading-relaxed">{t("about.reason2")}</p>
        </section>

        <section className="border-y bg-crema py-12 md:py-16">
          <div className="container max-w-5xl">
            <h2 className="text-2xl md:text-3xl font-serif text-foreground mb-8">{t("about.valuesTitle")}</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {VALUES.map((v) => (
                <div key={v.title} className="rounded-2xl border bg-background p-6">
                  <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <v.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{v.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{v.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="container max-w-3xl py-14 text-center">
          <h2 className="text-2xl font-serif text-foreground mb-3">{t("about.ctaTitle")}</h2>
          <p className="text-muted-foreground mb-7">{t("about.ctaText")}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/create-place">
              <Button size="lg" className="rounded-full px-7">
                {t("about.ctaCreate")} <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/discover">
              <Button size="lg" variant="outline" className="rounded-full px-7">
                {t("about.ctaExplore")}
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;
