import { Link, useNavigate, useSearchParams } from "react-router-dom";
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
import MyClaimRequests from "@/components/MyClaimRequests";
import { useIsAdmin } from "@/hooks/use-claim-requests";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "@/hooks/use-toast";

type Tab = "exchanges" | "messages" | "profile";

const Dashboard = () => {
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
  const displayName = profile?.display_name || user.email?.split("@")[0] || "Voyageur";
  const pendingRequests = requests?.filter((r) => r.status === "pending") || [];
  const acceptedRequests = requests?.filter((r) => r.status === "accepted") || [];
  const pastRequests = requests?.filter((r) => r.status === "completed" || r.status === "declined") || [];

  // Suggested stays: exclude user's own listings
  const suggestedListings = allListings?.filter((l: any) => l.host_id !== user.id).slice(0, 4) || [];

  const tabs: { key: Tab; label: string; icon: React.ElementType; count?: number }[] = [
    { key: "profile", label: "Profil", icon: User },
    { key: "exchanges", label: "Échanges", icon: ArrowLeftRight, count: pendingRequests.length },
    { key: "messages", label: "Messages", icon: MessageCircle, count: conversations?.length || 0 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Tab bar */}
      <div className="sticky top-14 z-40 bg-background/95 backdrop-blur-sm border-b border-border/60">
        <div className="max-w-3xl mx-auto flex">
          {tabs.map(({ key, label, icon: Icon, count }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-medium transition-colors relative ${
                activeTab === key ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{label}</span>
              {count != null && count > 0 && (
                <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                  {count}
                </span>
              )}
              {activeTab === key && (
                <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-primary rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
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

/* ─── Profile Tab ─── */
function ProfileTab({
  user, profile, displayName, myPlaces, myListings, placesLoading, suggestedListings, onSignOut,
}: {
  user: any; profile: any; displayName: string; myPlaces: any; myListings: any;
  placesLoading: boolean; suggestedListings: any[]; onSignOut: () => void;
}) {
  const { data: pointBalance } = usePointBalance(user.id);
  const { data: transactions } = usePointTransactions(user.id);
  const { data: referralData } = useReferralCode(user.id);
  const { data: myReferrals } = useMyReferrals(user.id);
  const { data: isAdmin } = useIsAdmin(user.id);
  const { data: recommendations, hasPrefs } = useSmartRecommendations(user.id, 6);
  const [copied, setCopied] = useState(false);

  const completionSteps = [
    { done: !!profile?.bio, label: "Bio", pts: 10 },
    { done: !!profile?.hosting_style, label: "Style d'accueil", pts: 5 },
    { done: (profile?.languages?.length || 0) > 0, label: "Langues", pts: 5 },
    { done: myPlaces && myPlaces.length > 0, label: "Lieu collectif", pts: 30 },
    { done: myListings && myListings.length > 0, label: "Séjour publié", pts: 20 },
  ];
  const completedCount = completionSteps.filter((s) => s.done).length;
  const completionPct = Math.round((completedCount / completionSteps.length) * 100);

  const copyReferralCode = () => {
    if (referralData?.code) {
      navigator.clipboard.writeText(referralData.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: "Code copié !" });
    }
  };


  return (
    <div className="space-y-6">
      {/* Profile card - HomeExchange style */}
      <section className="rounded-2xl border bg-card p-5">
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
              <Pencil className="h-3.5 w-3.5" /> Modifier mon profil
            </Link>
            <div className="flex items-center gap-1.5 mt-2">
              <Star className="h-4 w-4 text-soleil fill-soleil" />
              <span className="text-sm font-bold text-foreground">{pointBalance?.balance ?? 0}</span>
              <span className="text-xs text-muted-foreground">Points</span>
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

      {/* My listing card - HomeExchange style */}
      {myListings && myListings.length > 0 && (
        <section className="rounded-2xl border bg-card overflow-hidden">
          {myListings.slice(0, 1).map((l: any) => (
            <Link key={l.id} to={`/listing/${l.id}`} className="block">
              <div className="flex items-center gap-4 p-4">
                <div className="h-24 w-32 rounded-xl bg-muted overflow-hidden shrink-0">
                  {l.image ? (
                    <img src={l.image} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center"><Home className="h-6 w-6 text-muted-foreground/40" /></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-serif text-base text-foreground">{l.title}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{l.places?.name || l.places?.city || "France"}</p>
                  <Badge variant="outline" className={`mt-2 text-xs ${l.published ? "bg-olive/15 text-olive border-olive/25" : "bg-muted text-muted-foreground"}`}>
                    <span className={`inline-block h-1.5 w-1.5 rounded-full mr-1.5 ${l.published ? "bg-olive" : "bg-muted-foreground"}`} />
                    {l.published ? "Publié" : "Brouillon"}
                  </Badge>
                </div>
              </div>
            </Link>
          ))}

          {/* "Gérer votre calendrier" button */}
          <div className="px-4 pb-4">
            <Link to="/calendar">
              <Button
                className="w-full rounded-full bg-soleil hover:bg-soleil/90 text-soleil-foreground font-semibold text-sm py-5"
                size="lg"
              >
                <Calendar className="mr-2 h-4 w-4" />
                Gérer votre calendrier
              </Button>
            </Link>
          </div>

          {/* More listings */}
          {myListings.length > 1 && (
            <div className="px-4 pb-4 space-y-2">
              {myListings.slice(1).map((l: any) => (
                <Link key={l.id} to={`/listing/${l.id}`}
                  className="flex items-center gap-3 rounded-xl border p-3 hover:shadow-sm transition-shadow">
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

      {/* Profile completion card */}
      {completionPct < 100 && (
        <section className="rounded-2xl bg-gradient-to-r from-primary/8 to-soleil/8 border border-primary/15 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Complétez votre profil</h3>
            <span className="ml-auto text-xs font-bold text-primary">{completionPct}%</span>
          </div>
          <div className="w-full bg-border/50 rounded-full h-2 mb-3">
            <div className="bg-gradient-to-r from-primary to-soleil h-2 rounded-full transition-all" style={{ width: `${completionPct}%` }} />
          </div>
          <div className="space-y-2">
            {completionSteps.filter((s) => !s.done).map((step) => (
              <div key={step.label} className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="h-1.5 w-1.5 rounded-full bg-primary/40" />
                <span className="flex-1">{step.label}</span>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-soleil/10 text-soleil-foreground border-soleil/20">
                  +{step.pts} pts
                </Badge>
              </div>
            ))}
          </div>
          <Link to="/edit-profile">
            <Button size="sm" className="mt-3 w-full" variant="outline">
              <Pencil className="mr-1.5 h-3.5 w-3.5" /> Compléter
            </Button>
          </Link>
        </section>
      )}

      {/* Points & Referral */}
      <section className="rounded-2xl border bg-card overflow-hidden">
        <div className="p-5 border-b">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-soleil/15 flex items-center justify-center">
              <Star className="h-5 w-5 text-soleil" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Mes points Casa Minga</p>
              <p className="text-xs text-muted-foreground">Gagnez des points, échangez plus</p>
            </div>
            <span className="text-2xl font-bold text-foreground">{pointBalance?.balance ?? 0}</span>
          </div>
        </div>

        {/* Recent transactions */}
        {transactions && transactions.length > 0 && (
          <div className="px-5 py-3 border-b">
            <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Dernières activités</p>
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
            <p className="text-sm font-medium text-foreground">Parrainez un ami</p>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Partagez votre code : vous gagnez <span className="font-semibold text-olive">+50 pts</span> et votre filleul <span className="font-semibold text-olive">+25 pts</span> 🎁
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
            <p className="text-xs text-muted-foreground italic">Code en cours de génération…</p>
          )}
          {myReferrals && myReferrals.length > 0 && (
            <p className="text-xs text-muted-foreground mt-2">
              {myReferrals.filter((r: any) => r.status === "completed").length} parrainage(s) réussi(s)
            </p>
          )}
          <Button asChild size="sm" variant="default" className="w-full mt-3">
            <Link to="/referrals">
              <Gift className="h-4 w-4 mr-2" /> Inviter des amis
            </Link>
          </Button>
        </div>
      </section>

      {/* My claim requests */}
      <MyClaimRequests userId={user.id} />

      {/* My places */}
      <section>
        <h3 className="text-base font-serif text-foreground mb-3">Mes lieux</h3>
        {placesLoading ? (
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        ) : myPlaces && myPlaces.length > 0 ? (
          <div className="space-y-3">
            {myPlaces.map((pm: any) => (
              <Link key={pm.id} to={`/habitat/${pm.place_id}`}
                className="flex items-center gap-3 rounded-xl border bg-card p-3 hover:shadow-sm transition-shadow">
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
            <Plus className="h-5 w-5" /><span className="text-sm font-medium">Ajouter un lieu</span>
          </Link>
        )}
        {myPlaces && myPlaces.length > 0 && (
          <Link to="/create-place"><Button variant="outline" size="sm" className="mt-3 w-full"><Plus className="mr-2 h-4 w-4" /> Ajouter un lieu</Button></Link>
        )}
      </section>

      {/* Smart recommendations */}
      {recommendations.length > 0 && (
        <section>
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h3 className="text-base font-serif text-foreground">Habitats alignés avec vos valeurs</h3>
            </div>
            {!hasPrefs && (
              <Link to="/edit-profile" className="text-[11px] text-primary underline-offset-2 hover:underline shrink-0">
                Affiner mes préférences
              </Link>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {recommendations.map((p) => (
              <Link
                key={p.id}
                to={`/habitat/${p.id}`}
                className="rounded-xl border bg-card overflow-hidden hover:shadow-md transition-shadow group relative"
              >
                <div className="h-28 overflow-hidden relative">
                  <img
                    src={p.image || placePlaceholder}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {hasPrefs && p.matchPct > 0 && (
                    <span className="absolute top-1.5 left-1.5 inline-flex items-center gap-1 rounded-full bg-background/90 backdrop-blur-sm px-2 py-0.5 text-[10px] font-semibold text-primary border border-primary/20">
                      <Sparkles className="h-2.5 w-2.5" />
                      {p.matchPct}% match
                    </span>
                  )}
                </div>
                <div className="p-2.5">
                  <p className="font-serif text-xs text-foreground line-clamp-1">{p.name}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                    <MapPin className="h-2.5 w-2.5" />
                    {[p.city, p.region].filter(Boolean).join(", ") || "France"}
                  </p>
                  {hasPrefs && p.matchPct >= 60 && (
                    <p className="text-[10px] text-primary mt-1 italic">Correspond à {p.matchPct}% de vos valeurs</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
          <Link to="/discover">
            <Button variant="ghost" size="sm" className="mt-3 w-full text-primary">
              Explorer tous les habitats <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </Link>
        </section>
      )}

      {/* Account */}
      <section>
        <h3 className="text-base font-serif text-foreground mb-3">Mon compte</h3>
        <div className="rounded-xl border bg-card divide-y divide-border overflow-hidden">
          <Link to="/favorites" className="flex items-center gap-3 px-4 py-3.5 hover:bg-muted/50 transition-colors">
            <Heart className="h-4 w-4 text-rosa" /><span className="text-sm text-foreground flex-1">Séjours favoris</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
          </Link>
          {isAdmin && (
            <Link to="/admin/claims" className="flex items-center gap-3 px-4 py-3.5 hover:bg-muted/50 transition-colors">
              <ShieldCheck className="h-4 w-4 text-primary" /><span className="text-sm text-foreground flex-1">Gérer les revendications</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
            </Link>
          )}
          <Link to="/edit-profile" className="flex items-center gap-3 px-4 py-3.5 hover:bg-muted/50 transition-colors">
            <Settings className="h-4 w-4 text-muted-foreground" /><span className="text-sm text-foreground flex-1">Paramètres</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
          </Link>
          <button onClick={onSignOut} className="flex items-center gap-3 px-4 py-3.5 hover:bg-muted/50 transition-colors w-full text-left">
            <LogOut className="h-4 w-4 text-destructive" /><span className="text-sm text-destructive">Déconnexion</span>
          </button>
        </div>
      </section>
    </div>
  );
}


/* ─── Exchanges Tab ─── */
function ExchangesTab({ pending, accepted, past, userId }: { pending: any[]; accepted: any[]; past: any[]; userId: string }) {
  const [subTab, setSubTab] = useState<"pending" | "upcoming" | "past">("pending");
  const subTabs = [
    { key: "pending" as const, label: "En attente", count: pending.length },
    { key: "upcoming" as const, label: "À venir", count: accepted.length },
    { key: "past" as const, label: "Passés", count: past.length },
  ];
  const currentRequests = subTab === "pending" ? pending : subTab === "upcoming" ? accepted : past;

  return (
    <div>
      <h1 className="text-xl font-serif text-foreground mb-4">Mes échanges</h1>
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
            {subTab === "pending" ? "Aucune demande en attente" : subTab === "upcoming" ? "Aucun séjour à venir" : "Aucun séjour passé"}
          </p>
          <Link to="/discover"><Button variant="outline" size="sm" className="mt-4">Explorer les séjours</Button></Link>
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
      toast({ title: "Demande acceptée" });
    } catch (e) {
      toast({ title: "Erreur", description: stayPointsErrorMessage(e), variant: "destructive" });
    }
  };
  const statusColors: Record<string, string> = {
    pending: "bg-soleil/20 text-soleil-foreground border-soleil/30",
    accepted: "bg-olive/20 text-olive-foreground border-olive/30",
    declined: "bg-destructive/10 text-destructive border-destructive/20",
    completed: "bg-muted text-muted-foreground border-border",
  };
  const statusLabels: Record<string, string> = {
    pending: isIncoming ? "Demande reçue" : "En attente",
    accepted: "Confirmé", declined: "Déclinée", completed: "Terminé",
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
            <h3 className="font-serif text-base text-foreground mt-0.5">{request.listings?.title || "Séjour"}</h3>
          </div>
          <Badge variant="outline" className={`text-xs shrink-0 ${statusColors[request.status] || ""}`}>
            {statusLabels[request.status] || request.status}
          </Badge>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-3">
          {request.number_of_guests && (
            <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{request.number_of_guests} voyageur{request.number_of_guests > 1 ? "s" : ""}</span>
          )}
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {Math.ceil((new Date(request.end_date).getTime() - new Date(request.start_date).getTime()) / (1000 * 60 * 60 * 24))} nuits
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
              {isPoints ? `Accepter (${pointsCost} pts)` : "Accepter"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              disabled={acceptRequest.isPending || updateStatus.isPending}
              onClick={() => updateStatus.mutate({ id: request.id, status: "declined" })}
            >
              Décliner
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Messages Tab ─── */
function MessagesTab({ conversations, userId }: { conversations: any[]; userId: string }) {
  if (conversations.length === 0) {
    return (
      <div className="py-16 text-center">
        <MessageCircle className="mx-auto h-10 w-10 text-muted-foreground/30 mb-3" />
        <p className="text-muted-foreground text-sm">Aucun message pour le moment</p>
      </div>
    );
  }
  return (
    <div>
      <h1 className="text-xl font-serif text-foreground mb-4">Messages</h1>
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
                  {conv.other_profile?.display_name || "Membre"}
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
                {conv.last_message?.content || "Nouvelle conversation"}
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
              Étape 2 — Enrichissez le profil de {place?.places?.name || "votre lieu"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Valeurs, gouvernance, accueil… inspire confiance et améliore les échanges.
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <Link to={`/edit-place/${completePlaceId}`}>
                <Button size="sm">Compléter le profil</Button>
              </Link>
              <Button size="sm" variant="ghost" onClick={() => dismissParam("completePlace")}>
                Plus tard
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
              Souhaitez-vous proposer un séjour à {place?.places?.name || "votre lieu"} ?
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Une fiche séjour permet d'accueillir les voyageur·ses Casa Minga.
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <Link to={`/create-listing?place=${proposeStayPlaceId}`}>
                <Button size="sm" className="bg-soleil hover:bg-soleil/90 text-soleil-foreground">
                  Oui, proposer un séjour
                </Button>
              </Link>
              <Button size="sm" variant="ghost" onClick={() => dismissParam("proposeStay")}>
                Pas maintenant
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
              Connectez-vous d'abord à un lieu
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Sur Casa Minga, on rejoint ou on crée un lieu collectif avant de proposer un séjour.
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <Link to="/onboarding">
                <Button size="sm">Démarrer</Button>
              </Link>
              <Link to="/discover">
                <Button size="sm" variant="ghost">Explorer d'abord</Button>
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
              Proposez votre premier séjour
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Vous êtes membre d'un lieu : invitez la communauté à venir y séjourner.
            </p>
            <Link to="/create-listing" className="inline-block mt-3">
              <Button size="sm" className="bg-soleil hover:bg-soleil/90 text-soleil-foreground">
                Créer une fiche séjour
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
