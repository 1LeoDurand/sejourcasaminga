import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Mail, MessagesSquare, LifeBuoy } from "lucide-react";

// TODO Léo : confirmer / changer cette adresse de contact
const CONTACT_EMAIL = "contact@casaminga.com";

const Contact = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO title={`${t("contact.heroTitle")} — Casa Minga`} description={t("contact.heroSubtitle")} canonical="/contact" />
      <Navbar />
      <main className="flex-1">
        <section className="bg-warm py-16 md:py-24">
          <div className="container max-w-2xl text-center">
            <h1 className="text-3xl md:text-5xl font-serif font-bold text-foreground mb-4">{t("contact.heroTitle")}</h1>
            <p className="text-muted-foreground text-base md:text-lg">{t("contact.heroSubtitle")}</p>
          </div>
        </section>

        <section className="container max-w-2xl py-12 md:py-16 space-y-6">
          <div className="rounded-2xl border bg-card p-6 flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Mail className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-foreground mb-1">{t("contact.emailTitle")}</h2>
              <p className="text-sm text-muted-foreground mb-3">{t("contact.emailText")}</p>
              <Button asChild>
                <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-6 flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <MessagesSquare className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-foreground mb-1">{t("contact.communityTitle")}</h2>
              <p className="text-sm text-muted-foreground mb-3">{t("contact.communityText")}</p>
              <Button asChild variant="outline">
                <Link to="/communaute">{t("contact.communityBtn")}</Link>
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-6 flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <LifeBuoy className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-foreground mb-1">{t("contact.howTitle")}</h2>
              <p className="text-sm text-muted-foreground mb-3">{t("contact.howText")}</p>
              <Button asChild variant="outline">
                <Link to="/comment-ca-marche">{t("contact.howBtn")}</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
