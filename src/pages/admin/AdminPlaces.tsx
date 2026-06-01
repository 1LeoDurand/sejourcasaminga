import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, EyeOff, Trash2, ExternalLink, Loader2, Pencil, Plus, Send, GitMerge } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import MergePlaceDialog from "@/components/admin/MergePlaceDialog";
import { HABITAT_TYPES } from "@/data/demo";

type CompletionLevel = "incomplete" | "ready" | "published";

function getCompletion(p: any): CompletionLevel {
  const hasBasics =
    p.name && p.type && p.short_desc && p.description && p.image && p.city && p.region;
  if (p.published && p.is_visible && hasBasics) return "published";
  if (hasBasics) return "ready";
  return "incomplete";
}

export default function AdminPlaces() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [completionFilter, setCompletionFilter] = useState<string>("all");
  const [mergeSource, setMergeSource] = useState<any | null>(null);

  const { data: places, isLoading } = useQuery({
    queryKey: ["admin-places"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("places")
        .select("id, name, type, region, city, image, short_desc, description, published, is_visible, claim_status, is_imported, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const updatePlace = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Record<string, any> }) => {
      const { error } = await supabase.from("places").update(patch as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-places"] });
      toast({ title: "Mis à jour" });
    },
    onError: (e: any) => toast({ title: "Erreur", description: e.message, variant: "destructive" }),
  });

  const deletePlace = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("places").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-places"] });
      toast({ title: "Lieu supprimé" });
    },
    onError: (e: any) => toast({ title: "Erreur", description: e.message, variant: "destructive" }),
  });

  const filtered = (places ?? []).filter((p: any) => {
    const matchSearch =
      !search ||
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.city?.toLowerCase().includes(search.toLowerCase()) ||
      p.region?.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === "all" ||
      (statusFilter === "imported" && p.is_imported) ||
      (statusFilter === "claimed" && p.claim_status === "claimed") ||
      (statusFilter === "pending" && p.claim_status === "claim_pending") ||
      (statusFilter === "hidden" && !p.is_visible) ||
      (statusFilter === "draft" && !p.published);
    const matchType = typeFilter === "all" || p.type === typeFilter;
    const completion = getCompletion(p);
    const matchCompletion = completionFilter === "all" || completion === completionFilter;
    return matchSearch && matchStatus && matchType && matchCompletion;
  });

  return (
    <AdminLayout title="Lieux">
      <div className="flex flex-col sm:flex-row gap-3 mb-4 flex-wrap">
        <Input
          placeholder="Rechercher par nom, ville, région…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="claimed">Revendiqués</SelectItem>
            <SelectItem value="imported">Importés</SelectItem>
            <SelectItem value="pending">Revendication en attente</SelectItem>
            <SelectItem value="draft">Brouillon</SelectItem>
            <SelectItem value="hidden">Cachés</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            {HABITAT_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={completionFilter} onValueChange={setCompletionFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Complétion" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toute complétion</SelectItem>
            <SelectItem value="incomplete">Incomplet</SelectItem>
            <SelectItem value="ready">Prêt à publier</SelectItem>
            <SelectItem value="published">Publié</SelectItem>
          </SelectContent>
        </Select>
        <Button asChild className="ml-auto">
          <Link to="/create-place"><Plus className="h-4 w-4 mr-1" /> Ajouter un lieu</Link>
        </Button>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Localisation</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Complétion</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin inline" />
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Aucun lieu
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((p: any) => {
                const completion = getCompletion(p);
                return (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{p.type}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {[p.city, p.region].filter(Boolean).join(", ")}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {!p.published && <Badge variant="outline">Brouillon</Badge>}
                        {p.published && p.is_visible && <Badge>Publié</Badge>}
                        {p.published && !p.is_visible && <Badge variant="outline" className="text-muted-foreground">Caché</Badge>}
                        {p.is_imported && <Badge variant="secondary">Importé</Badge>}
                        {p.claim_status === "claim_pending" && <Badge variant="outline">Claim en attente</Badge>}
                      </div>
                    </TableCell>
                    <TableCell>
                      {completion === "published" && <Badge className="bg-olive text-olive-foreground">Publié</Badge>}
                      {completion === "ready" && <Badge variant="outline">Prêt à publier</Badge>}
                      {completion === "incomplete" && <Badge variant="outline" className="text-destructive border-destructive/40">Incomplet</Badge>}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button asChild variant="ghost" size="icon" title="Aperçu">
                          <Link to={`/habitat/${p.id}`} target="_blank">
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button asChild variant="ghost" size="icon" title="Éditer">
                          <Link to={`/edit-place/${p.id}`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        {!p.published && completion !== "incomplete" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Publier"
                            onClick={() => updatePlace.mutate({ id: p.id, patch: { published: true, is_visible: true } })}
                          >
                            <Send className="h-4 w-4 text-olive" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          title={p.is_visible ? "Cacher" : "Afficher"}
                          onClick={() => updatePlace.mutate({ id: p.id, patch: { is_visible: !p.is_visible } })}
                        >
                          {p.is_visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Fusionner avec un autre lieu"
                          onClick={() => setMergeSource(p)}
                        >
                          <GitMerge className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Supprimer"
                          onClick={() => {
                            if (confirm(`Supprimer "${p.name}" ?`)) deletePlace.mutate(p.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <MergePlaceDialog
        open={!!mergeSource}
        onOpenChange={(o) => !o && setMergeSource(null)}
        source={mergeSource}
      />
    </AdminLayout>
  );
}
