import { useState, useEffect } from "react";
import SEO from "@/components/SEO";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ArrowLeft, Save } from "lucide-react";
import PhotoManager from "@/components/PhotoManager";
import VideoEmbedField from "@/components/VideoEmbedField";
import AttractionLevelField from "@/components/AttractionLevelField";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { usePlace } from "@/hooks/use-places";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { HABITAT_TYPES, VALUE_TAGS, VIBE_OPTIONS, HOSPITALITY_TYPES, HOSPITALITY_MANAGED_BY, PLACE_OFFERINGS } from "@/data/demo";
import { useQueryClient } from "@tanstack/react-query";

const ENVIRONMENT_TYPES = [
  { value: "urban", label: "Urbain" },
  { value: "peri-urban", label: "Péri-urbain" },
  { value: "rural", label: "Rural" },
];

const HOSTING_STATUS_OPTIONS = [
  { value: "yes", label: "Oui, nous accueillons" },
  { value: "no", label: "Non, pas pour l'instant" },
  { value: "soon", label: "Bientôt" },
];

const EditPlace = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: place, isLoading } = usePlace(id);
  const qc = useQueryClient();

  const [form, setForm] = useState({
    name: "",
    type: "",
    region: "",
    city: "",
    country: "France",
    description: "",
    short_desc: "",
    governance: "",
    inhabitants: 0,
    year_founded: undefined as number | undefined,
    environment_type: "",
    attraction_level: "standard",
    hosting_status: "no",
    hosting_style: "",
    hospitality_manager: "",
    website: "",
    diet: "",
    ambiance: "",
    address_text: "",
    published: true,
    accessible: false,
    animals_allowed: false,
    children_friendly: false,
    family_friendly: false,
    solo_friendly: false,
    participatory_stay: false,
    vibe: "",
    hospitality_types: [] as string[],
    hospitality_managed_by: "",
    offerings: [] as string[],
    shared_amenities: [] as string[],
    values: [] as string[],
    tags: [] as string[],
    house_rules: [] as string[],
    image: "",
    images: [] as string[],
    video_url: "",
    contact_enabled: true,
    is_visible: true,
  });
  const [saving, setSaving] = useState(false);
  const [newAmenity, setNewAmenity] = useState("");
  const [newRule, setNewRule] = useState("");

  useEffect(() => {
    if (place) {
      const p = place as any;
      setForm({
        name: place.name || "",
        type: place.type || "",
        region: place.region || "",
        city: place.city || "",
        country: place.country || "France",
        description: place.description || "",
        short_desc: place.short_desc || "",
        governance: place.governance || "",
        inhabitants: place.inhabitants || 0,
        year_founded: p.year_founded || undefined,
        environment_type: p.environment_type || "",
        attraction_level: p.attraction_level || "standard",
        hosting_status: p.hosting_status || "no",
        hosting_style: p.hosting_style || "",
        hospitality_manager: p.hospitality_manager || "",
        website: place.website || "",
        diet: place.diet || "",
        ambiance: place.ambiance || "",
        address_text: place.address_text || "",
        published: place.published ?? true,
        accessible: place.accessible ?? false,
        animals_allowed: place.animals_allowed ?? false,
        children_friendly: place.children_friendly ?? false,
        family_friendly: p.family_friendly ?? false,
        solo_friendly: p.solo_friendly ?? false,
        participatory_stay: p.participatory_stay ?? false,
        vibe: p.vibe || "",
        hospitality_types: p.hospitality_types || [],
        hospitality_managed_by: p.hospitality_managed_by || "",
        offerings: p.offerings || [],
        shared_amenities: place.shared_amenities || [],
        values: place.values || [],
        tags: place.tags || [],
        house_rules: place.house_rules || [],
        image: place.image || "",
        images: place.images || [],
        video_url: place.video_url || "",
        contact_enabled: place.contact_enabled ?? true,
        is_visible: place.is_visible ?? true,
      });
    }
  }, [place]);

  const isOwner = place?.created_by === user?.id;
  const isManager = (place as any)?.claimed_by_user_id === user?.id;
  if (!isLoading && place && !isOwner && !isManager) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container max-w-xl py-16 px-4 text-center">
          <h1 className="text-xl text-foreground mb-2">Accès refusé</h1>
          <p className="text-muted-foreground">Vous ne pouvez modifier que vos propres lieux.</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>Retour</Button>
        </div>
        <Footer />
      </div>
    );
  }

  const set = (key: string, value: any) => setForm((f) => ({ ...f, [key]: value }));

  const toggleArrayItem = (key: "values" | "tags" | "hospitality_types" | "offerings", item: string) => {
    setForm((f) => ({
      ...f,
      [key]: f[key].includes(item) ? f[key].filter((v) => v !== item) : [...f[key], item],
    }));
  };

  const addToArray = (key: "shared_amenities" | "house_rules", value: string, clear: () => void) => {
    if (!value.trim()) return;
    setForm((f) => ({ ...f, [key]: [...f[key], value.trim()] }));
    clear();
  };

  const removeFromArray = (key: "shared_amenities" | "house_rules", index: number) => {
    setForm((f) => ({ ...f, [key]: f[key].filter((_, i) => i !== index) }));
  };

  const handleSave = async () => {
    if (!id) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("places").update(form as any).eq("id", id);
      if (error) throw error;
      qc.invalidateQueries({ queryKey: ["place", id] });
      qc.invalidateQueries({ queryKey: ["my-places"] });
      toast({ title: "Lieu mis à jour ✓" });
      navigate(`/habitat/${id}`);
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Modifier ma fiche lieu | Casa Minga" noindex />
      <Navbar />
      <div className="container max-w-2xl py-8 px-4">
        <button onClick={() => navigate(-1)} className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Retour
        </button>

        <h1 className="text-2xl font-serif text-foreground mb-1">Modifier le lieu</h1>
        <p className="text-sm text-muted-foreground mb-8">Mettez à jour les informations de votre lieu collectif.</p>

        <div className="space-y-6">
          {/* ─── Identité ─── */}
          <section className="rounded-xl border bg-card p-5 space-y-4">
            <h2 className="text-base font-serif text-foreground">🏠 Identité du lieu</h2>
            <div>
              <Label>Nom du lieu *</Label>
              <Input value={form.name} onChange={(e) => set("name", e.target.value)} />
            </div>
            <div>
              <Label>Type de lieu *</Label>
              <Select value={form.type} onValueChange={(v) => set("type", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {HABITAT_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Description courte</Label>
              <Input value={form.short_desc} onChange={(e) => set("short_desc", e.target.value)} placeholder="Une phrase qui résume l'esprit de votre lieu" maxLength={160} />
              <p className="text-xs text-muted-foreground mt-1">{form.short_desc.length}/160 caractères</p>
            </div>
            <div>
              <Label>Description complète</Label>
              <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={5} />
            </div>
          </section>

          {/* ─── Photos ─── */}
          <section className="rounded-xl border bg-card p-5 space-y-4">
            <h2 className="text-base font-serif text-foreground">📷 Photos</h2>
            <p className="text-xs text-muted-foreground -mt-2">La première photo sera utilisée comme couverture.</p>
            <PhotoManager
              photos={form.images}
              onChange={(photos) => {
                set("images", photos);
                set("image", photos[0] || "");
              }}
              folder={`places/${id}`}
              maxPhotos={15}
            />
          </section>

          {/* ─── Video ─── */}
          <section className="rounded-xl border bg-card p-5 space-y-4">
            <h2 className="text-base font-serif text-foreground">🎬 Vidéo</h2>
            <VideoEmbedField value={form.video_url} onChange={(v) => set("video_url", v)} />
          </section>

          {/* ─── Localisation ─── */}
          <section className="rounded-xl border bg-card p-5 space-y-4">
            <h2 className="text-base font-serif text-foreground">📍 Localisation</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Ville</Label>
                <Input value={form.city} onChange={(e) => set("city", e.target.value)} />
              </div>
              <div>
                <Label>Région</Label>
                <Input value={form.region} onChange={(e) => set("region", e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Pays</Label>
              <Input value={form.country} onChange={(e) => set("country", e.target.value)} />
            </div>
            <div>
              <Label>Environnement</Label>
              <Select value={form.environment_type} onValueChange={(v) => set("environment_type", v)}>
                <SelectTrigger><SelectValue placeholder="Urbain, péri-urbain ou rural" /></SelectTrigger>
                <SelectContent>
                  {ENVIRONMENT_TYPES.map((e) => <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Adresse (optionnel)</Label>
              <Input value={form.address_text} onChange={(e) => set("address_text", e.target.value)} placeholder="Visible uniquement après confirmation" />
            </div>
            <AttractionLevelField value={form.attraction_level} onChange={(v) => set("attraction_level", v)} />
          </section>

          {/* ─── Vie collective ─── */}
          <section className="rounded-xl border bg-card p-5 space-y-4">
            <h2 className="text-base font-serif text-foreground">👥 Vie collective</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nombre d'habitant·es</Label>
                <Input type="number" min={0} value={form.inhabitants} onChange={(e) => set("inhabitants", parseInt(e.target.value) || 0)} />
              </div>
              <div>
                <Label>Année de création</Label>
                <Input type="number" min={1900} max={new Date().getFullYear()} value={form.year_founded || ""} onChange={(e) => set("year_founded", parseInt(e.target.value) || undefined)} placeholder="ex: 2018" />
              </div>
            </div>
            <div>
              <Label>Gouvernance</Label>
              <Input value={form.governance} onChange={(e) => set("governance", e.target.value)} placeholder="ex: Sociocratie, consensus…" />
            </div>
            <div>
              <Label>Ambiance & atmosphère</Label>
              <Textarea value={form.ambiance} onChange={(e) => set("ambiance", e.target.value)} rows={2} placeholder="Décrivez l'atmosphère du lieu…" />
            </div>
            <div>
              <Label>Alimentation</Label>
              <Input value={form.diet} onChange={(e) => set("diet", e.target.value)} placeholder="ex: Végétarien, omnivore, local…" />
            </div>
            <div>
              <Label>Site web</Label>
              <Input value={form.website} onChange={(e) => set("website", e.target.value)} placeholder="https://…" />
            </div>
          </section>

          {/* ─── Valeurs ─── */}
          <section className="rounded-xl border bg-card p-5 space-y-4">
            <h2 className="text-base font-serif text-foreground">💚 Valeurs</h2>
            <div className="flex flex-wrap gap-2">
              {VALUE_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleArrayItem("values", tag)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    form.values.includes(tag)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted text-muted-foreground border-border hover:border-primary/40"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </section>

          {/* ─── Espaces partagés ─── */}
          <section className="rounded-xl border bg-card p-5 space-y-4">
            <h2 className="text-base font-serif text-foreground">🏡 Espaces partagés</h2>
            <div className="flex flex-wrap gap-2">
              {form.shared_amenities.map((a, i) => (
                <span key={i} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs">
                  {a}
                  <button onClick={() => removeFromArray("shared_amenities", i)} className="hover:text-destructive">×</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newAmenity}
                onChange={(e) => setNewAmenity(e.target.value)}
                placeholder="Ajouter un espace…"
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addToArray("shared_amenities", newAmenity, () => setNewAmenity("")))}
              />
              <Button type="button" variant="outline" size="sm" onClick={() => addToArray("shared_amenities", newAmenity, () => setNewAmenity(""))}>+</Button>
            </div>
          </section>

          {/* ─── Règles de vie ─── */}
          <section className="rounded-xl border bg-card p-5 space-y-4">
            <h2 className="text-base font-serif text-foreground">📋 Règles de vie</h2>
            <div className="space-y-1">
              {form.house_rules.map((r, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-foreground">
                  <span className="flex-1">• {r}</span>
                  <button onClick={() => removeFromArray("house_rules", i)} className="text-muted-foreground hover:text-destructive text-xs">×</button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newRule}
                onChange={(e) => setNewRule(e.target.value)}
                placeholder="Ajouter une règle…"
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addToArray("house_rules", newRule, () => setNewRule("")))}
              />
              <Button type="button" variant="outline" size="sm" onClick={() => addToArray("house_rules", newRule, () => setNewRule(""))}>+</Button>
            </div>
          </section>

          {/* ─── Accueil & hospitalité ─── */}
          <section className="rounded-xl border bg-card p-5 space-y-4">
            <h2 className="text-base font-serif text-foreground">🤝 Accueil & hospitalité</h2>
            <div>
              <Label>Accueille des séjours ?</Label>
              <Select value={form.hosting_status} onValueChange={(v) => set("hosting_status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {HOSTING_STATUS_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Types d'accueil possibles</Label>
              <p className="text-xs text-muted-foreground mb-2">Sélectionnez ce qui peut être proposé.</p>
              <div className="flex flex-wrap gap-2">
                {HOSPITALITY_TYPES.map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => toggleArrayItem("hospitality_types", o.value)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                      form.hospitality_types.includes(o.value)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted text-muted-foreground border-border hover:border-primary/40"
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>Style d'accueil</Label>
              <Input value={form.hosting_style} onChange={(e) => set("hosting_style", e.target.value)} placeholder="ex: Accueil chaleureux, autonomie, immersion totale…" />
            </div>
            <div>
              <Label>Qui gère l'hospitalité ?</Label>
              <Select value={form.hospitality_managed_by} onValueChange={(v) => set("hospitality_managed_by", v)}>
                <SelectTrigger><SelectValue placeholder="Choisir…" /></SelectTrigger>
                <SelectContent>
                  {HOSPITALITY_MANAGED_BY.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Référent·e (optionnel)</Label>
              <Input value={form.hospitality_manager} onChange={(e) => set("hospitality_manager", e.target.value)} placeholder="ex: Léa, Marc & Sophie…" />
            </div>
          </section>

          {/* ─── Ce que le lieu propose ─── */}
          <section className="rounded-xl border bg-card p-5 space-y-4">
            <h2 className="text-base font-serif text-foreground">✨ Ce que le lieu propose</h2>
            <p className="text-xs text-muted-foreground -mt-2">Aperçu général de ce qui peut se passer dans votre lieu.</p>
            <div className="flex flex-wrap gap-2">
              {PLACE_OFFERINGS.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => toggleArrayItem("offerings", o.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    form.offerings.includes(o.value)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted text-muted-foreground border-border hover:border-primary/40"
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </section>

          {/* ─── Caractéristiques ─── */}
          <section className="rounded-xl border bg-card p-5 space-y-4">
            <h2 className="text-base font-serif text-foreground">✅ Caractéristiques pratiques</h2>
            <div>
              <Label>Ambiance générale</Label>
              <Select value={form.vibe} onValueChange={(v) => set("vibe", v)}>
                <SelectTrigger><SelectValue placeholder="Calme, équilibrée ou festive ?" /></SelectTrigger>
                <SelectContent>
                  {VIBE_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {[
              { key: "children_friendly", label: "Enfants bienvenus" },
              { key: "family_friendly", label: "Adapté aux familles" },
              { key: "solo_friendly", label: "Adapté aux voyageurs solo" },
              { key: "animals_allowed", label: "Animaux acceptés" },
              { key: "accessible", label: "Accessible PMR" },
              { key: "participatory_stay", label: "Séjour participatif possible" },
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between">
                <Label className="text-sm">{label}</Label>
                <Switch checked={(form as any)[key] ?? false} onCheckedChange={(v) => set(key, v)} />
              </div>
            ))}
          </section>

          {/* ─── Publication ─── */}
          <section className="rounded-xl border bg-card p-5 space-y-4">
            <h2 className="text-base font-serif text-foreground">📢 Publication</h2>
            {[
              { key: "published", label: "Publié (visible par tous)", desc: "Si désactivé, la fiche sera en brouillon." },
              { key: "is_visible", label: "Visible publiquement", desc: "La fiche apparaît dans les résultats." },
              { key: "contact_enabled", label: "Autoriser les demandes de contact", desc: "" },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <Label className="text-sm">{label}</Label>
                  {desc && <p className="text-xs text-muted-foreground">{desc}</p>}
                </div>
                <Switch checked={(form as any)[key] ?? true} onCheckedChange={(v) => set(key, v)} />
              </div>
            ))}
          </section>

          <Button onClick={handleSave} className="w-full" size="lg" disabled={saving || !form.name}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Enregistrer les modifications
          </Button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default EditPlace;
