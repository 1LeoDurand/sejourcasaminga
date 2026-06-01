import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { useReferralCode } from "@/hooks/use-points";
import { useReferralStats, useReferredUserNames, useSendInvite, REWARD_THRESHOLDS } from "@/hooks/use-referrals";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Copy, Mail, MessageCircle, ArrowLeft, Gift, Star, Award, CheckCircle2, Clock, Send } from "lucide-react";

const inviteSchema = z.object({
  email: z.string().trim().email("Email invalide").max(255),
  personalMessage: z.string().max(500).optional(),
});

export default function Referrals() {
  const { user } = useAuth();
  const { data: profile } = useQuery({
    queryKey: ["my-profile-name", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("display_name").eq("user_id", user!.id).maybeSingle();
      return data;
    },
  });
  const { data: refCode } = useReferralCode(user?.id);
  const { data: stats, isLoading } = useReferralStats(user?.id);
  const referrerName = profile?.display_name ?? user?.email?.split("@")[0];

  const sendInvite = useSendInvite(user?.id, refCode?.code, referrerName);

  const [email, setEmail] = useState("");
  const [personalMessage, setPersonalMessage] = useState("");

  const inviteUrl = useMemo(() => {
    if (!refCode?.code) return "";
    return `${window.location.origin}/auth?tab=signup&ref=${encodeURIComponent(refCode.code)}`;
  }, [refCode?.code]);

  const qrUrl = inviteUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(inviteUrl)}`
    : "";

  const completedIds = (stats?.completed ?? []).map((r) => r.referred_user_id!).filter(Boolean);
  const { data: names } = useReferredUserNames(completedIds);

  const completedCount = stats?.completedCount ?? 0;
  const nextThreshold = REWARD_THRESHOLDS.find((t) => completedCount < t.count);
  const progressPct = nextThreshold ? Math.round((completedCount / nextThreshold.count) * 100) : 100;

  const copyLink = async () => {
    if (!inviteUrl) return;
    await navigator.clipboard.writeText(inviteUrl);
    toast.success("Lien copié");
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = inviteSchema.safeParse({ email, personalMessage: personalMessage || undefined });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Données invalides");
      return;
    }
    // Duplicate guard
    const already = (stats?.all ?? []).some(
      (r) => r.referred_email?.toLowerCase() === parsed.data.email.toLowerCase()
    );
    if (already) {
      toast.warning("Vous avez déjà invité cette personne");
      return;
    }
    await sendInvite.mutateAsync({ email: parsed.data.email, personalMessage: parsed.data.personalMessage });
    setEmail("");
    setPersonalMessage("");
  };

  const shareEmail = () => {
    const subject = encodeURIComponent("Rejoins-moi sur Casa Minga");
    const body = encodeURIComponent(
      `Je voulais te partager Casa Minga, la communauté d'habitats collectifs ouverts à l'échange.\n\nRejoins-moi via mon lien : ${inviteUrl}`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent(`Rejoins-moi sur Casa Minga, communauté d'habitats collectifs : ${inviteUrl}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  if (!user) {
    return (
      <>
        <Navbar />
        <main className="container mx-auto px-4 py-16 text-center">
          <h1 className="font-display text-3xl mb-4">Inviter des amis</h1>
          <p className="text-muted-foreground mb-6">Connectez-vous pour partager Casa Minga.</p>
          <Button asChild><Link to="/auth">Se connecter</Link></Button>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <SEO title="Inviter des amis — Casa Minga" description="Partagez Casa Minga avec vos proches et débloquez des récompenses." />
      <Navbar />
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4" /> Retour au dashboard
          </Link>

          <header className="mb-8">
            <Badge variant="secondary" className="mb-3">Parrainage</Badge>
            <h1 className="font-display text-4xl mb-2">Faites grandir la communauté</h1>
            <p className="text-muted-foreground">
              Invitez vos proches : vous gagnez tous les deux un bonus, et débloquez des récompenses au fil des invitations.
            </p>
          </header>

          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            {/* My link */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Gift className="h-5 w-5 text-primary" /> Mon lien d'invitation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input value={inviteUrl} readOnly className="font-mono text-xs" />
                  <Button onClick={copyLink} variant="outline" className="shrink-0">
                    <Copy className="h-4 w-4 mr-2" /> Copier
                  </Button>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button variant="outline" size="sm" onClick={shareEmail}><Mail className="h-4 w-4 mr-2" />Email</Button>
                  <Button variant="outline" size="sm" onClick={shareWhatsApp}><MessageCircle className="h-4 w-4 mr-2" />WhatsApp</Button>
                </div>

                <div className="pt-4 border-t">
                  <form onSubmit={handleInvite} className="space-y-3">
                    <Label htmlFor="invite-email">Envoyer une invitation par email</Label>
                    <div className="flex gap-2">
                      <Input id="invite-email" type="email" placeholder="prenom@email.com"
                        value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <Textarea placeholder="Message personnel (optionnel)" rows={2} maxLength={500}
                      value={personalMessage} onChange={(e) => setPersonalMessage(e.target.value)} />
                    <Button type="submit" disabled={sendInvite.isPending} className="w-full">
                      <Send className="h-4 w-4 mr-2" />
                      {sendInvite.isPending ? "Envoi…" : "Envoyer l'invitation"}
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>

            {/* QR + counter */}
            <Card>
              <CardHeader><CardTitle>QR Code</CardTitle></CardHeader>
              <CardContent className="flex flex-col items-center text-center space-y-3">
                {qrUrl ? (
                  <img src={qrUrl} alt="QR code de mon lien" width={180} height={180} className="rounded" loading="lazy" />
                ) : <Skeleton className="h-[180px] w-[180px]" />}
                <p className="text-xs text-muted-foreground">Scannez ou partagez en personne</p>
                <div className="pt-3 border-t w-full">
                  <p className="font-display text-4xl text-primary">{completedCount}</p>
                  <p className="text-sm text-muted-foreground">ami{completedCount > 1 ? "s" : ""} {completedCount > 1 ? "ont" : "a"} rejoint</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Rewards */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Award className="h-5 w-5 text-primary" /> Récompenses</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {nextThreshold && (
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Prochain palier : <strong>{nextThreshold.label}</strong></span>
                    <span className="text-muted-foreground">{completedCount} / {nextThreshold.count}</span>
                  </div>
                  <Progress value={progressPct} className="h-2" />
                </div>
              )}

              <div className="grid sm:grid-cols-3 gap-3 pt-2">
                {REWARD_THRESHOLDS.map((t) => {
                  const unlocked = completedCount >= t.count;
                  return (
                    <div key={t.count}
                      className={`rounded-lg border p-4 text-center ${unlocked ? "border-primary/40 bg-primary/5" : "border-border bg-muted/30 opacity-60"}`}>
                      <div className="text-3xl mb-2">{t.icon}</div>
                      <p className="text-xs text-muted-foreground mb-1">{t.count} filleul{t.count > 1 ? "s" : ""}</p>
                      <p className="font-medium text-sm">{t.label}</p>
                      {unlocked && (
                        <Badge variant="secondary" className="mt-2 gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Débloqué
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>

              {(stats?.completed.length ?? 0) > 0 && (
                <div className="pt-4 border-t space-y-2">
                  <p className="text-sm font-medium">Filleuls inscrits</p>
                  {stats!.completed.map((r) => (
                    <div key={r.id} className="flex items-center gap-2 text-sm">
                      <Star className="h-4 w-4 text-primary" />
                      <span>{names?.[r.referred_user_id!] ?? "Nouveau membre"}</span>
                      <span className="text-muted-foreground text-xs ml-auto">
                        {new Date(r.completed_at ?? r.created_at).toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Invitations list */}
          <Card>
            <CardHeader><CardTitle>Mes invitations</CardTitle></CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
              ) : (stats?.invited.length ?? 0) === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">Aucune invitation envoyée pour l'instant.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-left text-muted-foreground">
                      <tr><th className="py-2">Email</th><th>Statut</th><th>Date</th></tr>
                    </thead>
                    <tbody>
                      {stats!.invited.map((r) => (
                        <tr key={r.id} className="border-t">
                          <td className="py-3 break-all">{r.referred_email}</td>
                          <td>
                            {r.status === "completed" ? (
                              <Badge className="gap-1"><CheckCircle2 className="h-3 w-3" />Inscrit</Badge>
                            ) : (
                              <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />En attente</Badge>
                            )}
                          </td>
                          <td className="text-muted-foreground text-xs">
                            {new Date(r.created_at).toLocaleDateString("fr-FR")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  );
}
