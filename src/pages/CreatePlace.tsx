import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useCreatePlace, useJoinPlace } from "@/hooks/use-places";
import { toast } from "@/hooks/use-toast";
import { HABITAT_TYPES, VALUE_TAGS, VIBE_OPTIONS, HOSPITALITY_TYPES, HOSPITALITY_MANAGED_BY, PLACE_OFFERINGS } from "@/data/demo";
import PhotoManager from "@/components/PhotoManager";
import PlaceLivePreview from "@/components/PlaceLivePreview";
import DuplicatePlaceWarning from "@/components/DuplicatePlaceWarning";

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

const CreatePlace = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const createPlace = useCreatePlace();
  const joinPlace = useJoinPlace();

  const [form, setForm] = useState({
    name: "",
    type: "",
    region: "",
    city: "",
    country: "France",
    description: "",
    short_desc: "",
    governance: "",
    ambiance: "",
    inhabitants: 0,
    year_founded: undefined as number | undefined,
    environment_type: "",
    hosting_status: "no",
    hosting_style: "",
    hospitality_manager: "",
    hospitality_managed_by: "",
    hospitality_types: [] as string[],
    offerings: [] as string[],
    vibe: "",
    children_friendly: false,
    family_friendly: false,
    solo_friendly: false,
    animals_allowed: false,
    accessible: false,
    participatory_stay: false,
    published: true,
    is_visible: true,
    shared_amenities: [] as string[],
    values: [] as string[],
    image: "",
    images: [] as string[],
  });
  const [loading, setLoading] = useState(false);
  const [newAmenity, setNewAmenity] = useState("");
  const [tempPlaceId] = useState(() => crypto.randomUUID());
  const [dupBlocking, setDupBlocking] = useState(false);

  const set = (key: string, value: any) => setForm((f) => ({ ...f, [key]: value }));

  const toggleValue = (tag: string) => {
    setForm((f) => ({
      ...f,
      values: f.values.includes(tag) ? f.values.filter((v) => v !== tag) : [...f.values, tag],
    }));
  };

  const toggleArrayItem = (key: "hospitality_types" | "offerings", item: string) => {
    setForm((f) => ({
      ...f,
      [key]: f[key].includes(item) ? f[key].filter((v) => v !== item) : [...f[key], item],
    }));
  };

  const addAmenity = () => {
    if (!newAmenity.trim()) return;
    setForm((f) => ({ ...f, shared_amenities: [...f.shared_amenities, newAmenity.trim()] }));
    setNewAmenity("");
  };

  const removeAmenity = (index: number) => {
    setForm((f) => ({ ...f, shared_amenities: f.shared_amenities.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return navigate("/auth");
    if (dupBlocking) {
      toast({
        title: "Un lieu similaire existe peut-être",
        description: "Vérifiez les suggestions ci-dessus, puis confirmez qu'il s'agit bien d'un nouveau lieu.",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);

    try {
      const place = await createPlace.mutateAsync({
        name: form.name,
        type: form.type,
        region: form.region,
        city: form.city,
        country: form.country,
        description: form.description,
        short_desc: form.short_desc,
        governance: form.governance,
        ambiance: form.ambiance,
        inhabitants: form.inhabitants,
        year_founded: form.year_founded || null,
        environment_type: form.environment_type || null,
        hosting_status: form.hosting_status,
        hosting_style: form.hosting_style || null,
        hospitality_manager: form.hospitality_manager || null,
        hospitality_managed_by: form.hospitality_managed_by || null,
        hospitality_types: form.hospitality_types,
        offerings: form.offerings,
        vibe: form.vibe || null,
        children_friendly: form.children_friendly,
        family_friendly: form.family_friendly,
        solo_friendly: form.solo_friendly,
        animals_allowed: form.animals_allowed,
        accessible: form.accessible,
        participatory_stay: form.participatory_stay,
        published: form.published,
        is_visible: form.is_visible,
        shared_amenities: form.shared_amenities,
        values: form.values,
        image: form.images[0] || "",
        images: form.images,
        created_by: user.id,
      } as any);

      await joinPlace.mutateAsync({
        place_id: place.id,
        user_id: user.id,
        relationship_to_place: "Co-fondateur·ice",
      });

      toast({ title: "Lieu créé !", description: `${form.name} a été ajouté à Casa Minga.` });
      navigate("/dashboard");
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container max-w-6xl py-8 px-4">
        <button onClick={() => navigate(-1)} className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Retour
        </button>

        <h1 className="text-2xl font-serif text-foreground mb-1">Créer un lieu collectif</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Décrivez votre habitat partagé pour le faire découvrir à la communauté Casa Minga. Plus votre fiche est complète, plus elle inspirera confiance.
        </p>

        <div className="grid lg:grid-cols-[1fr_360px] gap-8 items-start">
          <form onSubmit={handleSubmit} className="space-y-6 min-w-0">

          {/* ─── 1. BASIC IDENTITY ─── */}
          <section className="rounded-xl border bg-card p-5 space-y-4">
            <div>
              <h2 className="text-base font-serif text-foreground">1. Identité de base</h2>
              <p className="text-xs text-muted-foreground">Nom, type, localisation et présentation visuelle.</p>
            </div>

            <div>
              <Label htmlFor="name">Nom du lieu *</Label>
              <Input id="name" placeholder="ex: Le Lavoir du Buisson Saint-Louis" value={form.name} onChange={(e) => set("name", e.target.value)} required />
            </div>

            <DuplicatePlaceWarning name={form.name} city={form.city} onBlockingChange={setDupBlocking} />

            <div>
              <Label>Type de lieu *</Label>
              <Select value={form.type} onValueChange={(v) => set("type", v)} required>
                <SelectTrigger><SelectValue placeholder="Choisir un type" /></SelectTrigger>
                <SelectContent>
                  {HABITAT_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Ville</Label>
                <Input value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="ex: Montreuil" />
              </div>
              <div>
                <Label>Région</Label>
                <Input value={form.region} onChange={(e) => set("region", e.target.value)} placeholder="ex: Île-de-France" />
              </div>
            </div>
            <div>
              <Label>Pays</Label>
              <Input value={form.country} onChange={(e) => set("country", e.target.value)} placeholder="ex: France" />
            </div>

            <div>
              <Label>Description courte</Label>
              <Input value={form.short_desc} onChange={(e) => set("short_desc", e.target.value)} placeholder="Une phrase qui résume l'esprit de votre lieu" maxLength={160} />
              <p className="text-xs text-muted-foreground mt-1">{form.short_desc.length}/160 caractères</p>
            </div>

            <div>
              <Label>Description complète</Label>
              <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={5} placeholder="Racontez l'histoire de votre lieu, son projet, ce qui le rend unique…" />
            </div>

            <div>
              <Label>Photos (la première sert de couverture)</Label>
              <PhotoManager
                photos={form.images}
                onChange={(photos) => {
                  set("images", photos);
                  set("image", photos[0] || "");
                }}
                folder={`places/${tempPlaceId}`}
              />
            </div>
          </section>

          {/* ─── 2. LIFE IN THE PLACE ─── */}
          <section className="rounded-xl border bg-card p-5 space-y-4">
            <div>
              <h2 className="text-base font-serif text-foreground">2. Vie dans le lieu</h2>
              <p className="text-xs text-muted-foreground">Habitant·es, gouvernance, valeurs et atmosphère.</p>
            </div>

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
              <Input value={form.governance} onChange={(e) => set("governance", e.target.value)} placeholder="ex: Sociocratie, consensus, assemblée…" />
            </div>

            <div>
              <Label>Ambiance & atmosphère</Label>
              <Textarea value={form.ambiance} onChange={(e) => set("ambiance", e.target.value)} rows={2} placeholder="Calme et contemplatif, festif et créatif, familial et bienveillant…" />
            </div>

            <div>
              <Label>Valeurs du collectif</Label>
              <div className="flex flex-wrap gap-2 mt-1.5">
                {VALUE_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleValue(tag)}
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
            </div>

            <div>
              <Label>Ce que le lieu propose</Label>
              <div className="flex flex-wrap gap-2 mt-1.5">
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
            </div>
          </section>

          {/* ─── 3. PRACTICAL CHARACTERISTICS ─── */}
          <section className="rounded-xl border bg-card p-5 space-y-4">
            <div>
              <h2 className="text-base font-serif text-foreground">3. Caractéristiques pratiques</h2>
              <p className="text-xs text-muted-foreground">Environnement, espaces partagés et compatibilité.</p>
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
              <Label>Ambiance générale</Label>
              <Select value={form.vibe} onValueChange={(v) => set("vibe", v)}>
                <SelectTrigger><SelectValue placeholder="Calme, équilibrée ou festive ?" /></SelectTrigger>
                <SelectContent>
                  {VIBE_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Espaces partagés</Label>
              <p className="text-xs text-muted-foreground mb-1.5">Cuisine commune, jardin, atelier, salle polyvalente…</p>
              <div className="flex flex-wrap gap-2 mb-2">
                {form.shared_amenities.map((a, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs">
                    {a}
                    <button type="button" onClick={() => removeAmenity(i)} className="hover:text-destructive">×</button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newAmenity}
                  onChange={(e) => setNewAmenity(e.target.value)}
                  placeholder="Ajouter un espace…"
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addAmenity())}
                />
                <Button type="button" variant="outline" size="sm" onClick={addAmenity}>+</Button>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              {[
                { key: "children_friendly", label: "Enfants bienvenus" },
                { key: "family_friendly", label: "Adapté aux familles" },
                { key: "solo_friendly", label: "Adapté aux voyageurs solo" },
                { key: "animals_allowed", label: "Animaux acceptés" },
                { key: "accessible", label: "Accessible PMR" },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between">
                  <Label className="text-sm">{label}</Label>
                  <Switch checked={(form as any)[key] ?? false} onCheckedChange={(v) => set(key, v)} />
                </div>
              ))}
            </div>
          </section>

          {/* ─── 4. HOSPITALITY ─── */}
          <section className="rounded-xl border bg-card p-5 space-y-4">
            <div>
              <h2 className="text-base font-serif text-foreground">4. Hospitalité</h2>
              <p className="text-xs text-muted-foreground">Comment le lieu accueille les voyageur·ses.</p>
            </div>

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
              <div className="flex flex-wrap gap-2 mt-1.5">
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

            <div className="flex items-center justify-between pt-2">
              <Label className="text-sm">Séjour participatif possible</Label>
              <Switch checked={form.participatory_stay} onCheckedChange={(v) => set("participatory_stay", v)} />
            </div>
          </section>

          {/* ─── 5. PUBLICATION STATUS ─── */}
          <section className="rounded-xl border bg-card p-5 space-y-4">
            <div>
              <h2 className="text-base font-serif text-foreground">5. Statut de publication</h2>
              <p className="text-xs text-muted-foreground">Choisissez la visibilité de la fiche.</p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm">Publier le lieu</Label>
                <p className="text-xs text-muted-foreground">Si désactivé, la fiche sera en brouillon.</p>
              </div>
              <Switch checked={form.published} onCheckedChange={(v) => set("published", v)} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm">Visible publiquement</Label>
                <p className="text-xs text-muted-foreground">La fiche apparaît dans les résultats de recherche.</p>
              </div>
              <Switch checked={form.is_visible} onCheckedChange={(v) => set("is_visible", v)} />
            </div>
          </section>

          <Button type="submit" className="w-full" size="lg" disabled={loading || !form.name || !form.type || dupBlocking}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Créer le lieu
          </Button>
          {dupBlocking && (
            <p className="text-xs text-center text-soleil-foreground/80 -mt-3">
              Confirmez d'abord qu'il ne s'agit pas d'un lieu déjà listé (encadré orange ci-dessus).
            </p>
          )}
        </form>

          <aside className="lg:sticky lg:top-20">
            <PlaceLivePreview data={form} />
          </aside>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CreatePlace;
