import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Trash2, GripVertical } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface PhotoManagerProps {
  photos: string[];
  onChange: (photos: string[]) => void;
  folder: string; // e.g. "places/uuid" or "listings/uuid"
  maxPhotos?: number;
}

const PhotoManager = ({ photos, onChange, folder, maxPhotos = 10 }: PhotoManagerProps) => {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const newPhotos = [...photos];

    for (const file of Array.from(files)) {
      if (newPhotos.length >= maxPhotos) {
        toast({ title: `Maximum ${maxPhotos} photos`, variant: "destructive" });
        break;
      }

      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error } = await supabase.storage
        .from("place-photos")
        .upload(fileName, file, { contentType: file.type, upsert: false });

      if (error) {
        toast({ title: "Erreur d'upload", description: error.message, variant: "destructive" });
        continue;
      }

      const { data: urlData } = supabase.storage
        .from("place-photos")
        .getPublicUrl(fileName);

      newPhotos.push(urlData.publicUrl);
    }

    onChange(newPhotos);
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleRemove = async (index: number) => {
    const url = photos[index];
    // Try to extract path from URL and delete from storage
    try {
      const pathMatch = url.match(/place-photos\/(.+)$/);
      if (pathMatch) {
        await supabase.storage.from("place-photos").remove([pathMatch[1]]);
      }
    } catch {
      // Ignore deletion errors for external URLs
    }
    onChange(photos.filter((_, i) => i !== index));
  };

  const movePhoto = (from: number, to: number) => {
    if (to < 0 || to >= photos.length) return;
    const updated = [...photos];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      {/* Photo grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {photos.map((url, i) => (
            <div key={i} className="group relative rounded-lg overflow-hidden border bg-muted aspect-[4/3]">
              <img src={url} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors" />
              <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {i > 0 && (
                  <button
                    onClick={() => movePhoto(i, i - 1)}
                    className="h-7 w-7 rounded-full bg-background/90 flex items-center justify-center text-xs text-foreground hover:bg-background"
                    title="Déplacer avant"
                  >
                    ←
                  </button>
                )}
                {i < photos.length - 1 && (
                  <button
                    onClick={() => movePhoto(i, i + 1)}
                    className="h-7 w-7 rounded-full bg-background/90 flex items-center justify-center text-xs text-foreground hover:bg-background"
                    title="Déplacer après"
                  >
                    →
                  </button>
                )}
                <button
                  onClick={() => handleRemove(i)}
                  className="h-7 w-7 rounded-full bg-destructive/90 flex items-center justify-center text-destructive-foreground hover:bg-destructive"
                  title="Supprimer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              {i === 0 && (
                <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                  Couverture
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      {photos.length < maxPhotos && (
        <div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleUpload}
          />
          <Button
            type="button"
            variant="outline"
            className="w-full border-dashed h-20"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Upload en cours…
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Ajouter des photos ({photos.length}/{maxPhotos})
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default PhotoManager;
