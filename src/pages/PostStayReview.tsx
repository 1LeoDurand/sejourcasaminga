import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { compressImage } from "@/lib/compress-image";
import { Loader2, Star, Upload, X as XIcon, ImagePlus, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useExchangeRequest } from "@/hooks/use-exchange-requests";
import { useCreateStayReview, useMyStayReview } from "@/hooks/use-stay-reviews";
import { useQuery } from "@tanstack/react-query";

const MAX_PHOTOS = 5;
const MAX_TEXT = 300;

const RATING_LABELS = ["", "Décevant", "Correct", "Bien", "Très bien", "Transformant"];

const PostStayReview = () => {
  const [params] = useSearchParams();
  const stayId = params.get("stay_id") || undefined;
  const placeIdParam = params.get("place_id") || undefined;
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const { data: stayRequest } = useExchangeRequest(stayId);
  const { data: existing } = useMyStayReview(stayId);

  // Resolve listing+place from stay request, or directly from place_id param
  const { data: listingInfo } = useQuery({
    queryKey: ["listing-place", stayRequest?.listing_id],
    enabled: !!stayRequest?.listing_id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("listings")
        .select("id, title, place_id, places:place_id(id, name)")
        .eq("id", stayRequest!.listing_id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: placeInfo } = useQuery({
    queryKey: ["place-name", placeIdParam],
    enabled: !!placeIdParam && !stayRequest,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("places")
        .select("id, name")
        .eq("id", placeIdParam!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const resolvedPlace = useMemo(() => {
    if (listingInfo?.places) return listingInfo.places as { id: string; name: string };
    if (placeInfo) return placeInfo as { id: string; name: string };
    return null;
  }, [listingInfo, placeInfo]);

  const [photos, setPhotos] = useState<string[]>([]);
  const [text, setText] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const [isPublic, setIsPublic] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const createReview = useCreateStayReview();

  useEffect(() => {
    if (existing) {
      setPhotos(existing.photos_urls || []);
      setText(existing.text || "");
      setRating(existing.rating);
      setIsPublic(existing.is_public);
    }
  }, [existing]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !files.length || !user) return;
    setUploading(true);
    const updated = [...photos];
    for (const original of Array.from(files)) {
      if (updated.length >= MAX_PHOTOS) {
        toast({ title: `Maximum ${MAX_PHOTOS} photos`, variant: "destructive" });
        break;
      }
      const file = await compressImage(original);
      const ext = file.type === "image/webp" ? "webp" : file.name.split(".").pop()?.toLowerCase() || "jpg";
      const fileName = `stay-reviews/${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage
        .from("place-photos")
        .upload(fileName, file, { contentType: file.type, upsert: false });
      if (error) {
        toast({ title: "Erreur d'upload", description: error.message, variant: "destructive" });
        continue;
      }
      const { data: urlData } = supabase.storage.from("place-photos").getPublicUrl(fileName);
      updated.push(urlData.publicUrl);
    }
    setPhotos(updated);
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const removePhoto = (i: number) => setPhotos(photos.filter((_, idx) => idx !== i));

  const canSubmit = !!user && !!resolvedPlace && text.trim().length > 0 && !createReview.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !resolvedPlace) return;
    try {
      await createReview.mutateAsync({
        user_id: user.id,
        place_id: resolvedPlace.id,
        listing_id: listingInfo?.id ?? null,
        stay_request_id: stayId ?? null,
        photos_urls: photos,
        text: text.trim(),
        rating,
        is_public: isPublic,
      });
      toast({
        title: "Merci pour ton retour !",
        description: "Il sera publié après validation de l'habitant.",
      });
      navigate(`/habitat/${resolvedPlace.id}`);
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <h1 className="font-serif text-2xl mb-2">Connexion requise</h1>
            <p className="text-muted-foreground mb-4">Connecte-toi pour partager ton retour d'expérience.</p>
            <Link to="/auth">
              <Button>Se connecter</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" /> Retour
        </button>

        <header className="mb-6">
          <h1 className="font-serif text-3xl text-foreground">Partage ton expérience</h1>
          {resolvedPlace && (
            <p className="text-muted-foreground mt-1">
              À propos de <span className="font-medium text-foreground">{resolvedPlace.name}</span>
            </p>
          )}
        </header>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Photos */}
          <section className="space-y-3">
            <div>
              <Label className="text-sm font-medium">Tes photos du lieu (optionnel)</Label>
              <p className="text-xs text-muted-foreground mt-0.5">Jusqu'à {MAX_PHOTOS} photos pour illustrer ton séjour.</p>
            </div>
            {photos.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {photos.map((url, i) => (
                  <div key={i} className="relative aspect-square rounded-lg overflow-hidden border bg-muted group">
                    <img src={url} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      className="absolute top-1 right-1 h-6 w-6 rounded-full bg-destructive/90 text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <XIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {photos.length < MAX_PHOTOS && (
              <>
                <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="w-full border-dashed h-20"
                >
                  {uploading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Upload…</>
                  ) : (
                    <><ImagePlus className="mr-2 h-4 w-4" /> Ajouter des photos ({photos.length}/{MAX_PHOTOS})</>
                  )}
                </Button>
              </>
            )}
          </section>

          {/* Section 2: Texte */}
          <section className="space-y-2">
            <Label htmlFor="review-text" className="text-sm font-medium">
              Qu'as-tu appris ou aimé dans ce lieu&nbsp;?
            </Label>
            <Textarea
              id="review-text"
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, MAX_TEXT))}
              placeholder="Décris ton expérience, ce qui t'a marqué·e, ce que tu retiens…"
              rows={5}
              required
            />
            <div className="flex justify-end text-xs text-muted-foreground">
              {text.length}/{MAX_TEXT}
            </div>
          </section>

          {/* Section 3: Rating */}
          <section className="space-y-2">
            <Label className="text-sm font-medium">Ton ressenti global (optionnel)</Label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(rating === n ? null : n)}
                  className="p-1"
                  aria-label={`${n} étoiles`}
                >
                  <Star
                    className={`h-7 w-7 transition-colors ${
                      rating !== null && n <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"
                    }`}
                  />
                </button>
              ))}
              {rating !== null && (
                <span className="ml-2 text-sm text-muted-foreground">{RATING_LABELS[rating]}</span>
              )}
            </div>
          </section>

          {/* Section 4: Visibilité */}
          <section className="rounded-lg border bg-muted/30 p-4">
            <div className="flex items-start gap-3">
              <Checkbox
                id="is-public"
                checked={isPublic}
                onCheckedChange={(v) => setIsPublic(v === true)}
                className="mt-0.5"
              />
              <div className="space-y-0.5">
                <Label htmlFor="is-public" className="text-sm font-medium cursor-pointer">
                  Je veux partager publiquement
                </Label>
                <p className="text-xs text-muted-foreground">
                  Les autres visiteurs verront ton retour, après validation par l'habitant.
                </p>
              </div>
            </div>
          </section>

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" disabled={!canSubmit}>
              {createReview.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Envoyer mon retour
            </Button>
            <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
              Annuler
            </Button>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
};

export default PostStayReview;
