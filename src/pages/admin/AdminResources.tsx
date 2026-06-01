import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, ExternalLink, Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type Resource = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  type: string;
  author_or_director: string | null;
  year: number | null;
  cover_image: string | null;
  external_link: string | null;
  tags: string[] | null;
  is_published: boolean;
};

const TYPES = ["livre", "film", "documentaire", "podcast", "article", "guide"];

const empty: Partial<Resource> = {
  slug: "",
  title: "",
  description: "",
  type: "livre",
  author_or_director: "",
  year: null,
  cover_image: "",
  external_link: "",
  tags: [],
  is_published: false,
};

export default function AdminResources() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Resource>>(empty);
  const [tagsInput, setTagsInput] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-resources"],
    queryFn: async () => {
      const { data, error } = await supabase.from("resources").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Resource[];
    },
  });

  const save = useMutation({
    mutationFn: async (r: Partial<Resource>) => {
      const payload: any = {
        slug: r.slug,
        title: r.title,
        description: r.description,
        type: r.type,
        author_or_director: r.author_or_director,
        year: r.year || null,
        cover_image: r.cover_image || null,
        external_link: r.external_link || null,
        tags: tagsInput ? tagsInput.split(",").map((t) => t.trim()).filter(Boolean) : r.tags ?? [],
        is_published: r.is_published,
      };
      if (r.id) {
        const { error } = await supabase.from("resources").update(payload).eq("id", r.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("resources").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-resources"] });
      setOpen(false);
      toast({ title: "Ressource enregistrée" });
    },
    onError: (e: any) => toast({ title: "Erreur", description: e.message, variant: "destructive" }),
  });

  const togglePub = useMutation({
    mutationFn: async (r: Resource) => {
      const { error } = await supabase
        .from("resources")
        .update({ is_published: !r.is_published })
        .eq("id", r.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-resources"] }),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("resources").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-resources"] });
      toast({ title: "Ressource supprimée" });
    },
  });

  const openNew = () => {
    setEditing(empty);
    setTagsInput("");
    setOpen(true);
  };
  const openEdit = (r: Resource) => {
    setEditing(r);
    setTagsInput((r.tags ?? []).join(", "));
    setOpen(true);
  };

  return (
    <AdminLayout title="Ressources">
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-muted-foreground">{data?.length ?? 0} ressource(s)</p>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4" /> Nouvelle ressource
        </Button>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Titre</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Auteur</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin inline" />
                </TableCell>
              </TableRow>
            ) : (data ?? []).length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Aucune ressource
                </TableCell>
              </TableRow>
            ) : (
              data!.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.title}</TableCell>
                  <TableCell className="text-sm text-muted-foreground capitalize">{r.type}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{r.author_or_director ?? "—"}</TableCell>
                  <TableCell>
                    {r.is_published ? <Badge>Publié</Badge> : <Badge variant="outline">Brouillon</Badge>}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {r.external_link && (
                        <Button asChild variant="ghost" size="icon">
                          <a href={r.external_link} target="_blank" rel="noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => openEdit(r)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => togglePub.mutate(r)}>
                        {r.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm(`Supprimer "${r.title}" ?`)) del.mutate(r.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing.id ? "Modifier la ressource" : "Nouvelle ressource"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Titre</Label>
              <Input value={editing.title ?? ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
            </div>
            <div>
              <Label>Slug</Label>
              <Input value={editing.slug ?? ""} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} />
            </div>
            <div>
              <Label>Type</Label>
              <Select value={editing.type} onValueChange={(v) => setEditing({ ...editing, type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TYPES.map((t) => (
                    <SelectItem key={t} value={t} className="capitalize">
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Auteur / Réalisateur</Label>
                <Input
                  value={editing.author_or_director ?? ""}
                  onChange={(e) => setEditing({ ...editing, author_or_director: e.target.value })}
                />
              </div>
              <div>
                <Label>Année</Label>
                <Input
                  type="number"
                  value={editing.year ?? ""}
                  onChange={(e) =>
                    setEditing({ ...editing, year: e.target.value ? Number(e.target.value) : null })
                  }
                />
              </div>
            </div>
            <div>
              <Label>Lien externe</Label>
              <Input
                value={editing.external_link ?? ""}
                onChange={(e) => setEditing({ ...editing, external_link: e.target.value })}
              />
            </div>
            <div>
              <Label>Image de couverture (URL)</Label>
              <Input
                value={editing.cover_image ?? ""}
                onChange={(e) => setEditing({ ...editing, cover_image: e.target.value })}
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                rows={4}
                value={editing.description ?? ""}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
              />
            </div>
            <div>
              <Label>Tags (séparés par virgules)</Label>
              <Input value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} />
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={!!editing.is_published}
                onCheckedChange={(v) => setEditing({ ...editing, is_published: v })}
              />
              <Label>Publié</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button onClick={() => save.mutate(editing)} disabled={save.isPending}>
              {save.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
