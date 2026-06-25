import { useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Loader2, ShieldCheck, Clock, AlertCircle, CheckCircle2, Upload } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  useMyVerification,
  useMembershipPrice,
  useSubmitIdentityDocument,
} from "@/hooks/use-verification";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getExtension(file: File): string {
  // Prefer extension derived from the MIME type for reliability
  const mimeMap: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "image/webp": "webp",
    "image/heic": "heic",
    "application/pdf": "pdf",
  };
  return mimeMap[file.type] ?? (file.name.split(".").pop()?.toLowerCase() || "bin");
}

// ---------------------------------------------------------------------------
// Status badge sub-component
// ---------------------------------------------------------------------------

type VerifStatus = "none" | "pending" | "verified" | "rejected";

function StatusBanner({
  status,
  reviewNote,
}: {
  status: VerifStatus;
  reviewNote: string | null;
}) {
  const { t } = useTranslation();

  if (status === "verified") {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-green-500/30 bg-green-500/10 p-4 text-green-700 dark:text-green-400">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <p className="font-semibold">{t("verification.statusVerified")}</p>
          <p className="text-sm text-green-600/80 dark:text-green-400/80">
            {t("verification.statusVerifiedDesc")}
          </p>
        </div>
      </div>
    );
  }

  if (status === "pending") {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-700 dark:text-amber-400">
        <Clock className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <p className="font-semibold">{t("verification.statusPending")}</p>
          <p className="text-sm text-amber-600/80 dark:text-amber-400/80">
            {t("verification.statusPendingDesc")}
          </p>
        </div>
      </div>
    );
  }

  if (status === "rejected") {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-700 dark:text-red-400">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <p className="font-semibold">{t("verification.statusRejected")}</p>
          {reviewNote && (
            <p className="mt-1 text-sm text-red-600/80 dark:text-red-400/80">
              {t("verification.reviewNote")} : {reviewNote}
            </p>
          )}
          <p className="mt-1 text-sm text-red-600/80 dark:text-red-400/80">
            {t("verification.statusRejectedDesc")}
          </p>
        </div>
      </div>
    );
  }

  // status === "none"
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4">
      <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
      <div>
        <p className="font-semibold text-foreground">{t("verification.statusNone")}</p>
        <p className="text-sm text-muted-foreground">{t("verification.statusNoneDesc")}</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

const Verification = () => {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();

  const { data: verif, isLoading: verifLoading, isError: verifError } = useMyVerification();
  const { data: price, isLoading: priceLoading } = useMembershipPrice();
  const submitDoc = useSubmitIdentityDocument();

  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // ---- Auth guard ----
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // ---- Derived status ----
  const status: VerifStatus = verif?.status ?? "none";
  const canSubmit = status === "none" || status === "rejected";

  // ---- File upload handler ----
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const ext = getExtension(file);
      // Path enforced by RLS: first segment MUST be user.id
      const path = `${user.id}/id-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("identity-docs")
        .upload(path, file, { upsert: false, contentType: file.type });

      if (uploadError) {
        toast({
          title: t("verification.uploadError"),
          description: uploadError.message,
          variant: "destructive",
        });
        return;
      }

      // Do NOT log `path` — it contains the user's identity document location
      await submitDoc.mutateAsync({ path });

      toast({
        title: t("verification.uploadSuccess"),
        description: t("verification.uploadSuccessDesc"),
      });
    } catch (err: any) {
      toast({
        title: t("verification.uploadError"),
        description: err?.message ?? t("verification.uploadErrorGeneric"),
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const isPageLoading = verifLoading || priceLoading;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        <div className="container px-5 py-8 max-w-2xl mx-auto space-y-6">

          {/* ---- Page title ---- */}
          <header>
            <h1 className="font-serif text-3xl text-foreground">{t("verification.title")}</h1>
            <p className="mt-1 text-muted-foreground">{t("verification.subtitle")}</p>
          </header>

          {/* ---- Loading skeleton ---- */}
          {isPageLoading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}

          {/* ---- Global fetch error ---- */}
          {!isPageLoading && verifError && (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-destructive text-sm">
              {t("verification.fetchError")}
            </div>
          )}

          {!isPageLoading && !verifError && (
            <>
              {/* 1. Current status */}
              <StatusBanner status={status} reviewNote={verif?.review_note ?? null} />

              {/* 2. Price */}
              <section className="rounded-2xl border border-border bg-card p-4 space-y-1">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  {t("verification.membershipLabel")}
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {price !== undefined ? `${price} €` : "—"}
                </p>
                <p className="text-sm text-muted-foreground">{t("verification.membershipDesc")}</p>
              </section>

              {/* 3. Bank transfer instructions */}
              <section className="rounded-2xl border border-border bg-card p-4 space-y-3">
                <h2 className="font-semibold text-foreground">{t("verification.paymentTitle")}</h2>
                <p className="text-sm text-muted-foreground">{t("verification.paymentInstructions")}</p>

                {/* RIB/IBAN à fournir par Léo */}
                <div className="rounded-lg border border-dashed border-border bg-muted/40 p-3 text-sm text-muted-foreground">
                  {t("verification.bankPlaceholder")}
                </div>

                <p className="text-xs text-muted-foreground">{t("verification.paymentNote")}</p>
              </section>

              {/* 4. Identity document upload — only when action is possible */}
              {canSubmit && (
                <section className="rounded-2xl border border-border bg-card p-4 space-y-3">
                  <h2 className="font-semibold text-foreground">{t("verification.uploadTitle")}</h2>
                  <p className="text-sm text-muted-foreground">{t("verification.uploadDesc")}</p>

                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*,application/pdf"
                    className="hidden"
                    onChange={handleFileChange}
                    aria-label={t("verification.uploadInputLabel")}
                  />

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-dashed h-16 gap-2"
                    disabled={uploading || submitDoc.isPending}
                    onClick={() => fileRef.current?.click()}
                  >
                    {uploading || submitDoc.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {t("verification.uploading")}
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        {t("verification.uploadButton")}
                      </>
                    )}
                  </Button>

                  {/* RGPD notice */}
                  {/* Texte RGPD définitif à fournir par Léo */}
                  <p className="text-xs text-muted-foreground border-t border-border pt-3">
                    {t("verification.rgpdNotice")}
                  </p>
                </section>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Verification;
