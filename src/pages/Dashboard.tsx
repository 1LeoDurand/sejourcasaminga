import { Link, useNavigate, useSearchParams } from "react-router-dom";
import SEO from "@/components/SEO";
import placePlaceholder from "@/assets/place-placeholder.webp";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  User, ArrowRight, LogOut, MapPin, Plus, Loader2, Home, MessageCircle,
  ArrowLeftRight, Heart, Settings, ChevronRight, Calendar, Users, Pencil,
  Gift, Copy, Check, Star, Sparkles, TrendingUp, Clock, ShieldCheck,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/use-profile";
import { useMyPlaces } from "@/hooks/use-places";
import { useMyListings, useListings } from "@/hooks/use-listings";
import {
  useMyExchangeRequests,
  useUpdateExchangeRequestStatus,
  useAcceptStayRequest,
  stayPointsCost,
  stayPointsErrorMessage,
} from "@/hooks/use-exchange-requests";
import { useMyConversations } from "@/hooks/use-conversations";
import { usePointBalance, usePointTransactions, useReferralCode, useMyReferrals, POINT_TYPE_LABELS, POINT_TYPE_ICONS } from "@/hooks/use-points";
import { useSmartRecommendations } from "@/hooks/use-smart-recommendations";
import { useUserPreferences } from "@/hooks/use-user-preferences";
import { computeCompletion, completionColor } from "@/lib/profile-completion";
import MyClaimRequests from "@/components/MyClaimRequests";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { useIsAdmin } from "@/hooks/use-claim-requests";
import { useEffect, useState } from "react";
import { useTranslation, Trans } from "react-i18next";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "@/hooks/use-toast";

type Tab = "exchanges" | "messages" | "profile";

const Dashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get("tab") as Tab) || "profile";
  const { user, loading: authLoading, signOut } = useAuth();
  const { data: profile } = useProfile(user?.id);
  const { data: myPlaces, isLoading: placesLoading } = useMyPlaces(user?.id);
  const { data: myListings } = useMyListings(user?.id);
  const { data: requests } = useMyExchangeRequests(user?.id);
  const { data: conversations } = useMyConversations(user?.id);
  const { data: pointBalance } = usePointBalance(user?.id);
  const { data: allListings } = useListings();

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [authLoading, user, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  if (!user) return null;

  const setTab = (tab: Tab) => setSearchParams({ tab });
  const displayName = profile?.display_name || user.email?.split("@")[0] || t("dashboard.traveler");
  const pendingRequests = requests?.filter((r) => r.status === "pending") || [];
  const acceptedRequests = requests?.filter((r) => r.status === "accepted") || [];
  const pastRequests = requests?.filter((r) => r.status === "completed" || r.status === "declined") || [];

  // Suggested stays: exclude user's own listings
  const suggestedListings = allListings?.filter((l: any) => l.host_id !== user.id).slice(0, 4) || [];

  const tabs: { key: Tab; label: string; icon: React.ElementType; count?: number }[] = [
    { key: "profile", label: t("dashboard.profile"), icon: User },
    { key: "exchanges", label: t("dashboard.exchanges"), icon: ArrowLeftRight, count: pendingRequests.length },
    { key: "messages", label: t("dashboard.messages"), icon: MessageCircle, count: conversations?.length || 0 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Tableau de bord | Casa Minga" noindex />
      <Navbar />

      <DashboardHeader
        userId={user.id}
        displayName={displayName}
        profile={profile}
        myPlaces={myPlaces}
        pointBalance={pointBalance}
        tabs={tabs}
        activeTab={activeTab}
        setTab={setTab}
      />

      <div className="max-w-3xl mx-auto px-4 py-6">
        <DashboardHome
          user={user}
          requests={requests}
          onGoToExchanges={() => setTab("exchanges")}
        />
        <GuidedBanners
          myPlaces={myPlaces}
          myListings={myListings}
          searchParams={searchParams}
          setSearchParams={setSearchParams}
        />

        {activeTab === "profile" && (
          <ProfileTab
            user={user}
            profile={profile}
            displayName={displayName}
            myPlaces={myPlaces}
            myListings={myListings}
            placesLoading={placesLoading}
            suggestedListings={suggestedListings}
            onSignOut={() => signOut().then(() => navigate("/"))}
          />
        )}
        {activeTab === "exchanges" && (
          <ExchangesTab pending={pendingRequests} accepted={acceptedRequests} past={pastRequests} userId={user.id} />
        )}
        {activeTab === "messages" && (
          <MessagesTab conversations={conversations || []} userId={user.id} />
        )}
      </div>

      <Footer />
    </div>
  );
};

/* ─── Warm header banner: avatar + greeting + points pill + pill tabs ─── */
function DashboardHeader({
  userId, displayName, profile, myPlaces, pointBalance, tabs, activeTab, setTab,
}: {
  userId: string; displayName: string; profile: any; myPlaces: any; pointBalance: any;
  tabs: { key: Tab; label: string; icon: React.ElementType; count?: number }[];
  activeTab: Tab; setTab: (t: Tab) => void;
}) {
  const { t } = useTranslation();
  const firstPlace = myPlaces?.[0]?.places;
  const placeLabel = firstPlace ? [firstPlace.name, firstPlace.city].filter(Boolean).join(", ") : null;

  return (
    <div>
      <div className="cm-stripes px-5 py-7 md:px-8">
        <div className="max-w-3xl mx-auto flex flex-col gap-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="h-16 w-16 shrink-0 rounded-full ring-[3px] ring-[#FFFDF9] dark:ring-card shadow-[0_4px_10px_rgba(120,70,30,0.15)] bg-primary/10 flex items-center justify-center overflow-hidden">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <User className="h-7 w-7 text-primary" />
                )}
              </div>
              <div className="min-w-0">
                <h1 className="flex items-center gap-2 font-serif text-[27px] font-extrabold text-foreground">
                  {t("dashboard.greeting", { name: displayName })}
                  <VerifiedBadge userId={userId} />
                </h1>
                {placeLabel && (
                  <p className="text-[13.5px] font-medium text-muted-foreground">{placeLabel}</p>
                )}
              </div>
            </div>

            <Link
              to="/points"
              className="flex items-center gap-2 rounded-full bg-[#FFFDF9] dark:bg-card px-[18px] py-2.5 shadow-[0_2px_6px_rgba(120,70,30,0.08)]"
            >
              <Star className="h-4 w-4 text-soleil fill-soleil" />
              <span className="text-base font-extrabold text-foreground">{pointBalance?.balance ?? 0}</span>
              <span className="text-[12.5px] text-muted-foreground">{t("dashboard.pointsLong")}</span>
            </Link>
          </div>

          {/* Tab pills */}
          <div className="flex items-center gap-2 overflow-x-auto">
            {tabs.map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-[13.5px] transition-colors ${
                  activeTab === key
                    ? "bg-[#2E211A] text-[#FFF7EE] font-bold"
                    : "bg-[#FFFDF9] dark:bg-card text-[#5B4A3C] dark:text-muted-foreground font-semibold shadow-sm"
                }`}
              >
                {label}
                {count != null && count > 0 && (
                  <span className="inline-flex items-center justify-center h-[19px] min-w-[19px] rounded-full bg-primary text-white text-[11px] font-bold">
                    {count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="cm-weave h-1.5" />
    </div>
  );
}

/* ─── Consolidated home (above tabs): pending actions + recommendations ─── */
function DashboardHome({
  user, requests, onGoToExchanges,
}: {
  user: any; requests: any[] | undefined; onGoToExchanges: () => void;
}) {
  const { t } = useTranslation();
  const { data: recommendations, isLoading: recsLoading, hasPrefs } = useSmartRecommendations(user.id, 4);

  const list = requests || [];
  const receivedPending = list.filter((r: any) => r.to_member_id === user.id && r.status === "pending").length;
  const sentPending = list.filter((r: any) => r.from_user_id === user.id && r.status === "pending").length;
  const hasActions = receivedPending > 0 || sentPending > 0;

  return (
    <div className="mb-6 space-y-4">
      {/* "À traiter" card */}
      <section className="rounded-[20px] bg-[#FFFDF9] dark:bg-card p-5 shadow-[0_2px_6px_rgba(120,70,30,0.06)]">
        <p className="text-sm font-extrabold text-foreground mb-3">{t("dashboard.pendingActions")}</p>
        {hasActions ? (
          <div className="space-y-2">
            {receivedPending > 0 && (
              <button onClick={onGoToExchanges} className="flex w-full items-center gap-3 rounded-[14px] bg-[#FBEFD6] px-4 py-3 text-left">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                  <ArrowRight className="h-4 w-4" />
                </span>
                <span className="flex-1 text-[13.5px] font-semibold text-foreground">
                  {t("dashboard.receivedToHandle", { count: receivedPending })}
                </span>
                <span className="rounded-full bg-primary text-white text-[12.5px] font-bold px-4 py-2">
                  {t("common.viewAll")}
                </span>
              </button>
            )}
            {sentPending > 0 && (
              <Link to="/stay-requests" className="flex items-center gap-3 rounded-[14px] bg-olive/10 px-4 py-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-olive/20 text-olive">
                  <ArrowRight className="h-4 w-4" />
                </span>
                <span className="flex-1 text-[13.5px] font-semibold text-foreground">
                  {t("dashboard.sentPending", { count: sentPending })}
                </span>
                <span className="rounded-full border-[1.5px] border-olive/30 text-olive text-[12.5px] font-bold px-4 py-2">
                  {t("dashboard.follow")}
                </span>
              </Link>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{t("dashboard.allCaughtUp")}</p>
        )}
      </section>

      {/* Matchmaking: recommended places */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-serif text-lg font-bold text-foreground">{t("dashboard.recommendedForYou")}</h2>
          {recommendations && recommendations.length > 0 && (
            <Link to="/discover" className="text-[13px] font-semibold text-primary">
              {t("dashboard.exploreAll")} →
            </Link>
          )}
        </div>

        {!hasPrefs ? (
          <div className="rounded-2xl border border-dashed bg-card p-5 text-center">
            <p className="text-sm text-muted-foreground mb-3">{t("dashboard.setPrefsText")}</p>
            <Link to="/edit-profile">
              <Button size="sm" variant="outline">{t("dashboard.setPrefsCta")}</Button>
            </Link>
          </div>
        ) : recsLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-2xl bg-[#FFFDF9] dark:bg-card overflow-hidden">
                <div className="h-24 bg-muted" />
                <div className="p-2.5 space-y-1.5"><div className="h-3 w-3/4 rounded bg-muted" /><div className="h-2 w-1/2 rounded bg-muted" /></div>
              </div>
            ))}
          </div>
        ) : recommendations.length === 0 ? (
          <div className="rounded-2xl border border-dashed bg-card p-5 text-center">
            <p className="text-sm text-muted-foreground mb-3">{t("dashboard.noRecs")}</p>
            <Link to="/discover"><Button size="sm" variant="outline">{t("dashboard.exploreAllHabitats")}</Button></Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {recommendations.map((p) => (
              <Link key={p.id} to={`/habitat/${(p as any).slug || p.id}`} className="rounded-2xl bg-[#FFFDF9] dark:bg-card shadow-[0_2px_6px_rgba(120,70,30,0.06)] overflow-hidden hover:shadow-md transition-shadow group relative">
                <div className="h-24 overflow-hidden relative">
                  <img src={p.image || placePlaceholder} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  {hasPrefs && p.matchPct > 0 && (
                    <span className="absolute top-1.5 left-1.5 inline-flex items-center rounded-full bg-[#FBEAC2] px-2 py-[3px] text-[10px] font-extrabold text-[#9A6A1C]">
                      {t("dashboard.matchBadge", { pct: p.matchPct })}
                    </span>
                  )}
                </div>
                <div className="p-2.5">
                  <p className="font-serif text-[12.5px] font-bold text-foreground line-clamp-1">{p.name}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                    <MapPin className="h-2.5 w-2.5" />{[p.city, p.region].filter(Boolean).join(", ") || "France"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

/* ─── Profile Tab ─── */
function ProfileTab({
  user, profile, displayName, myPlaces, myListings, placesLoading, suggestedListings, onSignOut,
}: {
  user: any; profile: any; displayName: string; myPlaces: any; myListings: any;
  placesLoading: boolean; suggestedListings: any[]; onSignOut: () => void;
}) {
  const { t } = useTranslation();
  const { data: pointBalance } = usePointBalance(user.id);
  const { data: transactions } = usePointTransactions(user.id);
  const { data: referralData } = useReferralCode(user.id);
  const { data: myReferrals } = useMyReferrals(user.id);
  const { data: isAdmin } = useIsAdmin(user.id);
  const [copied, setCopied] = useState(false);

  const completionSteps = [
    { done: !!profile?.bio, label: t("dashboard.bio"), pts: 10 },
    { done: !!profile?.hosting_style, label: t("dashboard.hostingStyle"), pts: 5 },
    { done: (profile?.languages?.length || 0) > 0, label: t("dashboard.languages"), pts: 5 },
    { done: myPlaces && myPlaces.length > 0, label: t("dashboard.collectivePlace"), pts: 30 },
    { done: myListings && myListings.length > 0, label: t("dashboard.publishedStay"), pts: 20 },
  ];
  const completedCount = completionSteps.filter((s) => s.done).length;
  const completionPct = Math.round((completedCount / completionSteps.length) * 100);

  const copyReferralCode = () => {
    if (referralData?.code) {
      navigator.clipboard.writeText(referralData.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: t("dashboard.codeCopied") });
    }
  };


  return (
    <div className="space-y-6">
      {/* Profile card - HomeExchange style */}
      <section className="rounded-[20px] bg-[#FFFDF9] dark:bg-card p-5 shadow-[0_2px_6px_rgba(120,70,30,0.06)]">
        <div className="flex items-start gap-4">
          <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden shrink-0 ring-3 ring-primary/20">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <User className="h-12 w-12 text-primary" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <h2 className="text-xl font-serif text-foreground">{displayName}</h2>
              {/* Rating placeholder */}
            </div>
            <Link to="/edit-profile" className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 mt-1">
              <Pencil className="h-3.5 w-3.5" /> {t("dashboard.editProfile")}
            </Link>
            <div className="flex items-center gap-1.5 mt-2">
              <Star className="h-4 w-4 text-soleil fill-soleil" />
              <span className="text-sm font-bold text-foreground">{pointBalance?.balance ?? 0}</span>
              <span className="text-xs text-muted-foreground">{t("dashboard.points")}</span>
            </div>
            {profile?.languages && profile.languages.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {profile.languages.map((l: string, i: number) => (
                  <Badge key={i} variant="secondary" className="text-[10px] px-1.5 py-0">{l}</Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Complétion + Mon annonce — grille 2 colonnes */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Profile completion card */}
        {completionPct < 100 && (
          <section className="rounded-[20px] bg-[#FFFDF9] dark:bg-card p-5 shadow-[0_2px_6px_rgba(120,70,30,0.06)]">
            <p className="text-sm font-extrabold text-foreground mb-3">{t("dashboard.profilePct", { pct: completionPct })}</p>
            <div className="h-[9px] w-full overflow-hidden rounded-full bg-[#F0E7D6]">
              <div className="h-full rounded-full bg-gradient-to-r from-olive to-[hsl(85_30%_50%)] transition-all" style={{ width: `${completionPct}%` }} />
            </div>
            <div className="mt-3 space-y-2">
              {completionSteps.map((step) => (
                <div key={step.label} className="flex items-center gap-2 text-xs">
                  <span className={step.done ? "text-olive font-bold" : "text-primary"}>{step.done ? "✓" : "○"}</span>
                  <span className={`flex-1 ${step.done ? "text-muted-foreground line-through" : "text-foreground"}`}>{step.label}</span>
                  {!step.done && <span className="font-bold text-primary">+{step.pts} pts</span>}
                </div>
              ))}
            </div>
            <Link to="/edit-profile">
              <Button size="sm" className="mt-3 w-full rounded-full font-bold" variant="outline">
                <Pencil className="mr-1.5 h-3.5 w-3.5" /> {t("dashboard.complete")}
              </Button>
            </Link>
          </section>
        )}

        {/* My listing card - "mon annonce" */}
        {myListings && myListings.length > 0 && (
          <section className="rounded-[20px] bg-[#FFFDF9] dark:bg-card overflow-hidden shadow-[0_2px_6px_rgba(120,70,30,0.06)]">
            {myListings.slice(0, 1).map((l: any) => (
              <Link key={l.id} to={`/listing/${l.slug || l.id}`} className="block">
                <div className="h-[110px] w-full overflow-hidden bg-muted">
                  {l.image ? (
                    <img src={l.image} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center"><Home className="h-6 w-6 text-muted-foreground/40" /></div>
                  )}
                </div>
                <div className="p-4">
                  <p className="font-serif text-[15.5px] font-bold text-foreground">{l.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground flex items-center gap-1.5">
                    {l.places?.name || l.places?.city || "France"}
                    {l.published && <span className="inline-flex items-center gap-1 text-olive"><span className="h-1.5 w-1.5 rounded-full bg-olive" /> {t("dashboard.published")}</span>}
                  </p>
                </div>
              </Link>
            ))}

            <div className="px-4 pb-4">
              <Link to="/calendar">
                <Button className="w-full rounded-full bg-soleil hover:bg-soleil/90 text-soleil-foreground font-bold text-[13px] py-[11px]">
                  {t("dashboard.manageCalendar")}
                </Button>
              </Link>
            </div>

            {/* More listings */}
            {myListings.length > 1 && (
              <div className="px-4 pb-4 space-y-2">
                {myListings.slice(1).map((l: any) => (
                  <Link key={l.id} to={`/listing/${l.slug || l.id}`}
                    className="flex items-center gap-3 rounded-xl bg-background/60 p-3 hover:shadow-sm transition-shadow">
                    <div className="h-14 w-18 rounded-lg bg-muted overflow-hidden shrink-0">
                      {l.image ? <img src={l.image} alt="" className="h-full w-full object-cover" /> : (
                        <div className="h-full w-full flex items-center justify-center"><MapPin className="h-4 w-4 text-muted-foreground/40" /></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-serif text-sm text-foreground">{l.title}</p>
                      <p className="text-xs text-muted-foreground">{l.places?.name}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                  </Link>
                ))}
              </div>
            )}
          </section>
        )}
      </div>

      {/* Points & Referral */}
      <section className="rounded-[20px] bg-[#FFFDF9] dark:bg-card overflow-hidden shadow-[0_2px_6px_rgba(120,70,30,0.06)]">
        <div className="p-5 border-b border-border/60">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-soleil/15 flex items-center justify-center">
              <Star className="h-5 w-5 text-soleil" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{t("dashboard.myPointsTitle")}</p>
              <p className="text-xs text-muted-foreground">{t("dashboard.earnPoints")}</p>
            </div>
            <span className="text-2xl font-bold text-foreground">{pointBalance?.balance ?? 0}</span>
          </div>
        </div>

        {/* Recent transactions */}
        {transactions && transactions.length > 0 && (
          <div className="px-5 py-3 border-b">
            <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">{t("dashboard.recentActivity")}</p>
            <div className="space-y-2">
              {transactions.slice(0, 4).map((t: any) => (
                <div key={t.id} className="flex items-center gap-2.5 text-sm">
                  <span className="text-base">{POINT_TYPE_ICONS[t.type] || "💎"}</span>
                  <span className="flex-1 text-xs text-foreground truncate">{t.description || POINT_TYPE_LABELS[t.type] || t.type}</span>
                  <span className={`text-xs font-semibold ${t.amount > 0 ? "text-olive" : "text-destructive"}`}>
                    {t.amount > 0 ? "+" : ""}{t.amount}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Referral */}
        <div className="p-5">
          <div className="flex items-center gap-2 mb-2">
            <Gift className="h-4 w-4 text-rosa" />
            <p className="text-sm font-medium text-foreground">{t("dashboard.referFriend")}</p>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            <Trans i18nKey="dashboard.referText" components={{ strong: <span className="font-semibold text-olive" /> }} />
          </p>
          {referralData?.code ? (
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-muted rounded-lg px-3 py-2 font-mono text-sm text-foreground tracking-wider text-center">
                {referralData.code}
              </div>
              <Button size="sm" variant="outline" onClick={copyReferralCode} className="shrink-0">
                {copied ? <Check className="h-4 w-4 text-olive" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic">{t("dashboard.codeGenerating")}</p>
          )}
          {myReferrals && myReferrals.length > 0 && (
            <p className="text-xs text-muted-foreground mt-2">
              {t("dashboard.successfulReferrals", { count: myReferrals.filter((r: any) => r.status === "completed").length })}
            </p>
          )}
          <Button asChild size="sm" variant="default" className="w-full mt-3">
            <Link to="/referrals">
              <Gift className="h-4 w-4 mr-2" /> {t("dashboard.inviteFriends")}
            </Link>
          </Button>
        </div>
      </section>

      {/* My claim requests */}
      <MyClaimRequests userId={user.id} />

      {/* My places */}
      <section>
        <h3 className="text-base font-serif text-foreground mb-3">{t("dashboard.myPlaces")}</h3>
        {placesLoading ? (
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        ) : myPlaces && myPlaces.length > 0 ? (
          <div className="space-y-3">
            {myPlaces.map((pm: any) => (
              <Link key={pm.id} to={`/habitat/${pm.place_id}`}
                className="flex items-center gap-3 rounded-xl bg-[#FFFDF9] dark:bg-card p-3 shadow-[0_2px_6px_rgba(120,70,30,0.05)] hover:shadow-md transition-shadow">
                <div className="h-16 w-20 rounded-lg bg-muted overflow-hidden shrink-0">
                  {pm.places?.image ? (
                    <img src={pm.places.image} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center"><Home className="h-5 w-5 text-muted-foreground/40" /></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-serif text-sm text-foreground">{pm.places?.name}</p>
                  <p className="text-xs text-muted-foreground">{pm.places?.region || pm.places?.city}, {pm.places?.country || "France"}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0" />
              </Link>
            ))}
          </div>
        ) : (
          <Link to="/create-place"
            className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border p-8 text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors">
            <Plus className="h-5 w-5" /><span className="text-sm font-medium">{t("dashboard.addPlace")}</span>
          </Link>
        )}
        {myPlaces && myPlaces.length > 0 && (
          <Link to="/create-place"><Button variant="outline" size="sm" className="mt-3 w-full"><Plus className="mr-2 h-4 w-4" /> Ajouter un lieu</Button></Link>
        )}
      </section>

      {/* Account */}
      <section>
        <h3 className="text-base font-serif text-foreground mb-3">{t("dashboard.myAccount")}</h3>
        <div className="rounded-[20px] bg-[#FFFDF9] dark:bg-card divide-y divide-border/60 overflow-hidden shadow-[0_2px_6px_rgba(120,70,30,0.06)]">
          <Link to="/favorites" className="flex items-center gap-3 px-4 py-3.5 hover:bg-muted/50 transition-colors">
            <Heart className="h-4 w-4 text-rosa" /><span className="text-sm text-foreground flex-1">{t("dashboard.favorites")}</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
          </Link>
          {isAdmin && (
            <Link to="/admin/claims" className="flex items-center gap-3 px-4 py-3.5 hover:bg-muted/50 transition-colors">
              <ShieldCheck className="h-4 w-4 text-primary" /><span className="text-sm text-foreground flex-1">{t("dashboard.manageClaims")}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
            </Link>
          )}
          <Link to="/edit-profile" className="flex items-center gap-3 px-4 py-3.5 hover:bg-muted/50 transition-colors">
            <Settings className="h-4 w-4 text-muted-foreground" /><span className="text-sm text-foreground flex-1">{t("dashboard.settings")}</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
          </Link>
          <button onClick={onSignOut} className="flex items-center gap-3 px-4 py-3.5 hover:bg-muted/50 transition-colors w-full text-left">
            <LogOut className="h-4 w-4 text-destructive" /><span className="text-sm text-destructive">{t("dashboard.signOut")}</span>
          </button>
        </div>
      </section>
    </div>
  );
}


/* ─── Exchanges Tab ─── */
function ExchangesTab({ pending, accepted, past, userId }: { pending: any[]; accepted: any[]; past: any[]; userId: string }) {
  const { t } = useTranslation();
  const [subTab, setSubTab] = useState<"pending" | "upcoming" | "past">("pending");
  const subTabs = [
    { key: "pending" as const, label: t("dashboard.pending"), count: pending.length },
    { key: "upcoming" as const, label: t("dashboard.upcoming"), count: accepted.length },
    { key: "past" as const, label: t("dashboard.past"), count: past.length },
  ];
  const currentRequests = subTab === "pending" ? pending : subTab === "upcoming" ? accepted : past;

  return (
    <div>
      <h1 className="text-xl font-serif text-foreground mb-4">{t("dashboard.myExchanges")}</h1>
      <div className="flex gap-1 mb-6 bg-muted rounded-lg p-1">
        {subTabs.map(({ key, label, count }) => (
          <button key={key} onClick={() => setSubTab(key)}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
              subTab === key ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}>
            {label}{count > 0 && <span className="ml-1.5 text-xs opacity-70">({count})</span>}
          </button>
        ))}
      </div>
      {currentRequests.length === 0 ? (
        <div className="py-16 text-center">
          <ArrowLeftRight className="mx-auto h-10 w-10 text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground text-sm">
            {subTab === "pending" ? t("dashboard.noPending") : subTab === "upcoming" ? t("dashboard.noUpcoming") : t("dashboard.noPast")}
          </p>
          <Link to="/discover"><Button variant="outline" size="sm" className="mt-4">{t("dashboard.exploreStays")}</Button></Link>
        </div>
      ) : (
        <div className="space-y-4">
          {currentRequests.map((r: any) => <ExchangeCard key={r.id} request={r} userId={userId} />)}
        </div>
      )}
    </div>
  );
}

function ExchangeCard({ request, userId }: { request: any; userId: string }) {
  const { t } = useTranslation();
  const isIncoming = request.to_member_id === userId;
  const updateStatus = useUpdateExchangeRequestStatus();
  const acceptRequest = useAcceptStayRequest();
  const showActions = isIncoming && request.status === "pending";
  const isPoints = request.exchange_type === "points";
  const pointsCost = isPoints
    ? stayPointsCost(request.start_date, request.end_date, request.listings?.points_per_night)
    : 0;

  const handleAccept = async () => {
    try {
      await acceptRequest.mutateAsync(request.id);
      toast({ title: t("dashboard.requestAccepted") });
    } catch (e) {
      toast({ title: t("dashboard.error"), description: stayPointsErrorMessage(e), variant: "destructive" });
    }
  };
  const statusColors: Record<string, string> = {
    pending: "bg-soleil/20 text-soleil-foreground border-soleil/30",
    accepted: "bg-olive/20 text-olive-foreground border-olive/30",
    declined: "bg-destructive/10 text-destructive border-destructive/20",
    completed: "bg-muted text-muted-foreground border-border",
  };
  const statusLabels: Record<string, string> = {
    pending: isIncoming ? t("dashboard.requestReceived") : t("dashboard.pending"),
    accepted: t("dashboard.confirmed"), declined: t("dashboard.declined"), completed: t("dashboard.completed"),
  };

  return (
    <div className="rounded-xl border bg-card overflow-hidden hover:shadow-md transition-shadow">
      {request.listings?.image && (
        <div className="h-36 overflow-hidden">
          <img src={request.listings.image} alt="" className="w-full h-full object-cover" />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <p className="text-xs text-muted-foreground">
              {format(new Date(request.start_date), "dd MMM yyyy", { locale: fr })} – {format(new Date(request.end_date), "dd MMM yyyy", { locale: fr })}
            </p>
            <h3 className="font-serif text-base text-foreground mt-0.5">{request.listings?.title || t("dashboard.stay")}</h3>
          </div>
          <Badge variant="outline" className={`text-xs shrink-0 ${statusColors[request.status] || ""}`}>
            {statusLabels[request.status] || request.status}
          </Badge>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-3">
          {request.number_of_guests && (
            <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{t("dashboard.travelers", { count: request.number_of_guests })}</span>
          )}
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {Math.ceil((new Date(request.end_date).getTime() - new Date(request.start_date).getTime()) / (1000 * 60 * 60 * 24))} {t("dashboard.nights")}
          </span>
          {isPoints && (
            <span className="flex items-center gap-1 font-medium text-foreground">
              🛎️ {pointsCost} pts
            </span>
          )}
        </div>
        {showActions && (
          <div className="flex gap-2 mt-4 pt-4 border-t border-border">
            <Button
              size="sm"
              className="flex-1"
              disabled={acceptRequest.isPending || updateStatus.isPending}
              onClick={handleAccept}
            >
              {isPoints ? t("dashboard.acceptWithPoints", { pts: pointsCost }) : t("dashboard.accept")}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              disabled={acceptRequest.isPending || updateStatus.isPending}
              onClick={() => updateStatus.mutate({ id: request.id, status: "declined" })}
            >
              {t("dashboard.decline")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Messages Tab ─── */
function MessagesTab({ conversations, userId }: { conversations: any[]; userId: string }) {
  const { t } = useTranslation();
  if (conversations.length === 0) {
    return (
      <div className="py-16 text-center">
        <MessageCircle className="mx-auto h-10 w-10 text-muted-foreground/30 mb-3" />
        <p className="text-muted-foreground text-sm">{t("dashboard.noMessagesYet")}</p>
      </div>
    );
  }
  return (
    <div>
      <h1 className="text-xl font-serif text-foreground mb-4">{t("dashboard.messages")}</h1>
      <div className="divide-y divide-border rounded-xl border bg-card overflow-hidden">
        {conversations.map((conv: any) => {
          const unread = conv.unread_count || 0;
          return (
          <Link key={conv.id} to={`/messages/${conv.id}`} className="flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors">
            <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
              {conv.other_profile?.avatar_url ? (
                <img src={conv.other_profile.avatar_url} alt="" className="h-full w-full object-cover" />
              ) : (<User className="h-5 w-5 text-primary" />)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className={`text-sm truncate ${unread > 0 ? "font-semibold text-foreground" : "font-medium text-foreground"}`}>
                  {conv.other_profile?.display_name || t("dashboard.member")}
                </p>
                <div className="flex items-center gap-2 shrink-0">
                  {conv.last_message && (
                    <span className="text-xs text-muted-foreground">{format(new Date(conv.last_message.created_at), "dd MMM", { locale: fr })}</span>
                  )}
                  {unread > 0 && (
                    <Badge className="h-5 min-w-5 px-1.5 rounded-full text-[10px] tabular-nums">{unread}</Badge>
                  )}
                </div>
              </div>
              <p className={`text-xs truncate mt-0.5 ${unread > 0 ? "text-foreground/80" : "text-muted-foreground"}`}>
                {conv.last_message?.content || t("dashboard.newConversation")}
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0" />
          </Link>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Guided Banners (post-onboarding empty states) ─── */
function GuidedBanners({
  myPlaces,
  myListings,
  searchParams,
  setSearchParams,
}: {
  myPlaces: any;
  myListings: any;
  searchParams: URLSearchParams;
  setSearchParams: (p: any) => void;
}) {
  const { t } = useTranslation();
  const completePlaceId = searchParams.get("completePlace");
  const proposeStayPlaceId = searchParams.get("proposeStay");
  const hasPlace = myPlaces && myPlaces.length > 0;
  const hasListing = myListings && myListings.length > 0;

  const dismissParam = (key: string) => {
    const next = new URLSearchParams(searchParams);
    next.delete(key);
    setSearchParams(next);
  };

  const banners: React.ReactNode[] = [];

  // 1) Complete place profile (just created via quick form)
  if (completePlaceId) {
    const place = myPlaces?.find((pm: any) => pm.place_id === completePlaceId);
    banners.push(
      <div key="complete" className="rounded-2xl border bg-gradient-to-br from-primary/8 to-soleil/8 border-primary/20 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-serif text-sm sm:text-base text-foreground">
              {t("dashboard.bannerCompleteTitle", { name: place?.places?.name || t("dashboard.yourPlace") })}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {t("dashboard.bannerCompleteText")}
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <Link to={`/edit-place/${completePlaceId}`}>
                <Button size="sm">{t("dashboard.bannerCompleteCta")}</Button>
              </Link>
              <Button size="sm" variant="ghost" onClick={() => dismissParam("completePlace")}>
                {t("dashboard.later")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2) Propose a stay in newly joined/created place
  if (proposeStayPlaceId && !hasListing) {
    const place = myPlaces?.find((pm: any) => pm.place_id === proposeStayPlaceId);
    banners.push(
      <div key="propose" className="rounded-2xl border bg-card p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-soleil/15 flex items-center justify-center shrink-0">
            <Home className="h-5 w-5 text-soleil" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-serif text-sm sm:text-base text-foreground">
              {t("dashboard.bannerProposeTitle", { name: place?.places?.name || t("dashboard.yourPlace") })}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {t("dashboard.bannerProposeText")}
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <Link to={`/create-listing?place=${proposeStayPlaceId}`}>
                <Button size="sm" className="bg-soleil hover:bg-soleil/90 text-soleil-foreground">
                  {t("dashboard.bannerProposeCta")}
                </Button>
              </Link>
              <Button size="sm" variant="ghost" onClick={() => dismissParam("proposeStay")}>
                {t("dashboard.notNow")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3) No place at all → CTA to create or join
  if (!hasPlace && !completePlaceId) {
    banners.push(
      <div key="no-place" className="rounded-2xl border bg-gradient-to-br from-primary/8 to-rosa/8 border-primary/20 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
            <MapPin className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-serif text-sm sm:text-base text-foreground">
              {t("dashboard.bannerNoPlaceTitle")}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {t("dashboard.bannerNoPlaceText")}
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <Link to="/onboarding">
                <Button size="sm">{t("dashboard.start")}</Button>
              </Link>
              <Link to="/discover">
                <Button size="sm" variant="ghost">{t("dashboard.exploreFirst")}</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 4) Has place but no listing (general empty state)
  if (hasPlace && !hasListing && !proposeStayPlaceId) {
    banners.push(
      <div key="propose-general" className="rounded-2xl border bg-card p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-soleil/15 flex items-center justify-center shrink-0">
            <Home className="h-5 w-5 text-soleil" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-serif text-sm sm:text-base text-foreground">
              {t("dashboard.bannerFirstStayTitle")}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {t("dashboard.bannerFirstStayText")}
            </p>
            <Link to="/create-listing" className="inline-block mt-3">
              <Button size="sm" className="bg-soleil hover:bg-soleil/90 text-soleil-foreground">
                {t("dashboard.bannerFirstStayCta")}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (banners.length === 0) return null;
  return <div className="space-y-3 mb-6">{banners}</div>;
}

export default Dashboard;
