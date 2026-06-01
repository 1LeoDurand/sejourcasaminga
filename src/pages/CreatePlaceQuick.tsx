import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ArrowLeft, Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useCreatePlace, useJoinPlace } from "@/hooks/use-places";
import { toast } from "@/hooks/use-toast";
import { HABITAT_TYPES } from "@/data/demo";
import PhotoManager from "@/components/PhotoManager";
import DuplicatePlaceWarning from "@/components/DuplicatePlaceWarning";
import SEO from "@/components/SEO";

const CreatePlaceQuick = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { user } = useAuth();
  const createPlace = useCreatePlace();
  const joinPlace = useJoinPlace();

  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [tempPlaceId] = useState(() => crypto.randomUUID());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return navigate("/auth");
    setLoading(true);
    try {
      const place = await createPlace.mutateAsync({
        name,
        type,
        city,
        region,
        short_desc: shortDesc,
        image: images[0] || "",
        images,
        created_by: user.id,
        published: true,
        is_visible: true,
      } as any);

      await joinPlace.mutateAsync({
        place_id: place.id,
        user_id: user.id,
        relationship_to_place: "Co-fondateur·ice",
      });

      toast({
        title: "Lieu créé !",
        description: `${name} a été ajouté. Complétez son profil quand vous voulez.`,
      });
      navigate(`/dashboard?completePlace=${place.id}&proposeStay=${place.id}`);
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const isFromOnboarding = params.get("from") === "onboarding";

  return (
    <div className="min-h-screen">
      <SEO title="Créer ma fiche lieu — étape rapide" description="Créez votre fiche lieu collectif en moins de 2 minutes. Complétez les détails plus tard." />
      <Navbar />
      <div className="container max-w-2xl py-8 px-4">
        <button
          onClick={() => (isFromOnboarding ? navigate("/onboarding") : navigate(-1))}
          className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Retour
        </button>

        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-3">
            <Sparkles className="h-3 w-3" /> Étape 1 sur 2 — Création rapide
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif text-foreground mb-2">
            Créez votre fiche lieu
          </h1>
          <p className="text-sm text-muted-foreground">
            Quelques infos suffisent pour démarrer. Vous pourrez compléter le profil (gouvernance, valeurs, accueil…) plus tard depuis le tableau de bord.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="rounded-2xl border bg-card p-5 space-y-4">
            <div>
              <Label htmlFor="name">Nom du lieu *</Label>
              <Input
                id="name"
                placeholder="ex: Le Lavoir du Buisson"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
              />
            </div>

            <DuplicatePlaceWarning name={name} city={city} />

            <div>
              <Label>Type de lieu *</Label>
              <Select value={type} onValueChange={setType} required>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un type" />
                </SelectTrigger>
                <SelectContent>
                  {HABITAT_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="city">Ville *</Label>
                <Input
                  id="city"
                  placeholder="ex: Montreuil"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="region">Région</Label>
                <Input
                  id="region"
                  placeholder="ex: Île-de-France"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="short_desc">Description courte *</Label>
              <Textarea
                id="short_desc"
                placeholder="Une phrase qui résume l'esprit de votre lieu"
                value={shortDesc}
                onChange={(e) => setShortDesc(e.target.value)}
                rows={2}
                maxLength={160}
                required
              />
              <p className="text-xs text-muted-foreground mt-1">{shortDesc.length}/160</p>
            </div>

            <div>
              <Label>Photo principale *</Label>
              <p className="text-xs text-muted-foreground mb-2">
                Au moins une photo qui représente votre lieu.
              </p>
              <PhotoManager
                photos={images}
                onChange={setImages}
                folder={`places/${tempPlaceId}`}
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={loading || !name || !type || !city || !shortDesc || images.length === 0}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Créer la fiche
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Étape 2 (optionnelle) : valeurs, gouvernance, accueil… — depuis le tableau de bord.
          </p>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default CreatePlaceQuick;
