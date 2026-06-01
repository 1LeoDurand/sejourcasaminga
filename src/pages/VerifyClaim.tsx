import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2, MailCheck } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

type State =
  | { kind: "loading" }
  | { kind: "ok"; alreadyVerified: boolean; placeId?: string }
  | { kind: "error"; reason: string };

export default function VerifyClaim() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const navigate = useNavigate();
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    if (state.kind === "ok" && state.placeId && !state.alreadyVerified) {
      const t = setTimeout(() => navigate(`/habitat/${state.placeId}`), 2000);
      return () => clearTimeout(t);
    }
  }, [state, navigate]);


  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!token) {
        setState({ kind: "error", reason: "missing_token" });
        return;
      }
      const { data, error } = await supabase.rpc("verify_claim_token" as any, { _token: token });
      if (cancelled) return;
      if (error) {
        setState({ kind: "error", reason: error.message });
        return;
      }
      const res = (data ?? {}) as { ok?: boolean; error?: string; already_verified?: boolean; place_id?: string };
      if (res.ok) {
        setState({ kind: "ok", alreadyVerified: !!res.already_verified, placeId: res.place_id });
      } else {
        setState({ kind: "error", reason: res.error || "unknown" });
      }
    }
    run();
    return () => { cancelled = true; };
  }, [token]);

  const errorMessage = (reason: string) => {
    switch (reason) {
      case "missing_token": return "Lien invalide : aucun token fourni.";
      case "invalid_token": return "Ce lien de vérification est invalide.";
      case "not_found": return "Cette demande n'existe pas ou a été supprimée.";
      case "expired": return "Ce lien a expiré. Veuillez soumettre une nouvelle demande.";
      default: return "Une erreur est survenue. Veuillez réessayer plus tard.";
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO title="Vérification de revendication · Casa Minga" />
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center bg-card border rounded-2xl p-10 shadow-sm">
          {state.kind === "loading" && (
            <>
              <Loader2 className="h-10 w-10 mx-auto text-primary animate-spin" />
              <p className="mt-4 text-muted-foreground">Vérification en cours…</p>
            </>
          )}

          {state.kind === "ok" && (
            <>
              <div className="h-14 w-14 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                {state.alreadyVerified ? (
                  <MailCheck className="h-7 w-7 text-primary" />
                ) : (
                  <CheckCircle2 className="h-7 w-7 text-primary" />
                )}
              </div>
              <h1 className="font-serif text-2xl mt-5 text-foreground">
                {state.alreadyVerified ? "Email déjà confirmé" : "Email confirmé ✓"}
              </h1>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                Merci. Votre adresse est validée. Notre équipe examinera votre
                demande de revendication et vous tiendra informé·e par email.
                {!state.alreadyVerified && state.placeId && (
                  <span className="block mt-2 text-xs italic">Redirection vers le lieu dans 2 secondes…</span>
                )}
              </p>
              <div className="mt-6 flex gap-2 justify-center">
                {state.placeId && (
                  <Button asChild variant="outline" size="sm">
                    <Link to={`/habitat/${state.placeId}`}>Voir le lieu</Link>
                  </Button>
                )}
                <Button asChild size="sm">
                  <Link to="/dashboard">Mon tableau de bord</Link>
                </Button>
              </div>
            </>
          )}

          {state.kind === "error" && (
            <>
              <div className="h-14 w-14 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
                <XCircle className="h-7 w-7 text-destructive" />
              </div>
              <h1 className="font-serif text-2xl mt-5 text-foreground">Vérification impossible</h1>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                {errorMessage(state.reason)}
              </p>
              <Button asChild className="mt-6" size="sm">
                <Link to="/discover">Découvrir les habitats</Link>
              </Button>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
