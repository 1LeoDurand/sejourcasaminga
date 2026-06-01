import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface VideoEmbedFieldProps {
  value: string;
  onChange: (url: string) => void;
}

/**
 * Extracts a YouTube or Vimeo embed URL from various URL formats.
 */
export function getEmbedUrl(url: string): string | null {
  if (!url) return null;

  // YouTube
  const ytMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;

  // Already an embed URL
  if (url.includes("youtube.com/embed/") || url.includes("player.vimeo.com/video/")) {
    return url;
  }

  return null;
}

const VideoEmbedField = ({ value, onChange }: VideoEmbedFieldProps) => {
  const embedUrl = getEmbedUrl(value);

  return (
    <div className="space-y-3">
      <div>
        <Label>Vidéo de présentation</Label>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Collez un lien YouTube ou Vimeo…"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Formats acceptés : YouTube, Vimeo
        </p>
      </div>

      {/* Preview */}
      {embedUrl && (
        <div className="rounded-xl overflow-hidden border bg-muted aspect-video">
          <iframe
            src={embedUrl}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="Aperçu vidéo"
          />
        </div>
      )}

      {value && !embedUrl && (
        <p className="text-xs text-destructive">
          Lien non reconnu. Utilisez une URL YouTube ou Vimeo.
        </p>
      )}
    </div>
  );
};

export default VideoEmbedField;
