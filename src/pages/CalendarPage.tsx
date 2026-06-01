import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, Calendar, ChevronRight, Loader2, CalendarDays,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useMyListings } from "@/hooks/use-listings";
import { useMyAvailabilities, useCreateAvailability, useDeleteAvailability } from "@/hooks/use-availabilities";
import { useMyPlacesEvents } from "@/hooks/use-habitat-events";
import { EVENT_TYPES } from "@/components/HabitatEvents";
import { format, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, isWithinInterval, isBefore, startOfDay, isSameDay } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "@/hooks/use-toast";

const statusOptions = [
  { value: "available", label: "Disponible", color: "bg-olive/20 text-olive border-olive/30", dot: "bg-olive" },
  { value: "reciprocal_only", label: "Échange réciproque", color: "bg-soleil/20 text-soleil-foreground border-soleil/30", dot: "bg-soleil" },
  { value: "unavailable", label: "Indisponible", color: "bg-muted text-muted-foreground border-border", dot: "bg-muted-foreground" },
];

const CalendarPage = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { data: myListings, isLoading: listingsLoading } = useMyListings(user?.id);
  const { data: availabilities } = useMyAvailabilities();
  const createAvailability = useCreateAvailability();
  const deleteAvailability = useDeleteAvailability();

  const [selectedListing, setSelectedListing] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
  const [addingRange, setAddingRange] = useState<{ start: Date | null; end: Date | null }>({ start: null, end: null });
  const [addingStatus, setAddingStatus] = useState("available");
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const { data: events } = useMyPlacesEvents(user?.id);

  const getEventsForDay = (day: Date) =>
    (events || []).filter((e: any) => isSameDay(new Date(e.date_start), day));

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [authLoading, user, navigate]);

  if (authLoading || listingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  const listingId = selectedListing || myListings?.[0]?.id;
  const listingAvailabilities = availabilities?.filter((a: any) => a.listing_id === listingId) || [];
  const today = startOfDay(new Date());

  // Generate 6 months of calendar
  const months = Array.from({ length: 6 }, (_, i) => addMonths(currentMonth, i));

  const getAvailabilityForDay = (day: Date) => {
    return listingAvailabilities.find((a: any) =>
      isWithinInterval(day, { start: new Date(a.start_date), end: new Date(a.end_date) })
    );
  };

  const handleDayClick = (day: Date) => {
    if (isBefore(day, today)) return;
    if (!addingRange.start || addingRange.end) {
      setAddingRange({ start: day, end: null });
    } else {
      const start = addingRange.start < day ? addingRange.start : day;
      const end = addingRange.start < day ? day : addingRange.start;
      setAddingRange({ start, end });
    }
  };

  const handleAddAvailability = async () => {
    if (!listingId || !addingRange.start || !addingRange.end) return;
    try {
      await createAvailability.mutateAsync({
        listing_id: listingId,
        start_date: format(addingRange.start, "yyyy-MM-dd"),
        end_date: format(addingRange.end, "yyyy-MM-dd"),
        status: addingStatus,
      });
      setAddingRange({ start: null, end: null });
      toast({ title: "Disponibilité ajoutée ✓" });
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    }
  };

  const weekDays = ["LU", "MA", "ME", "JE", "VE", "SA", "DI"];

  if (!myListings || myListings.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <Calendar className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
          <h1 className="text-xl font-serif text-foreground mb-2">Aucun séjour</h1>
          <p className="text-sm text-muted-foreground">Créez d'abord un séjour pour gérer votre calendrier.</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate("/dashboard")}>
            Retour au profil
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <button onClick={() => navigate("/dashboard")} className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Retour au profil
        </button>

        <div className="flex items-center gap-2 mb-6">
          <Calendar className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-serif text-foreground">Calendrier de disponibilité</h1>
        </div>

        {/* Listing selector */}
        {myListings.length > 1 && (
          <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
            {myListings.map((l: any) => (
              <button
                key={l.id}
                onClick={() => setSelectedListing(l.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                  listingId === l.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {l.title}
              </button>
            ))}
          </div>
        )}

        {/* Warning if no availability */}
        {listingAvailabilities.length === 0 && (
          <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-4 flex items-start gap-3 mb-6">
            <span className="text-xl">⚠️</span>
            <div>
              <p className="text-sm font-medium text-destructive">Aucune disponibilité indiquée</p>
              <p className="text-xs text-muted-foreground mt-0.5">Sélectionnez des dates sur le calendrier ci-dessous pour ajouter vos disponibilités</p>
            </div>
          </div>
        )}

        {/* Add availability form - sticky when range selected */}
        {addingRange.start && addingRange.end && (
          <div className="sticky top-16 z-30 rounded-xl border bg-card shadow-lg p-4 space-y-3 mb-6">
            <p className="text-sm font-medium text-foreground">Ajouter une période</p>
            <p className="text-xs text-muted-foreground">
              {format(addingRange.start, "dd MMM yyyy", { locale: fr })} – {format(addingRange.end, "dd MMM yyyy", { locale: fr })}
            </p>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setAddingStatus(opt.value)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
                    addingStatus === opt.value ? "border-primary bg-primary/5 font-medium" : "border-border hover:bg-muted"
                  }`}
                >
                  <div className={`h-2.5 w-2.5 rounded-full ${opt.dot}`} />
                  {opt.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Button size="sm" className="flex-1" onClick={handleAddAvailability} disabled={createAvailability.isPending}>
                {createAvailability.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : null}
                Ajouter
              </Button>
              <Button size="sm" variant="outline" onClick={() => setAddingRange({ start: null, end: null })}>Annuler</Button>
            </div>
          </div>
        )}

        {/* Existing availabilities legend */}
        {listingAvailabilities.length > 0 && (
          <div className="mb-6 space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Vos périodes</p>
            {listingAvailabilities.map((av: any) => {
              const opt = statusOptions.find((o) => o.value === av.status);
              return (
                <div key={av.id} className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm ${opt?.color || ""}`}>
                  <div className={`h-2.5 w-2.5 rounded-full shrink-0 ${opt?.dot || "bg-muted-foreground"}`} />
                  <span className="flex-1">
                    {format(new Date(av.start_date), "dd MMM", { locale: fr })} – {format(new Date(av.end_date), "dd MMM yyyy", { locale: fr })}
                  </span>
                  <span className="text-xs opacity-70">{opt?.label}</span>
                  <button onClick={() => deleteAvailability.mutate(av.id)} className="text-destructive hover:bg-destructive/10 rounded p-1 ml-1">×</button>
                </div>
              );
            })}
          </div>
        )}

        {/* Scrolling multi-month calendar */}
        <div className="space-y-8">
          {months.map((month) => {
            const days = eachDayOfInterval({ start: startOfMonth(month), end: endOfMonth(month) });
            const firstDayOfWeek = (startOfMonth(month).getDay() + 6) % 7;

            return (
              <div key={month.toISOString()} className="rounded-2xl border bg-card p-5">
                <h3 className="text-base font-semibold text-foreground capitalize text-center mb-4">
                  {format(month, "MMMM yyyy", { locale: fr })}
                </h3>

                <div className="grid grid-cols-7 gap-1">
                  {weekDays.map((d) => (
                    <div key={d} className="text-center text-[10px] font-medium text-muted-foreground py-1">{d}</div>
                  ))}
                  {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                    <div key={`empty-${i}`} />
                  ))}
                  {days.map((day) => {
                    const av = getAvailabilityForDay(day);
                    const dayEvents = getEventsForDay(day);
                    const hasEvent = dayEvents.length > 0;
                    const isPast = isBefore(day, today);
                    const isStart = addingRange.start && day.getTime() === addingRange.start.getTime();
                    const isEnd = addingRange.end && day.getTime() === addingRange.end.getTime();
                    const isInRange = addingRange.start && addingRange.end &&
                      isWithinInterval(day, { start: addingRange.start, end: addingRange.end });

                    let bgClass = "";
                    if (av?.status === "available") bgClass = "bg-olive/20 text-olive";
                    else if (av?.status === "reciprocal_only") bgClass = "bg-soleil/20 text-soleil-foreground";
                    else if (av?.status === "unavailable") bgClass = "bg-muted text-muted-foreground";

                    const handleClick = () => {
                      if (hasEvent) {
                        setSelectedEvent(dayEvents[0]);
                        return;
                      }
                      handleDayClick(day);
                    };

                    return (
                      <button
                        key={day.toISOString()}
                        onClick={handleClick}
                        disabled={isPast && !hasEvent}
                        title={hasEvent ? dayEvents.map((e: any) => e.title).join(" · ") : undefined}
                        className={`
                          relative h-10 w-full rounded-lg text-xs font-medium transition-all
                          ${isPast && !hasEvent ? "text-muted-foreground/30 cursor-not-allowed" : "hover:ring-2 hover:ring-primary/30 cursor-pointer"}
                          ${bgClass}
                          ${hasEvent ? "ring-1 ring-sky-400/60 bg-sky-50 text-sky-900" : ""}
                          ${isStart || isEnd ? "ring-2 ring-primary bg-primary/20 text-primary" : ""}
                          ${isInRange && !isStart && !isEnd ? "bg-primary/10" : ""}
                        `}
                      >
                        {format(day, "d")}
                        {hasEvent && (
                          <span className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full bg-sky-500" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Load more months */}
        <div className="flex justify-center mt-6 mb-8">
          <Button variant="outline" onClick={() => setCurrentMonth(addMonths(currentMonth, 6))}>
            Voir les mois suivants <ChevronRight className="ml-1.5 h-4 w-4" />
          </Button>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-4 py-4 border-t">
          {statusOptions.map((opt) => (
            <div key={opt.value} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <div className={`h-3 w-3 rounded-full ${opt.dot}`} />
              {opt.label}
            </div>
          ))}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <div className="h-3 w-3 rounded-full bg-sky-500" />
            Événement habitat
          </div>
        </div>

        {/* Event detail dialog */}
        <Dialog open={!!selectedEvent} onOpenChange={(o) => !o && setSelectedEvent(null)}>
          <DialogContent>
            {selectedEvent && (() => {
              const meta = (EVENT_TYPES as any)[selectedEvent.event_type] || EVENT_TYPES.autre;
              const Icon = meta.icon;
              return (
                <>
                  <DialogHeader>
                    <DialogTitle className="font-serif inline-flex items-center gap-2">
                      <CalendarDays className="h-5 w-5 text-sky-500" />
                      {selectedEvent.title}
                    </DialogTitle>
                    <DialogDescription>
                      {selectedEvent.places?.name}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3 text-sm">
                    <Badge variant="outline" className={`text-xs border ${meta.color}`}>
                      <Icon className="mr-1 h-3 w-3" />
                      {meta.label}
                    </Badge>
                    <p className="text-muted-foreground">
                      {format(new Date(selectedEvent.date_start), "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr })}
                      {selectedEvent.date_end && <> → {format(new Date(selectedEvent.date_end), "HH:mm", { locale: fr })}</>}
                    </p>
                    {selectedEvent.description && (
                      <p className="text-foreground whitespace-pre-line">{selectedEvent.description}</p>
                    )}
                    {selectedEvent.max_participants && (
                      <p className="text-xs text-muted-foreground">Limité à {selectedEvent.max_participants} participants</p>
                    )}
                    <Button asChild variant="outline" className="w-full">
                      <a href={`/habitat/${selectedEvent.place_id}`}>Voir l'habitat</a>
                    </Button>
                  </div>
                </>
              );
            })()}
          </DialogContent>
        </Dialog>
      </div>
      <Footer />
    </div>
  );
};

export default CalendarPage;
