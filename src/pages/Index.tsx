import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight, Search, Shield, Users, Heart, Home, HandHeart, Compass,
  Quote, MapPin, Loader2, ArrowLeftRight, Coins,
} from "lucide-react";
import ListingCard from "@/components/ListingCard";
import { DEMO_TESTIMONIALS } from "@/data/demo";
import { LISTING_TYPE_META, LISTING_TYPE_ORDER } from "@/lib/listing-types";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SearchModal from "@/components/SearchModal";
import SEO from "@/components/SEO";
import heroImage from "@/assets/hero-collective.webp";
import placePlaceholder from "@/assets/place-placeholder.webp";
import { useListings } from "@/hooks/use-listings";
import { usePlaces } from "@/hooks/use-places";
import { useTranslation } from "react-i18next";

/* Steps & Pillars are built inside the component to enable i18n */

const Index = () => {
  const { t } = useTranslation();
  const { data: listings, isLoading: loadingListings } = useListings();
  const { data: places, isLoading: loadingPlaces } = usePlaces();
  const [searchOpen, setSearchOpen] = useState(false);

  const listingCount = listings?.length || 0;
  const placeCount = places?.length || 0;

  const TRUST = [
    { icon: Shield, text: t("home.trustVerified") },
    { icon: Users, text: t("home.trustHosts") },
    { icon: Heart, text: t("home.trustExchange") },
    { icon: Home, text: t("home.trustPeers") },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Casa Minga — Échange de maisons entre habitats participatifs et écolieux"
        description="La plateforme d'échange entre habitats participatifs, écolieux et lieux de vie partagée."
        canonical="/"
      />
      <Navbar />

      {/* ═══════════ HERO ═══════════ */}
      <section className="relative overflow-hidden bg-foreground">
        <img
          src={heroImage}
          alt="Vie collective en habitat participatif"
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/40 to-foreground/20" />

        <div className="relative z-10 px-5 pt-14 pb-12 md:px-8 md:pt-24 md:pb-20 max-w-3xl mx-auto">
          <h1 className="text-[2.25rem] leading-[1.1] tracking-tight text-white md:text-6xl">
            {t("home.heroTitle")}
            <span className="block text-soleil mt-1">{t("home.heroTitleAccent")}</span>
          </h1>

          <p className="mt-5 max-w-lg text-[0.95rem] leading-relaxed text-white/75 md:text-lg">
            {t("home.heroSubtitle")}
          </p>

          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="mt-7 flex w-full items-center gap-3.5 rounded-2xl bg-white p-4 text-left shadow-xl ring-1 ring-white/10 transition-shadow hover:shadow-2xl md:max-w-lg"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Search className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">{t("home.findStay")}</p>
              <p className="text-xs text-muted-foreground truncate">{t("home.findStayHint")}</p>
            </div>
            <ArrowRight className="h-4 w-4 text-primary shrink-0" />
          </button>

          <div className="mt-6 flex items-center gap-4">
            <Link to="/auth?tab=signup">
              <Button size="lg" className="rounded-full font-medium text-sm px-7 h-12 shadow-lg">
                {t("common.signUpFree")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/comment-ca-marche" className="text-xs text-white/70 hover:text-white underline underline-offset-4 transition-colors">
              {t("home.howItWorksLink")}
            </Link>
          </div>

          <p className="mt-6 text-xs text-white/70">
            {t("home.stayCount", { count: listingCount })} · {t("home.placeCount", { count: placeCount })}
          </p>
        </div>
      </section>

      {/* ═══════════ TRUST BAR ═══════════ */}
      <section className="border-b bg-warm/60">
        <div className="px-5 py-5 md:px-8 max-w-5xl mx-auto">
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 md:grid-cols-4">
            {TRUST.map(({ icon: I, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <I className="h-4 w-4" />
                </div>
                <span className="text-xs font-medium text-foreground leading-snug">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ FEATURED LISTINGS ═══════════ */}
      <section className="px-5 py-10 md:px-8 md:py-16 max-w-6xl mx-auto">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl text-foreground">{t("home.availableStays")}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t("home.availableStaysSub")}</p>
          </div>
          <Link to="/discover" className="hidden md:flex">
            <Button variant="ghost" size="sm" className="text-sm">
              {t("common.viewAll")} <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        {loadingListings ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : listings && listings.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {listings.slice(0, 6).map((l: any) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p>{t("home.noStays")}</p>
            <Link to="/auth?tab=signup">
              <Button className="mt-4">{t("home.createMyProfile")}</Button>
            </Link>
          </div>
        )}

        <div className="mt-8 text-center md:hidden">
          <Link to="/discover">
            <Button variant="outline" className="rounded-full px-6">
              {t("home.viewAllStays")} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* ═══════════ PLACES ═══════════ */}
      <section className="border-y bg-crema px-5 py-10 md:px-8 md:py-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl text-foreground">{t("home.discoverPlaces")}</h2>
          <p className="mt-1 text-sm text-muted-foreground mb-6">
            {t("home.discoverPlacesSub")}
          </p>

          {loadingPlaces ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : places && places.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {places.slice(0, 6).map((p) => (
                <Link key={p.id} to={`/habitat/${p.id}`} className="group rounded-xl border bg-background overflow-hidden transition-shadow hover:shadow-md">
                  <div className="aspect-[16/9] overflow-hidden">
                    <img src={p.image || placePlaceholder} alt={p.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                  </div>
                  <div className="p-4">
                    <Badge variant="outline" className="text-[0.6rem] mb-1.5">{p.type}</Badge>
                    <h3 className="font-serif text-base text-foreground group-hover:text-primary transition-colors">{p.name}</h3>
                    <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {p.region || p.city || ""}
                    </p>
                    <p className="mt-1.5 text-xs text-muted-foreground">{p.inhabitants || "?"} {t("home.inhabitantsLabel")}{p.ambiance ? ` · ${p.ambiance}` : ""}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>{t("home.noPlaces")}</p>
            </div>
          )}
        </div>
      </section>

      {/* ═══════════ HOW IT WORKS ═══════════ */}
      <section className="px-5 py-12 md:px-8 md:py-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl text-foreground">{t("home.howItWorks")}</h2>
          <p className="mt-1 text-sm text-muted-foreground mb-10">
            {t("home.howItWorksSub")}
          </p>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              { n: "01", title: t("home.step1Title"), body: t("home.step1Body") },
              { n: "02", title: t("home.step2Title"), body: t("home.step2Body") },
              { n: "03", title: t("home.step3Title"), body: t("home.step3Body") },
              { n: "04", title: t("home.step4Title"), body: t("home.step4Body") },
            ].map((s) => (
              <div key={s.n} className="flex gap-4">
                <span className="shrink-0 font-serif text-3xl text-primary/25 leading-none mt-0.5">{s.n}</span>
                <div>
                  <h3 className="text-base font-semibold text-foreground">{s.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ 5 WAYS TO STAY ═══════════ */}
      <section className="px-5 py-12 md:px-8 md:py-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl text-foreground">{t("home.waysTitle")}</h2>
          <p className="mt-1 text-sm text-muted-foreground mb-8">{t("home.waysSub")}</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {LISTING_TYPE_ORDER.map((key) => {
              const meta = LISTING_TYPE_META[key];
              const Icon = meta.icon;
              return (
                <div key={key} className="rounded-xl border bg-card p-5 transition-shadow hover:shadow-sm">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground">{meta.label}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{meta.shortDescription}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════ EXCHANGE MODEL — reciprocal or points ═══════════ */}
      <section className="border-y bg-warm px-5 py-12 md:px-8 md:py-16">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-primary mb-3">{t("home.exchangeModelEyebrow")}</p>
          <h2 className="text-2xl md:text-3xl text-foreground leading-snug">{t("home.exchangeModelTitle")}</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 text-left">
            <div className="rounded-xl border bg-card p-6">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-azur/10 text-azur">
                <ArrowLeftRight className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-foreground">{t("home.reciprocalTitle")}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{t("home.reciprocalBody")}</p>
            </div>
            <div className="rounded-xl border bg-card p-6">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Coins className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-foreground">{t("home.pointsTitle")}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{t("home.pointsBody")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ PILLARS ═══════════ */}
      <section className="border-y bg-warm px-5 py-12 md:px-8 md:py-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl text-foreground mb-6">{t("home.pillarsTitle")}</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { icon: Home, title: t("home.pillar1Title"), body: t("home.pillar1Body"), category: t("home.pillar1Category"), accent: "text-primary/8" },
              { icon: HandHeart, title: t("home.pillar2Title"), body: t("home.pillar2Body"), category: t("home.pillar2Category"), accent: "text-azur/8" },
              { icon: Compass, title: t("home.pillar3Title"), body: t("home.pillar3Body"), category: t("home.pillar3Category"), accent: "text-olive/8" },
            ].map(({ icon: I, title, body, category, accent }) => (
              <div key={title} className="group relative overflow-hidden rounded-xl border border-border/40 bg-card p-6 transition-all duration-300 hover:border-border/60 hover:shadow-sm">
                <div className={`absolute -left-4 -top-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${accent}`}>
                  <I className="h-24 w-24" strokeWidth={1} />
                </div>
                <p className="relative z-10 mb-2 text-[0.7rem] font-medium uppercase tracking-[0.12em] text-muted-foreground/70">{category}</p>
                <h3 className="relative z-10 text-[0.95rem] font-semibold text-foreground tracking-tight mb-3">{title}</h3>
                <p className="relative z-10 text-[0.8rem] text-muted-foreground leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ STORYTELLING ═══════════ */}
      <section className="px-5 py-12 md:px-8 md:py-20">
        <div className="max-w-xl mx-auto">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-primary mb-4">{t("home.storyEyebrow")}</p>
          <h2 className="text-2xl md:text-3xl text-foreground leading-snug">
            {t("home.storyTitleLine1")}
            <br />
            {t("home.storyTitleLine2")}
          </h2>
          <div className="mt-6 space-y-4 text-sm text-muted-foreground leading-relaxed">
            <p>
              {t("home.storyP1Part1")}<strong className="text-foreground">{t("home.storyP1Strong1")}</strong>{t("home.storyP1Part2")}<strong className="text-foreground">{t("home.storyP1Strong2")}</strong>{t("home.storyP1Part3")}
            </p>
            <p>{t("home.storyP2")}</p>
            <p>{t("home.storyP3")}</p>
          </div>
          <blockquote className="mt-6 border-l-2 border-primary pl-4 text-sm text-foreground font-medium italic">
            {t("home.storyQuote")}
          </blockquote>
        </div>
      </section>

      {/* ═══════════ TESTIMONIALS ═══════════ */}
      <section className="border-t bg-crema px-5 py-12 md:px-8 md:py-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl text-foreground mb-2">{t("home.testimonialsTitle")}</h2>
          <p className="text-sm text-muted-foreground mb-8">{t("home.testimonialsSub")}</p>
          <div className="grid gap-4 md:grid-cols-3">
            {DEMO_TESTIMONIALS.map((tst, i) => (
              <div key={i} className="rounded-2xl border bg-background p-5">
                <Quote className="mb-2 h-5 w-5 text-primary/20" />
                <p className="text-sm text-muted-foreground leading-relaxed italic mb-4">"{tst.text}"</p>
                <div className="flex items-center gap-2.5">
                  <img src={tst.avatar} alt={tst.author} className="h-8 w-8 rounded-full object-cover ring-1 ring-border" />
                  <div>
                    <p className="text-xs font-medium text-foreground">{tst.author}</p>
                    <p className="text-[0.65rem] text-muted-foreground">{tst.habitat}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ ECONOMIC CLARITY ═══════════ */}
      <section className="px-5 py-12 md:px-8 md:py-16">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-primary mb-4">{t("home.economicEyebrow")}</p>
          <h2 className="text-2xl md:text-3xl text-foreground leading-snug">{t("home.economicTitle")}</h2>
          <div className="mt-6 space-y-4 text-sm text-muted-foreground leading-relaxed">
            <p>{t("home.economicP1")}</p>
            <p>{t("home.economicP2")}</p>
          </div>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
            <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs">{t("home.economicBadge1")}</Badge>
            <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs">{t("home.economicBadge2")}</Badge>
            <Badge className="rounded-full px-3 py-1 text-xs bg-primary text-primary-foreground">{t("home.economicBadge3")}</Badge>
          </div>
        </div>
      </section>

      {/* ═══════════ FINAL CTA ═══════════ */}
      <section className="bg-primary px-5 py-14 md:py-20">
        <div className="max-w-lg mx-auto text-center">
          <h2 className="text-2xl md:text-3xl text-primary-foreground leading-snug">
            {t("home.finalCtaTitle")}
          </h2>
          <p className="mt-3 text-sm text-primary-foreground/70 leading-relaxed">
            {t("home.finalCtaText")}
          </p>
          <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/auth?tab=signup">
              <Button size="lg" className="bg-white text-foreground hover:bg-white/90 rounded-full font-medium px-8 shadow-lg">
                {t("common.signUpFree")}
              </Button>
            </Link>
            <Link to="/discover">
              <Button size="lg" className="bg-white/20 text-white border border-white/50 hover:bg-white/30 rounded-full font-medium px-8">
                {t("nav.exploreStays")}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
};

export default Index;
