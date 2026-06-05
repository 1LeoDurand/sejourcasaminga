import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

function Section({ title, items, ordered }: { title: string; items: string[]; ordered?: boolean }) {
  return (
    <div>
      <h2 className="text-xl md:text-2xl font-serif text-foreground mb-4">{title}</h2>
      <ul className="space-y-3">
        {items.map((it, i) => (
          <li key={i} className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
              {ordered ? i + 1 : "✓"}
            </span>
            <span className="text-sm text-muted-foreground leading-relaxed">{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const Charter = () => {
  const { t } = useTranslation();

  const COMMON = [t("charter.common1"), t("charter.common2"), t("charter.common3"), t("charter.common4")];
  const HOST = [t("charter.host1"), t("charter.host2"), t("charter.host3"), t("charter.host4")];
  const GUEST = [t("charter.guest1"), t("charter.guest2"), t("charter.guest3"), t("charter.guest4")];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO
        title={`${t("charter.heroTitle")} — Casa Minga`}
        description={t("charter.heroSubtitle")}
        canonical="/charte"
      />
      <Navbar />
      <main className="flex-1">
        <section className="bg-warm py-16 md:py-24">
          <div className="container max-w-3xl text-center">
            <h1 className="text-3xl md:text-5xl font-serif font-bold text-foreground mb-4">
              {t("charter.heroTitle")}
            </h1>
            <p className="text-muted-foreground text-base md:text-lg">{t("charter.heroSubtitle")}</p>
          </div>
        </section>

        <section className="container max-w-3xl py-12 md:py-16 space-y-10">
          <Section title={t("charter.commonTitle")} items={COMMON} />
          <Section title={t("charter.hostTitle")} items={HOST} ordered />
          <Section title={t("charter.guestTitle")} items={GUEST} ordered />

          <div className="rounded-2xl border bg-crema p-6 text-center">
            <p className="text-sm text-muted-foreground">{t("charter.compass")}</p>
          </div>
        </section>

        <section className="container max-w-3xl pb-14 text-center">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/auth?tab=signup">
              <Button size="lg" className="rounded-full px-7">
                {t("charter.ctaCreate")} <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/hospitalite">
              <Button size="lg" variant="outline" className="rounded-full px-7">
                {t("charter.ctaVision")}
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Charter;
