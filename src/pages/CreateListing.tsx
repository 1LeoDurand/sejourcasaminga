import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useMyPlaces } from "@/hooks/use-places";
import { useCreateListing } from "@/hooks/use-listings";
import { toast } from "@/hooks/use-toast";
import { LISTING_TYPE_LABELS, RELATIONSHIP_LABELS } from "@/data/demo";
import type { Database } from "@/integrations/supabase/types";

type ListingType = Database["public"]["Enums"]["listing_type"];
type CollectiveRelationship = Database["public"]["Enums"]["collective_relationship"];

const LISTING_TYPES = Object.entries(LISTING_TYPE_LABELS) as [ListingType, string][];
const RELATIONSHIPS = Object.entries(RELATIONSHIP_LABELS) as [CollectiveRelationship, string][];

const CreateListing = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { user } = useAuth();
  const { data: myPlaces } = useMyPlaces(user?.id);
  const createListing = useCreateListing();

  const [placeId, setPlaceId] = useState(params.get("place") || "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [listingType, setListingType] = useState<ListingType>("private_room");
  const [relationship, setRelationship] = useState<CollectiveRelationship>("personal");
  const [capacity, setCapacity] = useState("2");
  const [autonomyLevel, setAutonomyLevel] = useState("");
  const [collectiveAccess, setCollectiveAccess] = useState("");
  const [interactionLevel, setInteractionLevel] = useState("");
  const [availabilityNotes, setAvailabilityNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return navigate("/auth");
    setLoading(true);

    try {
      const listing = await createListing.mutateAsync({
        host_id: user.id,
        place_id: placeId,
        title,
        description,
        listing_type: listingType,
        collective_relationship: relationship,
        capacity: parseInt(capacity) || 2,
        autonomy_level: autonomyLevel,
        collective_access: collectiveAccess,
        interaction_level: interactionLevel,
        availability_notes: availabilityNotes,
      });

      toast({ title: "Séjour créé !", description: `"${title}" est maintenant visible.` });
      navigate(`/listing/${listing.id}`);
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (!myPlaces || myPlaces.length === 0) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container max-w-xl py-16 px-4 text-center">
          <h1 className="text-2xl font-serif text-foreground mb-2">Connectez-vous d'abord à un lieu</h1>
          <p className="text-muted-foreground mb-6">
            Sur Casa Minga, un séjour est toujours rattaché à un lieu collectif.
            Rejoignez ou créez un lieu pour pouvoir proposer un séjour.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button onClick={() => navigate("/onboarding")}>Rejoindre ou créer un lieu</Button>
            <Button variant="outline" onClick={() => navigate("/discover")}>Explorer les lieux</Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container max-w-xl py-8 px-4">
        <button onClick={() => navigate(-1)} className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Retour
        </button>

        <h1 className="text-2xl text-foreground mb-1">Proposer un séjour</h1>
        <p className="text-sm text-muted-foreground mb-8">Décrivez ce que vous proposez aux voyageurs.</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label>Lieu *</Label>
            <Select value={placeId} onValueChange={setPlaceId} required>
              <SelectTrigger><SelectValue placeholder="Choisir un lieu" /></SelectTrigger>
              <SelectContent>
                {myPlaces.map((pm: any) => (
                  <SelectItem key={pm.place_id} value={pm.place_id}>{pm.places?.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="title">Titre du séjour *</Label>
            <Input id="title" placeholder="ex: Appartement de Philippe au Lavoir" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div>
            <Label>Type de séjour *</Label>
            <Select value={listingType} onValueChange={(v) => setListingType(v as ListingType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {LISTING_TYPES.map(([key, label]) => <SelectItem key={key} value={key}>{label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Relation avec le collectif</Label>
            <Select value={relationship} onValueChange={(v) => setRelationship(v as CollectiveRelationship)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {RELATIONSHIPS.map(([key, label]) => <SelectItem key={key} value={key}>{label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" placeholder="Décrivez votre espace..." value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="capacity">Capacité (voyageurs)</Label>
              <Input id="capacity" type="number" min="1" value={capacity} onChange={(e) => setCapacity(e.target.value)} />
            </div>
          </div>
          <div>
            <Label htmlFor="autonomy">Niveau d'autonomie</Label>
            <Input id="autonomy" placeholder="ex: Totalement autonome" value={autonomyLevel} onChange={(e) => setAutonomyLevel(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="access">Accès aux espaces communs</Label>
            <Input id="access" placeholder="ex: Jardin, cuisine, buanderie" value={collectiveAccess} onChange={(e) => setCollectiveAccess(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="interaction">Niveau d'interaction</Label>
            <Input id="interaction" placeholder="ex: Optionnel — apéro du vendredi" value={interactionLevel} onChange={(e) => setInteractionLevel(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="availability">Disponibilité</Label>
            <Textarea id="availability" placeholder="ex: Disponible juillet-août et week-ends" value={availabilityNotes} onChange={(e) => setAvailabilityNotes(e.target.value)} rows={2} />
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={loading || !placeId || !title}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Publier le séjour
          </Button>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default CreateListing;
