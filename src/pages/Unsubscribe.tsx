import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle, Mail } from "lucide-react";
import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo.png";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

type Status = "loading" | "ready" | "already" | "invalid" | "submitting" | "success" | "error";

const Unsubscribe = () => {
  const [params] = useSearchParams();
  const token = params.get("token");
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      return;
    }
    (async () => {
      try {
        const res = await fetch(
          `${SUPABASE_URL}/functions/v1/handle-email-unsubscribe?token=${encodeURIComponent(token)}`,
          { headers: { apikey: SUPABASE_ANON } }
        );
        const json = await res.json();
        if (!res.ok) {
          setStatus("invalid");
          return;
        }
        if (json.valid === false && json.reason === "already_unsubscribed") {
          setStatus("already");
          return;
        }
        setStatus("ready");
      } catch {
        setStatus("invalid");
      }
    })();
  }, [token]);

  const handleConfirm = async () => {
    if (!token) return;
    setStatus("submitting");
    try {
      const { data, error } = await supabase.functions.invoke("handle-email-unsubscribe", {
        body: { token },
      });
      if (error) throw error;
      if (data?.success) {
        setStatus("success");
      } else if (data?.reason === "already_unsubscribed") {
        setStatus("already");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-warm p-4">
      <SEO title="Se désabonner des e-mails | Casa Minga" noindex />
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <img src={logo} alt="Casa Minga" className="h-10 w-10 object-contain" />
          <span className="font-serif text-2xl text-foreground">Casa Minga</span>
        </Link>

        <div className="rounded-xl border bg-background p-8 shadow-sm text-center space-y-4">
          {status === "loading" && (
            <>
              <Loader2 className="mx-auto h-7 w-7 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Vérification du lien…</p>
            </>
          )}

          {status === "ready" && (
            <>
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Mail className="h-7 w-7 text-primary" />
              </div>
              <h1 className="text-xl font-semibold text-foreground">Se désabonner des emails</h1>
              <p className="text-sm text-muted-foreground">
                Vous ne recevrez plus d'emails de Casa Minga (notifications d'échanges, confirmations…).
                Cette action est immédiate.
              </p>
              <Button onClick={handleConfirm} size="lg" className="w-full">
                Confirmer mon désabonnement
              </Button>
              <Link to="/" className="block text-xs text-muted-foreground hover:text-foreground">
                Annuler et revenir au site
              </Link>
            </>
          )}

          {status === "submitting" && (
            <>
              <Loader2 className="mx-auto h-7 w-7 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Désabonnement en cours…</p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-olive/20">
                <CheckCircle2 className="h-7 w-7 text-olive-foreground" />
              </div>
              <h1 className="text-xl font-semibold text-foreground">Vous êtes désabonné·e</h1>
              <p className="text-sm text-muted-foreground">
                Vous ne recevrez plus d'emails de notre part. Vous pouvez fermer cette fenêtre.
              </p>
              <Link to="/"><Button variant="outline" className="w-full">Retour à l'accueil</Button></Link>
            </>
          )}

          {status === "already" && (
            <>
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                <CheckCircle2 className="h-7 w-7 text-muted-foreground" />
              </div>
              <h1 className="text-xl font-semibold text-foreground">Déjà désabonné·e</h1>
              <p className="text-sm text-muted-foreground">
                Cette adresse n'est plus inscrite à nos envois.
              </p>
              <Link to="/"><Button variant="outline" className="w-full">Retour à l'accueil</Button></Link>
            </>
          )}

          {(status === "invalid" || status === "error") && (
            <>
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
                <XCircle className="h-7 w-7 text-destructive" />
              </div>
              <h1 className="text-xl font-semibold text-foreground">Lien invalide</h1>
              <p className="text-sm text-muted-foreground">
                Ce lien de désabonnement est invalide ou a expiré.
              </p>
              <Link to="/"><Button variant="outline" className="w-full">Retour à l'accueil</Button></Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Unsubscribe;
