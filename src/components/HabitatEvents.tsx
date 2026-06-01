import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CalendarDays,
  Hammer,
  Utensils,
  Users,
  Sparkles,
  Heart,
  Plus,
  Trash2,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "@/hooks/use-toast";
import {
  useHabitatEvents,
  useCreateHabitatEvent,
  useDeleteHabitatEvent,
  useToggleEventInterest,
} from "@/hooks/use-habitat-events";

export const EVENT_TYPES = {
  atelier: { label: "Atelier", icon: Hammer, color: "bg-amber-100 text-amber-800 border-amber-200" },
  repas: { label: "Repas partagé", icon: Utensils, color: "bg-rose-100 text-rose-800 border-rose-200" },
  reunion: { label: "Réunion", icon: Users, color: "bg-sky-100 text-sky-800 border-sky-200" },
  autre: { label: "Autre", icon: Sparkles, color: "bg-violet-100 text-violet-800 border-violet-200" },
} as const;

type Props = { placeId: string; canManage: boolean };

const HabitatEvents = ({ placeId, canManage }: Props) => {
  const { user } = useAuth();
  const { data: events, isLoading } = useHabitatEvents(placeId);
  const createMutation = useCreateHabitatEvent();
  const deleteMutation = useDeleteHabitatEvent();
  const toggleInterest = useToggleEventInterest();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    event_type: "atelier" as keyof typeof EVENT_TYPES,
    date_start: "",
    date_end: "",
    max_participants: "",
    is_public: true,
  });

  const reset = () =>
    setForm({
      title: "",
      description: "",
      event_type: "atelier",
      date_start: "",
      date_end: "",
      max_participants: "",
      is_public: true,
    });

  const handleCreate = async () => {
    if (!user || !form.title || !form.date_start) return;
    try {
      await createMutation.mutateAsync({
        place_id: placeId,
        created_by: user.id,
        title: form.title,
        description: form.description || null,
        event_type: form.event_type,
        date_start: new Date(form.date_start).toISOString(),
        date_end: form.date_end ? new Date(form.date_end).toISOString() : null,
        max_participants: form.max_participants ? Number(form.max_participants) : null,
        is_public: form.is_public,
      });
      toast({ title: "Événement créé ✓" });
      reset();
      setOpen(false);
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cet événement ?")) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast({ title: "Événement supprimé" });
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    }
  };

  const upcoming = (events || []).filter((e) => new Date(e.date_start) >= new Date(Date.now() - 86400000));

  return (
    <div className="mb-6">
      <div className="mb-3 flex items-center justify-between gap-2 flex-wrap">
        <h2 className="text-xl font-serif text-foreground inline-flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-primary" />
          Activités &amp; événements
        </h2>
        {canManage && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="mr-1.5 h-3.5 w-3.5" /> Créer un événement
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Nouvel événement</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 py-2">
                <div>
                  <Label htmlFor="ev-title">Titre</Label>
                  <Input id="ev-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Atelier permaculture" />
                </div>
                <div>
                  <Label>Type</Label>
                  <Select value={form.event_type} onValueChange={(v) => setForm({ ...form, event_type: v as any })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(EVENT_TYPES).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="ev-start">Début</Label>
                    <Input id="ev-start" type="datetime-local" value={form.date_start} onChange={(e) => setForm({ ...form, date_start: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="ev-end">Fin (optionnel)</Label>
                    <Input id="ev-end" type="datetime-local" value={form.date_end} onChange={(e) => setForm({ ...form, date_end: e.target.value })} />
                  </div>
                </div>
                <div>
                  <Label htmlFor="ev-max">Participants max (optionnel)</Label>
                  <Input id="ev-max" type="number" min={1} value={form.max_participants} onChange={(e) => setForm({ ...form, max_participants: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="ev-desc">Description</Label>
                  <Textarea id="ev-desc" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.is_public} onChange={(e) => setForm({ ...form, is_public: e.target.checked })} />
                  Événement public (visible par tous)
                </label>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setOpen(false)}>Annuler</Button>
                <Button onClick={handleCreate} disabled={createMutation.isPending || !form.title || !form.date_start}>
                  {createMutation.isPending && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                  Créer
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      ) : upcoming.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-muted/30 p-5 text-center">
          <CalendarDays className="mx-auto h-7 w-7 text-muted-foreground/50 mb-2" />
          <p className="text-sm text-muted-foreground">
            Aucun événement à venir pour l'instant.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {upcoming.map((ev) => {
            const meta = EVENT_TYPES[ev.event_type] || EVENT_TYPES.autre;
            const Icon = meta.icon;
            const interests = ev.habitat_event_interests || [];
            const interested = !!user && interests.some((i) => i.user_id === user.id);
            return (
              <div key={ev.id} className="rounded-xl border bg-card p-4 flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <Badge variant="outline" className={`text-xs border ${meta.color}`}>
                    <Icon className="mr-1 h-3 w-3" />
                    {meta.label}
                  </Badge>
                  {!ev.is_public && <Badge variant="secondary" className="text-[10px]">Privé</Badge>}
                </div>
                <h3 className="font-serif text-lg text-foreground leading-tight">{ev.title}</h3>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(ev.date_start), "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr })}
                </p>
                {ev.description && <p className="text-sm text-muted-foreground line-clamp-3">{ev.description}</p>}
                <div className="mt-auto pt-2 flex items-center justify-between gap-2 border-t">
                  <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                    <Heart className="h-3.5 w-3.5" />
                    {interests.length}
                    {ev.max_participants ? ` / ${ev.max_participants}` : ""} intéressé{interests.length > 1 ? "s" : ""}
                  </span>
                  <div className="flex gap-1">
                    {user ? (
                      <Button
                        size="sm"
                        variant={interested ? "secondary" : "default"}
                        onClick={() => toggleInterest.mutate({ eventId: ev.id, userId: user.id, interested })}
                        disabled={toggleInterest.isPending}
                      >
                        <Heart className={`mr-1 h-3.5 w-3.5 ${interested ? "fill-current" : ""}`} />
                        {interested ? "Intéressé·e" : "S'intéresser"}
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" asChild>
                        <a href="/auth">S'intéresser</a>
                      </Button>
                    )}
                    {canManage && (
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(ev.id)} className="text-destructive hover:text-destructive">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HabitatEvents;
