import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { compressImage } from "@/lib/compress-image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, ArrowLeft, Save, Camera, User, Sparkles, Check, X, BadgeCheck } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile, useUpdateProfile } from "@/hooks/use-profile";
import { useUserPreferences, useUpsertUserPreferences, HABITAT_TYPE_OPTIONS, STAY_DURATION_OPTIONS } from "@/hooks/use-user-preferences";
import { VALUE_TAGS } from "@/data/demo";
import { useQuery } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { computeCompletion, completionColor, COMPLETION_LABELS, type CompletionField } from "@/lib/profile-completion";
import { Progress } from "@/components/ui/progress";

const EditProfile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: profile, isLoading } = useProfile(user?.id);
  const updateProfile = useUpdateProfile();
  const { data: prefs } = useUserPreferences(user?.id);
  const upsertPrefs = useUpsertUserPreferences();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const [prefForm, setPrefForm] = useState({
    preferred_habitat_types: [] as string[],
    preferred_values: [] as string[],
    preferred_regions: [] as string[],
    desired_stay_duration: "",
  });

  // Fetch distinct regions from places for the region picker
  const { data: regionOptions } = useQuery({
    queryKey: ["distinct-place-regions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("places")
        .select("region")
        .eq("published", true)
        .not("region", "is", null)
        .limit(500);
      if (error) throw error;
      const set = new Set<string>();
      (data || []).forEach((p: any) => p.region && set.add(p.region));
      return [...set].sort();
    },
  });

  const [form, setForm] = useState({
    display_name: "",
    bio: "",
    hosting_style: "",
    collective_experience: "",
    languages: [] as string[],
  });
  const [emailSettings, setEmailSettings] = useState({
    weekly_digest: true,
    frequency: "weekly" as "weekly" | "biweekly" | "monthly" | "never",
    preferred_day: 1,
  });
  const [newLang, setNewLang] = useState("");

  useEffect(() => {
    if (profile) {
      setForm({
        display_name: profile.display_name || "",
        bio: profile.bio || "",
        hosting_style: profile.hosting_style || "",
        collective_experience: profile.collective_experience || "",
        languages: profile.languages || [],
      });
      setAvatarUrl(profile.avatar_url || null);
      const es = (profile as any).email_settings;
      if (es) {
        setEmailSettings({
          weekly_digest: es.weekly_digest !== false,
          frequency: es.frequency ?? "weekly",
          preferred_day: typeof es.preferred_day === "number" ? es.preferred_day : 1,
        });
      }
    }
  }, [profile]);

  useEffect(() => {
    if (prefs) {
      setPrefForm({
        preferred_habitat_types: prefs.preferred_habitat_types || [],
        preferred_values: prefs.preferred_values || [],
        preferred_regions: prefs.preferred_regions || [],
        desired_stay_duration: prefs.desired_stay_duration || "",
      });
    }
  }, [prefs]);

  const togglePref = (key: "preferred_habitat_types" | "preferred_values" | "preferred_regions", v: string) =>
    setPrefForm((f) => ({
      ...f,
      [key]: f[key].includes(v) ? f[key].filter((x) => x !== v) : [...f[key], v],
    }));

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    try {
      const compressed = await compressImage(file, { maxDim: 512 });
      const ext = compressed.type === "image/webp" ? "webp" : file.name.split(".").pop();
      const path = `${user.id}/avatar.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, compressed, { upsert: true, contentType: compressed.type });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
      const url = `${publicUrl}?t=${Date.now()}`;
      setAvatarUrl(url);
      await updateProfile.mutateAsync({ userId: user.id, updates: { avatar_url: url } });
      toast({ title: "Photo mise à jour ✓" });
    } catch (err: any) {
      toast({ title: "Erreur upload", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const set = (key: string, value: any) => setForm((f) => ({ ...f, [key]: value }));

  const addLanguage = () => {
    if (!newLang.trim()) return;
    setForm((f) => ({ ...f, languages: [...f.languages, newLang.trim()] }));
    setNewLang("");
  };

  const removeLanguage = (index: number) => {
    setForm((f) => ({ ...f, languages: f.languages.filter((_, i) => i !== index) }));
  };

  const handleSave = async () => {
    if (!user) return;
    try {
      await updateProfile.mutateAsync({
        userId: user.id,
        updates: { ...form, email_settings: emailSettings } as any,
      });
      await upsertPrefs.mutateAsync({
        user_id: user.id,
        preferred_habitat_types: prefForm.preferred_habitat_types,
        preferred_values: prefForm.preferred_values,
        preferred_regions: prefForm.preferred_regions,
        desired_stay_duration: prefForm.desired_stay_duration || null,
      });
      toast({ title: "Profil mis à jour ✓" });
      navigate("/dashboard?tab=profile");
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // ─── Profile completion (5 fields × 20%) ───
  const completion = computeCompletion({
    avatar_url: avatarUrl,
    bio: form.bio,
    preferred_values: prefForm.preferred_values,
    languages: form.languages,
    preferred_regions: prefForm.preferred_regions,
  });
  const fieldOk = (f: CompletionField) =>
    completion.checks[f] ? (
      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
        <Check className="h-3 w-3" /> rempli
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
        <X className="h-3 w-3" /> à compléter
      </span>
    );


  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container max-w-xl py-8 px-4">
        <button onClick={() => navigate(-1)} className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Retour
        </button>

        <h1 className="text-2xl font-serif text-foreground mb-1">Modifier mon profil</h1>
        <p className="text-sm text-muted-foreground mb-8">Ces informations sont visibles par les autres membres.</p>

        <div className="space-y-6">
          {/* ─── Completion tracker ─── */}
          <section className="rounded-xl border bg-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {completion.pct >= 90 ? (
                  <BadgeCheck className="h-4 w-4 text-emerald-600" />
                ) : (
                  <Sparkles className="h-4 w-4 text-primary" />
                )}
                <span className="text-sm font-medium text-foreground">
                  Profil {completion.pct}% complet
                </span>
              </div>
              {completion.pct >= 90 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-700 px-2 py-0.5 text-[11px] font-semibold">
                  <Check className="h-3 w-3" /> Profil complet
                </span>
              )}
            </div>
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={`absolute inset-y-0 left-0 ${completionColor(completion.pct)} transition-all duration-500`}
                style={{ width: `${completion.pct}%` }}
              />
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px]">
              {(Object.keys(COMPLETION_LABELS) as CompletionField[]).map((f) => (
                <span key={f} className="inline-flex items-center gap-1">
                  {completion.checks[f] ? (
                    <Check className="h-3 w-3 text-emerald-600" />
                  ) : (
                    <X className="h-3 w-3 text-muted-foreground" />
                  )}
                  <span className={completion.checks[f] ? "text-foreground" : "text-muted-foreground"}>
                    {COMPLETION_LABELS[f]}
                  </span>
                </span>
              ))}
            </div>
            {completion.pct < 100 && (
              <p className="text-xs text-muted-foreground">
                Complète ton profil pour de meilleures recommandations.
              </p>
            )}
          </section>


          {/* Avatar */}
          <section className="rounded-xl border bg-card p-5 flex flex-col items-center gap-3">
            <div className="relative group">
              <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center overflow-hidden ring-2 ring-primary/20">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <User className="h-10 w-10 text-muted-foreground" />
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors"
                disabled={uploading}
              >
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
            </div>
            <p className="text-xs text-muted-foreground">Cliquez pour changer votre photo</p>
            {fieldOk("photo")}
          </section>

          <section className="rounded-xl border bg-card p-5 space-y-4">
            <div>
              <Label>Nom affiché *</Label>
              <Input value={form.display_name} onChange={(e) => set("display_name", e.target.value)} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <Label>Bio</Label>
                {fieldOk("bio")}
              </div>
              <Textarea value={form.bio} onChange={(e) => set("bio", e.target.value)} rows={4} placeholder="Parlez de vous, de votre parcours, de ce qui vous anime…" />
              <p className="text-[11px] text-muted-foreground mt-1">Au moins 20 caractères.</p>
            </div>
          </section>

          <section className="rounded-xl border bg-card p-5 space-y-4">
            <h2 className="text-base font-serif text-foreground">Style d'accueil</h2>
            <div>
              <Label>Comment accueillez-vous ?</Label>
              <Textarea value={form.hosting_style} onChange={(e) => set("hosting_style", e.target.value)} rows={2} placeholder="ex: J'aime partager un repas le premier soir…" />
            </div>
            <div>
              <Label>Expérience collective</Label>
              <Textarea value={form.collective_experience} onChange={(e) => set("collective_experience", e.target.value)} rows={2} placeholder="ex: 5 ans en habitat participatif, fondateur d'un écolieu…" />
            </div>
          </section>

          <section className="rounded-xl border bg-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-serif text-foreground">Langues parlées</h2>
              {fieldOk("languages")}
            </div>
            <div className="flex flex-wrap gap-2">
              {form.languages.map((lang, i) => (
                <span key={i} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs">
                  {lang}
                  <button onClick={() => removeLanguage(i)} className="hover:text-destructive">×</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newLang}
                onChange={(e) => setNewLang(e.target.value)}
                placeholder="Ajouter une langue…"
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addLanguage())}
              />
              <Button type="button" variant="outline" size="sm" onClick={addLanguage}>+</Button>
            </div>
          </section>

          {/* ─── Préférences de lieux ─── */}
          <section className="rounded-xl border bg-card p-5 space-y-5">
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h2 className="text-base font-serif text-foreground">Mes préférences de lieux</h2>
                <p className="text-xs text-muted-foreground">Aidez-nous à vous proposer des habitats qui vous correspondent vraiment.</p>
              </div>
            </div>

            <div>
              <Label className="mb-2 block">Types d'habitat qui vous attirent</Label>
              <div className="grid grid-cols-2 gap-2">
                {HABITAT_TYPE_OPTIONS.map((t) => {
                  const id = `pref-type-${t}`;
                  const checked = prefForm.preferred_habitat_types.includes(t);
                  return (
                    <label key={t} htmlFor={id} className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted/50 cursor-pointer">
                      <Checkbox id={id} checked={checked} onCheckedChange={() => togglePref("preferred_habitat_types", t)} />
                      <span className="select-none">{t}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="block">Valeurs qui vous parlent</Label>
                {fieldOk("values")}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {VALUE_TAGS.map((v) => {
                  const id = `pref-val-${v}`;
                  const checked = prefForm.preferred_values.includes(v);
                  return (
                    <label key={v} htmlFor={id} className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted/50 cursor-pointer">
                      <Checkbox id={id} checked={checked} onCheckedChange={() => togglePref("preferred_values", v)} />
                      <span className="select-none">{v}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {regionOptions && regionOptions.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="block">Régions préférées</Label>
                  {fieldOk("regions")}
                </div>
                <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                  {regionOptions.map((r) => {
                    const id = `pref-region-${r}`;
                    const checked = prefForm.preferred_regions.includes(r);
                    return (
                      <label key={r} htmlFor={id} className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted/50 cursor-pointer">
                        <Checkbox id={id} checked={checked} onCheckedChange={() => togglePref("preferred_regions", r)} />
                        <span className="select-none truncate">{r}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            <div>
              <Label className="mb-2 block">Durée de séjour idéale</Label>
              <div className="flex flex-wrap gap-2">
                {STAY_DURATION_OPTIONS.map((o) => {
                  const active = prefForm.desired_stay_duration === o.value;
                  return (
                    <button
                      key={o.value}
                      type="button"
                      onClick={() => setPrefForm((f) => ({ ...f, desired_stay_duration: active ? "" : o.value }))}
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                        active
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background text-foreground border-border hover:border-primary/40"
                      }`}
                    >
                      {o.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* ─── Préférences email ─── */}
          <section className="rounded-xl border bg-card p-5 space-y-4">
            <div>
              <h2 className="text-base font-serif text-foreground">Email & notifications</h2>
              <p className="text-xs text-muted-foreground">Choisissez la fréquence du digest hebdomadaire.</p>
            </div>

            <label className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-muted/40 cursor-pointer">
              <Checkbox
                checked={emailSettings.weekly_digest}
                onCheckedChange={(c) => setEmailSettings((s) => ({ ...s, weekly_digest: !!c }))}
              />
              <span className="text-sm">Recevoir le digest hebdomadaire</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="mb-1.5 block text-xs">Fréquence</Label>
                <select
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  value={emailSettings.frequency}
                  onChange={(e) =>
                    setEmailSettings((s) => ({ ...s, frequency: e.target.value as any }))
                  }
                  disabled={!emailSettings.weekly_digest}
                >
                  <option value="weekly">Hebdomadaire</option>
                  <option value="biweekly">Toutes les 2 semaines</option>
                  <option value="monthly">Mensuel</option>
                  <option value="never">Jamais</option>
                </select>
              </div>
              <div>
                <Label className="mb-1.5 block text-xs">Jour d'envoi</Label>
                <select
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  value={emailSettings.preferred_day}
                  onChange={(e) =>
                    setEmailSettings((s) => ({ ...s, preferred_day: Number(e.target.value) }))
                  }
                  disabled={!emailSettings.weekly_digest}
                >
                  <option value={1}>Lundi</option>
                  <option value={2}>Mardi</option>
                  <option value={3}>Mercredi</option>
                  <option value={4}>Jeudi</option>
                  <option value={5}>Vendredi</option>
                  <option value={6}>Samedi</option>
                  <option value={0}>Dimanche</option>
                </select>
              </div>
            </div>
          </section>


          <Button onClick={handleSave} className="w-full" size="lg" disabled={updateProfile.isPending || upsertPrefs.isPending || !form.display_name}>
            {(updateProfile.isPending || upsertPrefs.isPending) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Enregistrer
          </Button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default EditProfile;
