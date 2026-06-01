import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle, MapPin, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type Candidate = {
  id: string;
  name: string;
  city: string | null;
  region: string | null;
  image: string | null;
  is_imported: boolean;
  claim_status: string;
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The duplicate place that will be removed after merging into the target. */
  source: { id: string; name: string; city?: string | null; region?: string | null } | null;
}

export default function MergePlaceDialog({ open, onOpenChange, source }: Props) {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<Candidate[]>([]);
  const [targetId, setTargetId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [merging, setMerging] = useState(false);

  // Pre-fill search with source name on open
  useEffect(() => {
    if (open && source) {
      setSearch(source.name);
      setTargetId(null);
    }
  }, [open, source]);

  useEffect(() => {
    if (!open || !source) return;
    const handle = setTimeout(async () => {
      const q = search.trim();
      if (q.length < 2) {
        setResults([]);
        return;
      }
      setLoading(true);
      const { data, error } = await supabase
        .from("places")
        .select("id, name, city, region, image, is_imported, claim_status")
        .or(`name.ilike.%${q}%,city.ilike.%${q}%`)
        .neq("id", source.id)
        .limit(20);
      setLoading(false);
      if (!error && data) setResults(data as Candidate[]);
    }, 300);
    return () => clearTimeout(handle);
  }, [search, open, source]);

  const target = useMemo(
    () => results.find((r) => r.id === targetId) ?? null,
    [results, targetId]
  );

  const handleMerge = async () => {
    if (!source || !target) return;
    if (
      !confirm(
        `Fusionner "${source.name}" dans "${target.name}" ?\n\nLes membres, séjours et claims seront transférés. Le doublon sera supprimé. Cette action est irréversible.`
      )
    )
      return;

    setMerging(true);
    const { error } = await supabase.rpc("admin_merge_places", {
      _source_id: source.id,
      _target_id: target.id,
    });
    setMerging(false);

    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Fusion effectuée", description: `${source.name} → ${target.name}` });
    qc.invalidateQueries({ queryKey: ["admin-places"] });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Fusionner ce lieu dans un autre</DialogTitle>
          <DialogDescription>
            Choisissez le lieu <strong>cible</strong> qui sera conservé. Le lieu courant sera
            supprimé après transfert de ses membres, séjours et claims.
          </DialogDescription>
        </DialogHeader>

        {source && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">À supprimer (source)</p>
                <p className="text-muted-foreground">
                  {source.name}
                  {source.city ? ` — ${source.city}` : ""}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Input
            placeholder="Rechercher le lieu cible par nom ou ville…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="max-h-72 overflow-y-auto space-y-1.5 rounded-md border bg-card p-2">
            {loading ? (
              <div className="py-6 text-center">
                <Loader2 className="h-4 w-4 animate-spin inline text-muted-foreground" />
              </div>
            ) : results.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">
                Aucun lieu trouvé.
              </p>
            ) : (
              results.map((p) => {
                const selected = p.id === targetId;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setTargetId(p.id)}
                    className={`w-full flex items-center gap-3 rounded-md border p-2 text-left transition-colors ${
                      selected
                        ? "border-primary bg-primary/5"
                        : "border-transparent hover:border-border"
                    }`}
                  >
                    <div className="h-10 w-10 rounded bg-muted overflow-hidden shrink-0">
                      {p.image && (
                        <img
                          src={p.image}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {p.name}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {[p.city, p.region].filter(Boolean).join(", ") || "—"}
                      </p>
                    </div>
                    {selected && <Check className="h-4 w-4 text-primary shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={merging}>
            Annuler
          </Button>
          <Button
            variant="destructive"
            onClick={handleMerge}
            disabled={!target || merging}
          >
            {merging && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
            Fusionner
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
