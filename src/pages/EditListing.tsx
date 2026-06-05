import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ArrowLeft, Save, Plus, X } from "lucide-react";
import PhotoManager from "@/components/PhotoManager";
import VideoEmbedField from "@/components/VideoEmbedField";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useListing } from "@/hooks/use-listings";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { LISTING_TYPE_LABELS, RELATIONSHIP_LABELS } from "@/data/demo";
import { useQueryClient } from "@tanstack/react-query";
import type { Database } from "@/integrations/supabase/types";

type ListingType = Database["public"]["Enums"]["listing_type"];
type CollectiveRelationship = Database["public"]["Enums"]["collective_relationship"];

const EditListing = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: listing, isLoading } = useListing(id);
  const qc = useQueryClient();

  const [form, setForm] = useState({
    title: "",
    description: "",
    listing_type: "private_room" as ListingType,
    collective_relationship: "personal" as CollectiveRelationship,
    capacity: 2,
    autonomy_level: "",
    collective_access: "",
    interaction_level: "",
    conditions: "",
    availability_notes: "",
    published: true,
    available: true,
    image: "",
    images: [] as string[],
    video_url: "",
    highlights: [] as string[],
    practical_rules: [] as string[],
    faq: [] as { q: string; a: string }[],
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (listing) {
      setForm({
        title: listing.title || "",
        description: listing.description || "",
        listing_type: listing.listing_type,
        collective_relationship: listing.collective_relationship,
        capacity: listing.capacity || 2,
        autonomy_level: listing.autonomy_level || "",
        collective_access: listing.collective_access || "",
        interaction_level: listing.interaction_level || "",
        conditions: listing.conditions || "",
        availability_notes: listing.availability_notes || "",
        published: listing.published ?? true,
        available: listing.available ?? true,
        image: listing.image || "",
        images: listing.images || [],
        video_url: (listing as any).video_url || "",
        highlights: (listing as any).highlights || [],
        practical_rules: listing.practical_rules || [],
        faq: (Array.isArray((listing as any).faq) ? (listing as any).faq : []) as { q: string; a: string }[],
      });
    }
  }, [listing]);

  if (!isLoading && listing && listing.host_id !== user?.id) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container max-w-xl py-16 px-4 text-center">
          <h1 className="text-xl text-foreground mb-2">Accès refusé</h1>
          <p className="text-muted-foreground">Vous ne pouvez modifier que vos propres séjours.</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>Retour</Button>
        </div>
        <Footer />
      </div>
    );
  }

  const set = (key: string, value: any) => setForm((f) => ({ ...f, [key]: value }));

  const handleSave = async () => {
    if (!id) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("listings").update(form).eq("id", id);
      if (error) throw error;
      qc.invalidateQueries({ queryKey: ["listing", id] });
      qc.invalidateQueries({ queryKey: ["my-listings"] });
      toast({ title: "Séjour mis à jour ✓" });
      navigate(`/listing/${id}`);
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

  const LISTING_TYPES = Object.entries(LISTING_TYPE_LABELS) as [ListingType, string][];
  const RELATIONSHIPS = Object.entries(RELATIONSHIP_LABELS) as [CollectiveRelationship, string][];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container max-w-2xl py-8 px-4">
        <button onClick={() => navigate(-1)} className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Retour
        </button>

        <h1 className="text-2xl font-serif text-foreground mb-1">Modifier le séjour</h1>
        <p className="text-sm text-muted-foreground mb-8">Mettez à jour votre offre d'hébergement.</p>

        <div className="space-y-6">
          <section className="rounded-xl border bg-card p-5 space-y-4">
            <h2 className="text-base font-serif text-foreground">Description</h2>
            <div>
              <Label>Titre *</Label>
              <Input value={form.title} onChange={(e) => set("title", e.target.value)} />
            </div>
            <div>
              <Label>Type de séjour</Label>
              <Select value={form.listing_type} onValueChange={(v) => set("listing_type", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {LISTING_TYPES.map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Relation avec le collectif</Label>
              <Select value={form.collective_relationship} onValueChange={(v) => set("collective_relationship", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {RELATIONSHIPS.map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={5} />
            </div>
            <div>
              <Label>Capacité (voyageurs)</Label>
              <Input type="number" min={1} value={form.capacity} onChange={(e) => set("capacity", parseInt(e.target.value) || 1)} />
            </div>
          </section>

          {/* Photos */}
          <section className="rounded-xl border bg-card p-5 space-y-4">
            <h2 className="text-base font-serif text-foreground">Photos</h2>
            <p className="text-xs text-muted-foreground">La première photo sera utilisée comme couverture.</p>
            <PhotoManager
              photos={form.images}
              onChange={(photos) => {
                set("images", photos);
                set("image", photos[0] || "");
              }}
              folder={`listings/${id}`}
            />
          </section>

          {/* Highlights */}
          <section className="rounded-xl border bg-card p-5 space-y-4">
            <div>
              <h2 className="text-base font-serif text-foreground">Points forts</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Ce que les voyageurs vont adorer (max 6)</p>
            </div>
            <div className="space-y-2">
              {form.highlights.map((h, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    value={h}
                    onChange={(e) => {
                      const next = [...form.highlights];
                      next[i] = e.target.value;
                      set("highlights", next);
                    }}
                    placeholder={`Point fort ${i + 1}`}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => set("highlights", form.highlights.filter((_, j) => j !== i))}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {form.highlights.length < 6 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => set("highlights", [...form.highlights, ""])}
                >
                  <Plus className="h-4 w-4 mr-1" /> Ajouter un point fort
                </Button>
              )}
            </div>
          </section>

          {/* House rules */}
          <section className="rounded-xl border bg-card p-5 space-y-4">
            <div>
              <h2 className="text-base font-serif text-foreground">Règles de la maison</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Règles pratiques pour les voyageurs</p>
            </div>
            <div className="space-y-2">
              {form.practical_rules.map((r, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    value={r}
                    onChange={(e) => {
                      const next = [...form.practical_rules];
                      next[i] = e.target.value;
                      set("practical_rules", next);
                    }}
                    placeholder={`ex: Animaux bienvenus`}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => set("practical_rules", form.practical_rules.filter((_, j) => j !== i))}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => set("practical_rules", [...form.practical_rules, ""])}
              >
                <Plus className="h-4 w-4 mr-1" /> Ajouter une règle
              </Button>
            </div>
          </section>

          {/* FAQ */}
          <section className="rounded-xl border bg-card p-5 space-y-4">
            <div>
              <h2 className="text-base font-serif text-foreground">Questions fréquentes (FAQ)</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Répondez aux questions que les voyageurs posent souvent</p>
            </div>
            <div className="space-y-4">
              {form.faq.map((item, i) => (
                <div key={i} className="rounded-lg border bg-muted/30 p-3 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <Label className="text-xs">Question {i + 1}</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => set("faq", form.faq.filter((_, j) => j !== i))}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <Input
                    value={item.q}
                    onChange={(e) => {
                      const next = [...form.faq];
                      next[i] = { ...next[i], q: e.target.value };
                      set("faq", next);
                    }}
                    placeholder="ex: Y a-t-il un jardin ?"
                  />
                  <Textarea
                    value={item.a}
                    onChange={(e) => {
                      const next = [...form.faq];
                      next[i] = { ...next[i], a: e.target.value };
                      set("faq", next);
                    }}
                    placeholder="Votre réponse..."
                    rows={2}
                  />
                </div>
              ))}
              {form.faq.length < 8 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => set("faq", [...form.faq, { q: "", a: "" }])}
                >
                  <Plus className="h-4 w-4 mr-1" /> Ajouter une question
                </Button>
              )}
            </div>
          </section>

          {/* Video */}
          <section className="rounded-xl border bg-card p-5 space-y-4">
            <h2 className="text-base font-serif text-foreground">Vidéo</h2>
            <VideoEmbedField value={form.video_url} onChange={(v) => set("video_url", v)} />
          </section>

          <section className="rounded-xl border bg-card p-5 space-y-4">
            <h2 className="text-base font-serif text-foreground">Expérience</h2>
            <div>
              <Label>Niveau d'autonomie</Label>
              <Input value={form.autonomy_level} onChange={(e) => set("autonomy_level", e.target.value)} placeholder="ex: Totalement autonome" />
            </div>
            <div>
              <Label>Accès aux espaces communs</Label>
              <Input value={form.collective_access} onChange={(e) => set("collective_access", e.target.value)} placeholder="ex: Jardin, cuisine, buanderie" />
            </div>
            <div>
              <Label>Niveau d'interaction</Label>
              <Input value={form.interaction_level} onChange={(e) => set("interaction_level", e.target.value)} placeholder="ex: Optionnel — apéro du vendredi" />
            </div>
            <div>
              <Label>Conditions particulières</Label>
              <Textarea value={form.conditions} onChange={(e) => set("conditions", e.target.value)} rows={2} placeholder="ex: Contribution aux tâches ménagères" />
            </div>
          </section>

          <section className="rounded-xl border bg-card p-5 space-y-4">
            <h2 className="text-base font-serif text-foreground">Disponibilité</h2>
            <div>
              <Label>Notes de disponibilité</Label>
              <Textarea value={form.availability_notes} onChange={(e) => set("availability_notes", e.target.value)} rows={2} />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sm">Actuellement disponible</Label>
              <Switch checked={form.available} onCheckedChange={(v) => set("available", v)} />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sm">Publié (visible par tous)</Label>
              <Switch checked={form.published} onCheckedChange={(v) => set("published", v)} />
            </div>
          </section>

          <Button onClick={handleSave} className="w-full" size="lg" disabled={saving || !form.title}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Enregistrer les modifications
          </Button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default EditListing;
