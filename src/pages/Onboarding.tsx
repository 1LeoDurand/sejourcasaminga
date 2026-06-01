import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Users, Home, Compass, Search, MapPin, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { usePlaces, useJoinPlace } from "@/hooks/use-places";
import { toast } from "@/hooks/use-toast";
import SEO from "@/components/SEO";

const ONBOARDING_DONE_KEY = "cm_onboarding_done";

type Step = "intro" | "join" | "explore-confirm";

const Onboarding = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [step, setStep] = useState<Step>("intro");
  const [search, setSearch] = useState("");
  const { data: places, isLoading: placesLoading } = usePlaces();
  const joinPlace = useJoinPlace();

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [authLoading, user, navigate]);

  const filtered = useMemo(() => {
    if (!places) return [];
    const q = search.trim().toLowerCase();
    if (!q) return places.slice(0, 8);
    return places
      .filter(
        (p: any) =>
          p.name?.toLowerCase().includes(q) ||
          p.city?.toLowerCase().includes(q) ||
          p.region?.toLowerCase().includes(q)
      )
      .slice(0, 12);
  }, [places, search]);

  const finishOnboarding = () => {
    try {
      localStorage.setItem(ONBOARDING_DONE_KEY, "1");
    } catch {}
  };

  const handleSelectPlace = async (place: any) => {
    if (!user) return;
    // Imported & unclaimed → claim flow on the place page
    if (place.is_imported && place.claim_status !== "claimed") {
      finishOnboarding();
      navigate(`/habitat/${place.id}?claim=1`);
      return;
    }
    // Otherwise → instant join via place_members
    try {
      await joinPlace.mutateAsync({
        place_id: place.id,
        user_id: user.id,
        relationship_to_place: "Membre",
      });
      finishOnboarding();
      toast({ title: "Vous avez rejoint le lieu", description: place.name });
      navigate(`/dashboard?proposeStay=${place.id}`);
    } catch (e: any) {
      // Likely already a member
      if (e.message?.includes("duplicate")) {
        finishOnboarding();
        navigate(`/dashboard?proposeStay=${place.id}`);
        return;
      }
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm">
      <SEO title="Bienvenue sur Casa Minga" description="Configurez votre espace et démarrez votre aventure d'échange entre habitats collectifs." />
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-10 sm:py-16">
        {step === "intro" && (
          <div className="space-y-6">
            <div className="text-center space-y-3">
              <h1 className="text-3xl sm:text-4xl font-serif text-foreground">Bienvenue sur Casa Minga</h1>
              <p className="text-muted-foreground text-base sm:text-lg">
                Que souhaitez-vous faire ?
              </p>
            </div>

            <div className="grid gap-3 sm:gap-4 mt-8">
              <ChoiceCard
                icon={Users}
                title="Je fais partie d'un lieu existant"
                description="Rejoignez le lieu collectif où vous vivez ou que vous co-gérez."
                onClick={() => setStep("join")}
                accent="primary"
              />
              <ChoiceCard
                icon={Home}
                title="Je veux créer ma fiche lieu"
                description="Présentez votre habitat collectif sur Casa Minga en quelques minutes."
                onClick={() => {
                  finishOnboarding();
                  navigate("/create-place/quick?from=onboarding");
                }}
                accent="soleil"
              />
              <ChoiceCard
                icon={Compass}
                title="Je découvre pour le moment"
                description="Explorez les lieux et inspirez-vous avant de vous engager."
                onClick={() => {
                  finishOnboarding();
                  navigate("/discover");
                }}
                accent="muted"
              />
            </div>

            <p className="text-xs text-muted-foreground text-center mt-6">
              Vous pourrez changer d'avis à tout moment depuis votre tableau de bord.
            </p>
          </div>
        )}

        {step === "join" && (
          <div className="space-y-6">
            <button
              onClick={() => setStep("intro")}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              ← Retour
            </button>
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-serif text-foreground">
                Trouvez votre lieu
              </h1>
              <p className="text-sm text-muted-foreground">
                Cherchez par nom ou par ville. S'il a été pré-importé, vous pourrez le revendiquer ; sinon, vous le rejoindrez directement.
              </p>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Nom du lieu, ville…"
                className="pl-10 h-12 text-base"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              {placesLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : filtered.length === 0 ? (
                <div className="rounded-xl border border-dashed bg-card p-6 text-center text-sm text-muted-foreground">
                  Aucun lieu ne correspond. Vous pouvez{" "}
                  <Link to="/create-place/quick?from=onboarding" className="text-primary underline">
                    créer la fiche
                  </Link>
                  .
                </div>
              ) : (
                filtered.map((p: any) => (
                  <button
                    key={p.id}
                    onClick={() => handleSelectPlace(p)}
                    disabled={joinPlace.isPending}
                    className="w-full flex items-center gap-3 rounded-xl border bg-card p-3 text-left hover:border-primary/40 hover:shadow-sm transition-all disabled:opacity-60"
                  >
                    <div className="h-14 w-14 rounded-lg bg-muted overflow-hidden shrink-0">
                      {p.image ? (
                        <img src={p.image} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <Home className="h-5 w-5 text-muted-foreground/40" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-serif text-sm text-foreground truncate">{p.name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3" />
                        {[p.city, p.region].filter(Boolean).join(", ") || "France"}
                      </p>
                      {p.is_imported && p.claim_status !== "claimed" && (
                        <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded bg-soleil/15 text-soleil-foreground border border-soleil/25">
                          À revendiquer
                        </span>
                      )}
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </button>
                ))
              )}
            </div>

            <div className="pt-4 border-t text-center">
              <p className="text-sm text-muted-foreground mb-2">Vous ne trouvez pas votre lieu ?</p>
              <Link to="/create-place/quick?from=onboarding">
                <Button variant="outline" size="sm">
                  Créer la fiche du lieu
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

function ChoiceCard({
  icon: Icon,
  title,
  description,
  onClick,
  accent,
}: {
  icon: any;
  title: string;
  description: string;
  onClick: () => void;
  accent: "primary" | "soleil" | "muted";
}) {
  const colors = {
    primary: "bg-primary/10 text-primary",
    soleil: "bg-soleil/15 text-soleil",
    muted: "bg-muted text-muted-foreground",
  }[accent];
  return (
    <button
      onClick={onClick}
      className="group flex items-start gap-4 rounded-2xl border bg-card p-5 text-left hover:border-primary/40 hover:shadow-md transition-all"
    >
      <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${colors}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-serif text-base text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>
      <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0 mt-1" />
    </button>
  );
}

export default Onboarding;
