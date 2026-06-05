import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight, UserPlus, FileText, Globe, MessageCircle,
  Home, BedDouble, TreePine, Users, Heart, Compass, Shield,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

const HowItWorks = () => {
  const { t } = useTranslation();

  const STEPS = [
    { n: "01", icon: UserPlus, title: t("howItWorks.step1Title"), body: t("howItWorks.step1Body") },
    { n: "02", icon: FileText, title: t("howItWorks.step2Title"), body: t("howItWorks.step2Body") },
    { n: "03", icon: Globe, title: t("howItWorks.step3Title"), body: t("howItWorks.step3Body") },
    { n: "04", icon: MessageCircle, title: t("howItWorks.step4Title"), body: t("howItWorks.step4Body") },
  ];

  const STAY_TYPES = [
    { icon: BedDouble, title: t("howItWorks.stay1Title"), body: t("howItWorks.stay1Body") },
    { icon: Home, title: t("howItWorks.stay2Title"), body: t("howItWorks.stay2Body") },
    { icon: TreePine, title: t("howItWorks.stay3Title"), body: t("howItWorks.stay3Body") },
    { icon: Users, title: t("howItWorks.stay4Title"), body: t("howItWorks.stay4Body") },
  ];

  const WHY = [
    { icon: Heart, title: t("howItWorks.why1Title"), body: t("howItWorks.why1Body") },
    { icon: Compass, title: t("howItWorks.why2Title"), body: t("howItWorks.why2Body") },
    { icon: Shield, title: t("howItWorks.why3Title"), body: t("howItWorks.why3Body") },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Comment ça marche — échange entre habitats | Casa Minga"
        description="Découvrez comment fonctionne Casa Minga : créer son lieu, proposer un séjour, échanger avec d'autres habitats participatifs et écolieux en confiance."
        canonical="/comment-ca-marche"
      />
      <Navbar />

      {/* HERO */}
      <section className="bg-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/90 to-foreground/70" />
        <div className="relative z-10 px-5 pt-14 pb-12 md:px-8 md:pt-24 md:pb-20 max-w-3xl mx-auto text-center">
          <h1 className="text-[2rem] leading-tight tracking-tight text-white md:text-5xl font-serif">
            {t("howItWorks.heroTitle")}
          </h1>
          <p className="mt-4 max-w-xl mx-auto text-[0.95rem] leading-relaxed text-white/75 md:text-lg">
            {t("howItWorks.heroSubtitle")}
          </p>
          <Badge className="mt-4 bg-soleil/20 text-soleil border-soleil/30 text-xs">
            {t("howItWorks.freeBadge")}
          </Badge>
          <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/create-place">
              <Button size="lg" className="rounded-full font-medium px-7 h-12 shadow-lg">
                {t("howItWorks.ctaCreate")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/discover">
              <Button size="lg" variant="outline" className="rounded-full border-white/30 text-white hover:bg-white/10">
                {t("howItWorks.ctaExplore")}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* STEPS */}
      <section className="px-5 py-12 md:px-8 md:py-16 max-w-5xl mx-auto">
        <h2 className="text-2xl md:text-3xl text-foreground font-serif">{t("howItWorks.stepsTitle")}</h2>
        <p className="mt-1 text-sm text-muted-foreground mb-10">{t("howItWorks.stepsSub")}</p>
        <div className="grid gap-6 sm:grid-cols-2">
          {STEPS.map((s) => (
            <div key={s.n} className="flex gap-4 rounded-2xl border bg-card p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-primary mb-1">{s.n}</p>
                <h3 className="text-sm font-semibold text-foreground">{s.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{s.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FREE UNTIL */}
      <section className="border-y bg-primary/5 px-5 py-10 md:px-8 md:py-14">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-xl md:text-2xl text-foreground font-serif">{t("howItWorks.freeTitle")}</h2>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-xl mx-auto">
            {t("howItWorks.freeBody")}
          </p>
        </div>
      </section>

      {/* MODEL */}
      <section className="px-5 py-12 md:px-8 md:py-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl md:text-2xl text-foreground font-serif">{t("howItWorks.modelTitle")}</h2>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            {t("howItWorks.modelBody")}
          </p>
        </div>
      </section>

      {/* STAY TYPES */}
      <section className="border-y bg-crema px-5 py-12 md:px-8 md:py-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl text-foreground font-serif">{t("howItWorks.stayTypesTitle")}</h2>
          <p className="mt-1 text-sm text-muted-foreground mb-8">{t("howItWorks.stayTypesSub")}</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STAY_TYPES.map((t) => (
              <div key={t.title} className="rounded-2xl border bg-background p-5">
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <t.icon className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-1">{t.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{t.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY */}
      <section className="px-5 py-12 md:px-8 md:py-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl text-foreground font-serif">{t("howItWorks.whyTitle")}</h2>
          <p className="mt-1 text-sm text-muted-foreground mb-8">{t("howItWorks.whySub")}</p>
          <div className="grid gap-4 md:grid-cols-3">
            {WHY.map((w) => (
              <div key={w.title} className="flex gap-4 rounded-2xl border bg-card p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <w.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-1">{w.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{w.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-primary px-5 py-14 md:py-20">
        <div className="max-w-lg mx-auto text-center">
          <h2 className="text-2xl md:text-3xl text-primary-foreground leading-snug font-serif">
            {t("howItWorks.finalCtaTitle")}
            <br />
            {t("howItWorks.finalCtaTitle2")}
          </h2>
          <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/create-place">
              <Button size="lg" className="bg-white text-foreground hover:bg-white/90 rounded-full font-medium px-8 shadow-lg">
                {t("howItWorks.finalCtaCreate")}
              </Button>
            </Link>
            <Link to="/discover">
              <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/15 hover:text-white rounded-full">
                {t("howItWorks.finalCtaExplore")}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HowItWorks;
