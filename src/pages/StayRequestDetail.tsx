import { useMemo, useState } from "react";
import listingPlaceholder from "@/assets/listing-placeholder.webp";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  ArrowLeft, Calendar, Loader2, Users, MessageSquare, MapPin,
  CheckCircle2, XCircle, Clock, Mail, Home, Pencil, RotateCcw, Star,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import {
  useExchangeRequest,
  useUpdateExchangeRequestStatus,
  useUpdateExchangeRequestDates,
  useRevertStayAcceptance,
  stayPointsCost,
  stayPointsErrorMessage,
  type StayRequestStatus,
} from "@/hooks/use-exchange-requests";
import { useHostProfile } from "@/hooks/use-profile";
import { useHostReviewForStay } from "@/hooks/use-host-reviews";
import HostReviewDialog from "@/components/HostReviewDialog";
import { useTranslation } from "react-i18next";
import { toast } from "@/hooks/use-toast";

const STATUS_META: Record<StayRequestStatus, { labelKey: string; emoji: string; className: string }> = {
  pending: { labelKey: "stayRequestDetail.statusPending", emoji: "⏳", className: "bg-amber-100 text-amber-900 border-amber-200" },
  accepted: { labelKey: "stayRequestDetail.statusAccepted", emoji: "✅", className: "bg-emerald-100 text-emerald-900 border-emerald-200" },
  declined: { labelKey: "stayRequestDetail.statusDeclined", emoji: "✕", className: "bg-rose-100 text-rose-900 border-rose-200" },
  cancelled: { labelKey: "stayRequestDetail.statusCancelled", emoji: "❌", className: "bg-muted text-muted-foreground border-border" },
  completed: { labelKey: "stayRequestDetail.statusCompleted", emoji: "✓", className: "bg-primary/10 text-primary border-primary/20" },
};

const StayRequestDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { data: request, isLoading } = useExchangeRequest(id);
  const updateStatus = useUpdateExchangeRequestStatus();
  const updateDates = useUpdateExchangeRequestDates();
  const revertAcceptance = useRevertStayAcceptance();
  const { data: guestProfile } = useHostProfile(request?.from_user_id);
  const { data: existingHostReview } = useHostReviewForStay(request?.id);

  const [editOpen, setEditOpen] = useState(false);
  const [editStart, setEditStart] = useState("");
  const [editEnd, setEditEnd] = useState("");
  const [reviewOpen, setReviewOpen] = useState(false);

  const status = (request?.status || "pending") as StayRequestStatus;
  const meta = STATUS_META[status] || STATUS_META.pending;
  const listing: any = request?.listings;
  const place = listing?.places;

  const timeline = useMemo(() => {
    if (!request) return [];
    const items: { icon: any; label: string; date?: string; muted?: boolean }[] = [
      { icon: Pencil, label: t("stayRequestDetail.tlCreated"), date: request.created_at },
      { icon: Mail, label: t("stayRequestDetail.tlEmailSent"), date: request.created_at },
    ];
    if (status === "accepted" || status === "completed") {
      items.push({ icon: CheckCircle2, label: t("stayRequestDetail.tlConfirmed"), date: request.updated_at });
    }
    if (status === "declined") items.push({ icon: XCircle, label: t("stayRequestDetail.tlDeclined"), date: request.updated_at });
    if (status === "cancelled") items.push({ icon: XCircle, label: t("stayRequestDetail.tlCancelled"), date: request.updated_at });
    if (status === "completed") items.push({ icon: Home, label: t("stayRequestDetail.tlCompleted"), date: request.updated_at });
    return items;
  }, [request, status, t]);

  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container px-5 py-20 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container px-5 py-20 text-center">
          <h1 className="text-2xl text-foreground">{t("stayRequestDetail.notFound")}</h1>
          <Link to="/stay-requests" className="mt-4 inline-block text-primary underline">
            {t("stayRequestDetail.backToList")}
          </Link>
        </div>
      </div>
    );
  }

  const isAuthor = request.from_user_id === user.id;
  const isHost = request.to_member_id === user.id;
  const guestName = guestProfile?.display_name || t("stayRequestDetail.theTraveller");
  const isPoints = (request as any).exchange_type === "points";
  const pointsCost = isPoints
    ? stayPointsCost(request.start_date, request.end_date, listing?.points_per_night)
    : 0;

  const exchangeLabel = (type: string) => {
    const map: Record<string, string> = {
      free: t("stayRequestDetail.exchangeFree"),
      reciprocal: t("stayRequestDetail.exchangeReciprocal"),
      points: t("stayRequestDetail.exchangePoints"),
      other: t("stayRequestDetail.exchangeOther"),
    };
    return map[type] || type;
  };

  const setStatus = async (s: StayRequestStatus, msg: string) => {
    try {
      await updateStatus.mutateAsync({ id: request.id, status: s });
      toast({ title: msg });
    } catch (e: any) {
      toast({ title: t("stayRequestDetail.error"), description: e.message, variant: "destructive" });
    }
  };

  // Un-confirm: reverts the acceptance and refunds any points charged (RPC).
  const unconfirm = async () => {
    try {
      await revertAcceptance.mutateAsync(request.id);
      toast({ title: isPoints ? t("stayRequestDetail.revertedRefund") : t("stayRequestDetail.reverted") });
    } catch (e) {
      toast({ title: t("stayRequestDetail.error"), description: stayPointsErrorMessage(e), variant: "destructive" });
    }
  };

  const openEditDates = () => {
    setEditStart(request.start_date);
    setEditEnd(request.end_date);
    setEditOpen(true);
  };

  const saveDates = async () => {
    try {
      await updateDates.mutateAsync({ id: request.id, start_date: editStart, end_date: editEnd });
      toast({ title: t("stayRequestDetail.datesUpdated") });
      setEditOpen(false);
    } catch (e: any) {
      toast({ title: t("stayRequestDetail.error"), description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO title={t("stayRequestDetail.seoTitle")} description={t("stayRequestDetail.seoDesc")} />
      <Navbar />

      <div className="container px-5 py-6 max-w-3xl">
        <button
          onClick={() => navigate("/stay-requests")}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" /> {t("stayRequestDetail.myRequests")}
        </button>

        {/* Summary */}
        <div className="rounded-2xl border bg-card overflow-hidden">
          <div className="flex flex-col sm:flex-row">
            <img
              src={listing?.image || listingPlaceholder}
              alt=""
              className="h-40 sm:h-auto sm:w-56 w-full object-cover"
            />
            <div className="flex-1 p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link to={`/listing/${listing?.id}`} className="text-lg font-medium text-foreground hover:underline">
                    {listing?.title}
                  </Link>
                  {place && (
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <Link to={`/habitat/${place.slug || place.id}`} className="hover:text-foreground">
                        {place.name}{place.region ? ` · ${place.region}` : ""}
                      </Link>
                    </p>
                  )}
                </div>
                <Badge variant="outline" className={meta.className}>
                  {meta.emoji} {t(meta.labelKey)}
                </Badge>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-foreground">
                  <Calendar className="h-4 w-4 text-primary" />
                  {format(new Date(request.start_date), "d MMM yyyy", { locale: fr })} →{" "}
                  {format(new Date(request.end_date), "d MMM yyyy", { locale: fr })}
                </div>
                <div className="flex items-center gap-2 text-foreground">
                  <Users className="h-4 w-4 text-primary" />
                  {t("stayRequestDetail.guests", { count: request.number_of_guests || 1 })}
                </div>
              </div>

              {request.message && (
                <div className="mt-4 rounded-lg bg-muted/40 p-3">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1">
                    <MessageSquare className="h-3.5 w-3.5" /> {t("stayRequestDetail.yourMessage")}
                  </div>
                  <p className="text-sm text-foreground whitespace-pre-wrap">{request.message}</p>
                </div>
              )}

              {(request as any).exchange_type && (
                <p className="mt-3 text-xs text-muted-foreground">
                  {t("stayRequestDetail.exchangeType")} <span className="text-foreground">{exchangeLabel((request as any).exchange_type)}</span>
                </p>
              )}

              {isPoints && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {t("stayRequestDetail.cost")} <span className="font-medium text-foreground">🛎️ {t("stayRequestDetail.pointsValue", { count: pointsCost })}</span>
                  {status === "accepted" && typeof (request as any).points_spent === "number" && (
                    <span className="text-foreground"> {t("stayRequestDetail.debited")}</span>
                  )}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="mt-6 rounded-2xl border bg-card p-5">
          <h2 className="text-sm font-medium text-foreground mb-4">{t("stayRequestDetail.tracking")}</h2>
          <ol className="space-y-4">
            {timeline.map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <step.icon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-foreground">{step.label}</p>
                  {step.date && (
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(step.date), "d MMM yyyy, HH:mm", { locale: fr })}
                    </p>
                  )}
                </div>
              </li>
            ))}
            {status === "pending" && (
              <li className="flex items-start gap-3 opacity-60">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <Clock className="h-4 w-4" />
                </div>
                <p className="text-sm text-muted-foreground">{t("stayRequestDetail.awaitingResponse")}</p>
              </li>
            )}
          </ol>
        </div>

        {/* Actions */}
        {isAuthor && (
          <div className="mt-6 flex flex-wrap gap-2">
            {status === "pending" && (
              <>
                <Button variant="outline" onClick={openEditDates}>
                  <Pencil className="mr-2 h-4 w-4" /> {t("stayRequestDetail.editDates")}
                </Button>
                <Button variant="outline" onClick={() => setStatus("cancelled", t("stayRequestDetail.toastCancelled"))}>
                  <XCircle className="mr-2 h-4 w-4" /> {t("stayRequestDetail.cancelRequest")}
                </Button>
              </>
            )}
            {status === "accepted" && (
              <>
                <Button variant="outline" disabled={revertAcceptance.isPending} onClick={unconfirm}>
                  <RotateCcw className="mr-2 h-4 w-4" /> {t("stayRequestDetail.unconfirm")}
                </Button>
                <Link to={`/listing/${listing?.id}`}>
                  <Button variant="outline">
                    <MessageSquare className="mr-2 h-4 w-4" /> {t("stayRequestDetail.contactHost")}
                  </Button>
                </Link>
                <Button onClick={() => setStatus("completed", t("stayRequestDetail.toastCompleted"))}>
                  <CheckCircle2 className="mr-2 h-4 w-4" /> {t("stayRequestDetail.markCompleted")}
                </Button>
              </>
            )}
            {status === "completed" && (
              <Link to={`/post-stay-review?stay_id=${request.id}${place?.id ? `&place_id=${place.id}` : ""}`}>
                <Button>
                  <Star className="mr-2 h-4 w-4" /> {t("stayRequestDetail.leaveReview")}
                </Button>
              </Link>
            )}
          </div>
        )}

        {/* Host → guest review (recipient side, completed stays) */}
        {isHost && status === "completed" && (
          <div className="mt-6 flex flex-wrap items-center gap-3">
            {existingHostReview ? (
              <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-primary" /> {t("hostReview.alreadyDone")}
              </p>
            ) : (
              <Button onClick={() => setReviewOpen(true)}>
                <Star className="mr-2 h-4 w-4" /> {t("hostReview.cta", { name: guestName })}
              </Button>
            )}
          </div>
        )}
      </div>

      {isHost && (
        <HostReviewDialog
          open={reviewOpen}
          onOpenChange={setReviewOpen}
          hostUserId={user.id}
          guestUserId={request.from_user_id}
          guestName={guestName}
          stayRequestId={request.id}
        />
      )}

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("stayRequestDetail.editDates")}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="ed-start">{t("stayRequestDetail.arrival")}</Label>
              <Input id="ed-start" type="date" value={editStart} onChange={(e) => setEditStart(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="ed-end">{t("stayRequestDetail.departure")}</Label>
              <Input id="ed-end" type="date" value={editEnd} onChange={(e) => setEditEnd(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>{t("stayRequestDetail.cancel")}</Button>
            <Button onClick={saveDates} disabled={updateDates.isPending || !editStart || !editEnd}>
              {updateDates.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("stayRequestDetail.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default StayRequestDetail;
