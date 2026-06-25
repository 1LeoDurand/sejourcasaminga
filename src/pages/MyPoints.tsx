import { Navigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Coins, Sparkles, TrendingUp, TrendingDown, Gift, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  usePointBalance,
  usePointTransactions,
  POINT_TYPE_LABELS,
  POINT_TYPE_ICONS,
} from "@/hooks/use-points";

// How members earn points (pedagogy block) — labels resolved via i18n at render.
const EARN_WAYS = [
  { icon: "✨", key: "earnProfile", points: "+10" },
  { icon: "🏡", key: "earnPlace", points: "+30" },
  { icon: "🛏️", key: "earnListing", points: "+20" },
  { icon: "📅", key: "earnAvailability", points: "+10" },
  { icon: "🤝", key: "earnReferral", points: "+50" },
  { icon: "🏡", key: "earnHosting", points: "+pts" },
] as const;

const MyPoints = () => {
  const { t } = useTranslation();
  const { user, loading } = useAuth();
  const { data: balance, isLoading: balLoading } = usePointBalance(user?.id);
  const { data: transactions, isLoading: txLoading } = usePointTransactions(user?.id);

  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;

  const points = balance?.balance ?? 0;
  const isLoading = balLoading || txLoading;

  return (
    <div className="min-h-screen bg-background">
      <SEO title={t("myPoints.seoTitle")} description={t("myPoints.seoDesc")} />
      <Navbar />

      <div className="container px-5 py-8 max-w-3xl">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl text-foreground">{t("myPoints.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("myPoints.intro")}
          </p>
        </div>

        {/* Balance */}
        <div className="rounded-2xl border bg-warm p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Coins className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("myPoints.balanceLabel")}</p>
              <p className="text-3xl font-bold text-foreground leading-tight">{points}</p>
            </div>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/discover" className="inline-flex items-center gap-1.5">
              {t("myPoints.findStay")} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        {/* How it works */}
        <div className="mt-8">
          <h2 className="text-lg text-foreground mb-3 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            {t("myPoints.howToEarn")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {EARN_WAYS.map((w) => (
              <div key={w.key} className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3">
                <span className="text-xl" aria-hidden>{w.icon}</span>
                <span className="flex-1 text-sm text-foreground">{t(`myPoints.${w.key}`)}</span>
                <span className="text-sm font-semibold text-olive">{w.points}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1.5">
            <Gift className="h-3.5 w-3.5" />
            {t("myPoints.giftNote")}
          </p>
        </div>

        {/* History */}
        <div className="mt-8">
          <h2 className="text-lg text-foreground mb-3">{t("myPoints.history")}</h2>

          {isLoading ? (
            <p className="text-sm text-muted-foreground py-6 text-center">{t("myPoints.loading")}</p>
          ) : !transactions || transactions.length === 0 ? (
            <div className="rounded-xl border border-dashed bg-card px-4 py-10 text-center">
              <Coins className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm font-medium text-foreground">{t("myPoints.emptyTitle")}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {t("myPoints.emptyHint")}
              </p>
              <Button asChild variant="outline" size="sm" className="mt-4">
                <Link to="/edit-profile">{t("myPoints.completeProfile")}</Link>
              </Button>
            </div>
          ) : (
            <div className="rounded-xl border bg-card divide-y">
              {transactions.map((tx: any) => {
                const positive = (tx.amount ?? 0) >= 0;
                const label = POINT_TYPE_LABELS[tx.type] ?? tx.type;
                const icon = POINT_TYPE_ICONS[tx.type] ?? "•";
                return (
                  <div key={tx.id} className="flex items-center gap-3 px-4 py-3">
                    <span className="text-lg" aria-hidden>{icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground truncate">{tx.description || label}</p>
                      <p className="text-xs text-muted-foreground">
                        {label}
                        {tx.created_at && (
                          <> · {format(new Date(tx.created_at), "d MMM yyyy", { locale: fr })}</>
                        )}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 text-sm font-semibold inline-flex items-center gap-0.5 ${
                        positive ? "text-olive" : "text-rosa"
                      }`}
                    >
                      {positive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                      {positive ? "+" : ""}
                      {tx.amount}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default MyPoints;
