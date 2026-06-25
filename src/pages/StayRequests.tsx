import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import listingPlaceholder from "@/assets/listing-placeholder.webp";
import { Link, Navigate } from "react-router-dom";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Loader2, Calendar, ChevronRight, Filter, X } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import {
  useMyExchangeRequests,
  useUpdateExchangeRequestStatus,
  type StayRequestStatus,
} from "@/hooks/use-exchange-requests";
import { toast } from "@/hooks/use-toast";

const STATUS_META: Record<
  StayRequestStatus,
  { labelKey: string; emoji: string; className: string }
> = {
  pending: { labelKey: "stayRequestDetail.statusPending", emoji: "⏳", className: "bg-amber-100 text-amber-900 border-amber-200" },
  accepted: { labelKey: "stayRequestDetail.statusAccepted", emoji: "✅", className: "bg-emerald-100 text-emerald-900 border-emerald-200" },
  declined: { labelKey: "stayRequestDetail.statusDeclined", emoji: "✕", className: "bg-rose-100 text-rose-900 border-rose-200" },
  cancelled: { labelKey: "stayRequestDetail.statusCancelled", emoji: "❌", className: "bg-muted text-muted-foreground border-border" },
  completed: { labelKey: "stayRequestDetail.statusCompleted", emoji: "✓", className: "bg-primary/10 text-primary border-primary/20" },
};

const StayRequests = () => {
  const { t } = useTranslation();
  const { user, loading } = useAuth();
  const { data: requests, isLoading } = useMyExchangeRequests(user?.id);
  const update = useUpdateExchangeRequestStatus();
  const [statusFilter, setStatusFilter] = useState<"all" | StayRequestStatus>("all");

  const sent = useMemo(
    () => (requests || []).filter((r: any) => r.from_user_id === user?.id),
    [requests, user?.id]
  );

  const filtered = useMemo(() => {
    const list = statusFilter === "all" ? sent : sent.filter((r: any) => r.status === statusFilter);
    return [...list].sort(
      (a: any, b: any) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
    );
  }, [sent, statusFilter]);

  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;

  const handleCancel = async (id: string) => {
    try {
      await update.mutateAsync({ id, status: "cancelled" });
      toast({ title: t("stayRequests.cancelled") });
    } catch (e: any) {
      toast({ title: t("stayRequests.error"), description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO title={t("stayRequests.seoTitle")} description={t("stayRequests.seoDesc")} />
      <Navbar />

      <div className="container px-5 py-8 max-w-5xl">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl text-foreground">{t("stayRequests.title")}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t("stayRequests.subtitle")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder={t("stayRequests.filterByStatus")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("stayRequests.filterAll")}</SelectItem>
                <SelectItem value="pending">⏳ {t("stayRequestDetail.statusPending")}</SelectItem>
                <SelectItem value="accepted">✅ {t("stayRequests.filterAccepted")}</SelectItem>
                <SelectItem value="declined">✕ {t("stayRequests.filterDeclined")}</SelectItem>
                <SelectItem value="cancelled">❌ {t("stayRequests.filterCancelled")}</SelectItem>
                <SelectItem value="completed">✓ {t("stayRequests.filterCompleted")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : sent.length === 0 ? (
          /* No requests at all — warm invitation to start */
          <div className="rounded-xl border border-dashed bg-card p-10 text-center">
            <Calendar className="mx-auto h-10 w-10 text-muted-foreground/50" />
            <p className="mt-3 text-base font-medium text-foreground">
              {t("stayRequests.emptyTitle")}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("stayRequests.emptyHint")}
            </p>
            <Link to="/discover" className="mt-4 inline-block">
              <Button size="sm">{t("stayRequests.discover")}</Button>
            </Link>
          </div>
        ) : filtered.length === 0 ? (
          /* Has requests, but none match the active filter */
          <div className="rounded-xl border bg-card p-10 text-center">
            <Calendar className="mx-auto h-10 w-10 text-muted-foreground/60" />
            <p className="mt-3 text-sm text-muted-foreground">
              {t("stayRequests.noneInCategory", {
                status: STATUS_META[statusFilter as StayRequestStatus]
                  ? t(STATUS_META[statusFilter as StayRequestStatus].labelKey).toLowerCase()
                  : t("stayRequests.thisCategory"),
              })}
            </p>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => setStatusFilter("all")}>
              {t("stayRequests.resetFilter")}
            </Button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border bg-card">
            <div className="hidden grid-cols-12 gap-4 border-b bg-muted/40 px-5 py-3 text-xs font-medium text-muted-foreground sm:grid">
              <div className="col-span-4">{t("stayRequests.colHabitat")}</div>
              <div className="col-span-3">{t("stayRequests.colDates")}</div>
              <div className="col-span-2">{t("stayRequests.colStatus")}</div>
              <div className="col-span-2">{t("stayRequests.colLastAction")}</div>
              <div className="col-span-1 text-right">{t("stayRequests.colActions")}</div>
            </div>
            <ul className="divide-y">
              {filtered.map((r: any) => {
                const status = (r.status || "pending") as StayRequestStatus;
                const meta = STATUS_META[status] || STATUS_META.pending;
                const listing = r.listings;
                const place = listing?.places;
                return (
                  <li key={r.id} className="grid grid-cols-1 sm:grid-cols-12 gap-3 px-5 py-4 items-center">
                    <div className="sm:col-span-4 flex items-center gap-3 min-w-0">
                      <img
                        src={listing?.image || listingPlaceholder}
                        alt=""
                        className="h-12 w-12 rounded-lg object-cover ring-1 ring-border shrink-0"
                      />
                      <div className="min-w-0">
                        <Link to={`/stay-requests/${r.id}`} className="text-sm font-medium text-foreground hover:underline truncate block">
                          {listing?.title || t("stayRequests.stay")}
                        </Link>
                        {place && (
                          <p className="text-xs text-muted-foreground truncate">
                            {place.name}{place.region ? ` · ${place.region}` : ""}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="sm:col-span-3 text-sm text-foreground">
                      {format(new Date(r.start_date), "d MMM", { locale: fr })} →{" "}
                      {format(new Date(r.end_date), "d MMM yyyy", { locale: fr })}
                    </div>
                    <div className="sm:col-span-2">
                      <Badge variant="outline" className={meta.className}>
                        {meta.emoji} {t(meta.labelKey)}
                      </Badge>
                    </div>
                    <div className="sm:col-span-2 text-xs text-muted-foreground">
                      {format(new Date(r.updated_at || r.created_at), "d MMM, HH:mm", { locale: fr })}
                    </div>
                    <div className="sm:col-span-1 flex justify-end gap-1">
                      {status === "pending" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          title={t("stayRequests.cancelTitle")}
                          onClick={() => handleCancel(r.id)}
                          disabled={update.isPending}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                      <Link to={`/stay-requests/${r.id}`}>
                        <Button variant="ghost" size="icon" title={t("stayRequests.viewDetails")}>
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default StayRequests;
