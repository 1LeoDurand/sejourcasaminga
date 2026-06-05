import { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, ArrowRight, Loader2, RefreshCw } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import logo from "@/assets/logo.png";
import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [tab, setTab] = useState<"login" | "signup">(
    searchParams.get("tab") === "signup" ? "signup" : "login"
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [resending, setResending] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [newsletterOptIn, setNewsletterOptIn] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error(t("auth.email"));
      return;
    }
    setForgotLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setForgotSent(true);
    } catch (error: any) {
      toast.error(error.message || "Error");
    } finally {
      setForgotLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      const done = (() => { try { return localStorage.getItem("cm_onboarding_done") === "1"; } catch { return true; } })();
      navigate(done ? "/dashboard" : "/onboarding");
    }
  }, [user, navigate]);

  const handleResendConfirmation = async () => {
    if (!email) {
      toast.error(t("auth.email"));
      return;
    }
    setResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: { emailRedirectTo: window.location.origin },
      });
      if (error) throw error;
      toast.success(t("auth.resendConfirmation"));
    } catch (error: any) {
      toast.error(error.message || "Error");
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (tab === "signup") {
        const { data: signUpData, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { first_name: name, newsletter_opt_in: newsletterOptIn },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;

        // Persist newsletter opt-in on the profile (created by handle_new_user trigger)
        const newUserId = signUpData.user?.id;
        const refParam = searchParams.get("ref");
        if (newUserId) {
          // Claim referral (best-effort)
          if (refParam) {
            try { await supabase.rpc("claim_referral" as any, { _code: refParam }); } catch (e) { console.warn("claim_referral failed", e); }
          }
          try {
            await supabase
              .from("profiles")
              .update({ newsletter_opt_in: newsletterOptIn })
              .eq("user_id", newUserId);
          } catch (e) {
            console.warn("Could not persist newsletter opt-in", e);
          }

          // Fetch referral code (created by initialize_user_points trigger)
          let referralCode: string | undefined;
          try {
            const { data: ref } = await supabase
              .from("referrals")
              .select("code")
              .eq("referrer_user_id", newUserId)
              .maybeSingle();
            referralCode = ref?.code;
          } catch {}

          // Fire-and-forget welcome email
          supabase.functions
            .invoke("send-transactional-email", {
              body: {
                templateName: "welcome",
                recipientEmail: email,
                idempotencyKey: `welcome-${newUserId}`,
                templateData: { firstName: name, referralCode },
              },
            })
            .then(async ({ error: invokeErr }) => {
              if (!invokeErr) {
                await supabase
                  .from("profiles")
                  .update({ welcome_email_sent_at: new Date().toISOString() })
                  .eq("user_id", newUserId);
              }
            })
            .catch((e) => console.warn("Welcome email failed", e));
        }

        toast.success("Bienvenue !");
        try { localStorage.removeItem("cm_onboarding_done"); } catch {}
        navigate("/onboarding");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        const done = (() => { try { return localStorage.getItem("cm_onboarding_done") === "1"; } catch { return true; } })();
        navigate(done ? "/dashboard" : "/onboarding");
      }
    } catch (error: any) {
      toast.error(error.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-warm p-4">
      <SEO
        title={tab === "signup" ? "Inscription — rejoindre Casa Minga" : "Connexion — Casa Minga"}
        description="Connectez-vous ou créez votre compte Casa Minga pour échanger des séjours entre habitats participatifs, écolieux et lieux de vie collective."
        canonical="/auth"
        noindex
      />
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <img src={logo} alt="Casa Minga" className="h-10 w-10 object-contain" />
          <span className="font-serif text-2xl text-foreground">Casa Minga</span>
        </Link>

        <div className="rounded-xl border bg-background p-8 shadow-sm">
          {forgotMode ? (
            forgotSent ? (
              <div className="text-center space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <Mail className="h-7 w-7 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">{t("auth.emailSent")}</h2>
                <p className="text-sm text-muted-foreground">{t("auth.ifAccountExists", { email })}</p>
                <p className="text-xs text-muted-foreground">{t("auth.checkSpam")}</p>
                <Button variant="ghost" className="w-full text-sm" onClick={() => { setForgotMode(false); setForgotSent(false); }}>
                  {t("auth.backToLogin")}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <h2 className="text-xl text-foreground">{t("auth.forgotTitle")}</h2>
                <p className="text-sm text-muted-foreground">{t("auth.forgotSubtitle")}</p>
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div>
                    <Label htmlFor="forgot-email">{t("auth.email")}</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input id="forgot-email" type="email" placeholder="vous@exemple.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" required />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" size="lg" disabled={forgotLoading}>
                    {forgotLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t("auth.sendLink")}
                  </Button>
                </form>
                <Button variant="ghost" className="w-full text-sm" onClick={() => setForgotMode(false)}>
                  {t("auth.backToLogin")}
                </Button>
              </div>
            )
          ) : signupSuccess ? (
            <div className="text-center space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Mail className="h-7 w-7 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">{t("auth.checkInbox")}</h2>
              <p className="text-sm text-muted-foreground">{t("auth.confirmationSent", { email })}</p>
              <p className="text-xs text-muted-foreground">{t("auth.checkSpam")}</p>
              <div className="pt-2 space-y-2">
                <Button variant="outline" className="w-full" onClick={handleResendConfirmation} disabled={resending}>
                  {resending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                  {t("auth.resendConfirmation")}
                </Button>
                <Button variant="ghost" className="w-full text-sm" onClick={() => { setSignupSuccess(false); setTab("login"); }}>
                  {t("auth.backToLogin")}
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-6 flex rounded-lg bg-muted p-1">
                <button
                  onClick={() => setTab("login")}
                  className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
                    tab === "login" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
                  }`}
                >
                  {t("common.signIn")}
                </button>
                <button
                  onClick={() => setTab("signup")}
                  className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
                    tab === "signup" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
                  }`}
                >
                  {t("common.signUp")}
                </button>
              </div>

              <h2 className="mb-1 text-xl text-foreground">
                {tab === "login" ? t("auth.welcomeBack") : t("auth.joinTitle")}
              </h2>
              <p className="mb-6 text-sm text-muted-foreground">
                {tab === "login" ? t("auth.loginSubtitle") : t("auth.signupSubtitle")}
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {tab === "signup" && (
                  <div>
                    <Label htmlFor="name">{t("auth.firstName")}</Label>
                    <Input id="name" placeholder={t("auth.firstNamePlaceholder")} value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>
                )}
                <div>
                  <Label htmlFor="email">{t("auth.email")}</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="email" type="email" placeholder="vous@exemple.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" required />
                  </div>
                </div>
                <div>
                  <Label htmlFor="password">{t("auth.password")}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10" required minLength={6} />
                  </div>
                </div>
                {tab === "signup" && (
                  <label className="flex items-start gap-2.5 cursor-pointer rounded-lg border border-border/60 bg-warm/40 p-3">
                    <Checkbox
                      id="newsletter"
                      checked={newsletterOptIn}
                      onCheckedChange={(v) => setNewsletterOptIn(v === true)}
                      className="mt-0.5"
                    />
                    <span className="text-xs text-muted-foreground leading-relaxed">
                      Je souhaite recevoir <strong className="text-foreground">la lettre Casa Minga</strong> :
                      les nouveaux lieux, les histoires de la communauté, les inspirations.
                      <span className="block mt-0.5 text-[0.65rem] text-muted-foreground/70">
                        Une fois par mois, sans spam, désinscription en un clic.
                      </span>
                    </span>
                  </label>
                )}
                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {tab === "login" ? t("auth.login") : t("auth.signup")}
                  {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
              </form>

              {tab === "login" && (
                <div className="mt-4 space-y-2 text-center text-sm text-muted-foreground">
                  <p>
                    <button onClick={() => setForgotMode(true)} className="text-primary hover:underline">{t("auth.forgotPassword")}</button>
                  </p>
                  <p>
                    {t("auth.noAccount")}{" "}
                    <button onClick={() => setTab("signup")} className="text-primary hover:underline">{t("auth.signupHere")}</button>
                  </p>
                </div>
              )}
              {tab === "signup" && (
                <p className="mt-4 text-center text-sm text-muted-foreground">
                  {t("auth.alreadyMember")}{" "}
                  <button onClick={() => setTab("login")} className="text-primary hover:underline">{t("auth.loginHere")}</button>
                </p>
              )}
            </>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          {t("auth.termsNotice")}
        </p>
      </div>
    </div>
  );
};

export default Auth;
