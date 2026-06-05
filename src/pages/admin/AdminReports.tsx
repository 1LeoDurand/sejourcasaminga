import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import {
  useAllReports,
  useUpdateReportStatus,
  REPORT_REASON_LABELS,
  REPORT_TARGET_LABELS,
  type ReportRow,
} from "@/hooks/use-reports";
import { CheckCircle2, XCircle, Loader2, ExternalLink, Flag } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "@/hooks/use-toast";

const TARGET_PATH: Record<string, (id: string) => string> = {
  listing: (id) => `/listing/${id}`,
  place: (id) => `/habitat/${id}`,
  profile: () => `/admin/users`,
  review: () => `/admin/listings`,
};

export default function AdminReports() {
  const { user } = useAuth();
  const { data: reports, isLoading } = useAllReports();
  const updateStatus = useUpdateReportStatus();

  const handle = (id: string, status: "reviewed" | "dismissed") => {
    if (!user) return;
    updateStatus.mutate(
      { id, status, reviewerId: user.id },
      {
        onSuccess: () =>
          toast({ title: status === "reviewed" ? "Marqué comme traité" : "Signalement écarté" }),
        onError: (e: any) => toast({ title: "Erreur", description: e.message, variant: "destructive" }),
      }
    );
  };

  const renderCard = (r: ReportRow) => {
    const pathFn = TARGET_PATH[r.target_type];
    return (
      <Card key={r.id}>
        <CardHeader className="flex flex-row items-start justify-between space-y-0 gap-4">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Flag className="h-4 w-4 text-destructive" />
              {REPORT_REASON_LABELS[r.reason] ?? r.reason}
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              {format(new Date(r.created_at), "d MMM yyyy, HH:mm", { locale: fr })}
            </p>
          </div>
          <Badge
            variant={
              r.status === "reviewed" ? "default" : r.status === "dismissed" ? "secondary" : "destructive"
            }
          >
            {r.status === "pending" ? "À traiter" : r.status === "reviewed" ? "Traité" : "Écarté"}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Badge variant="outline">{REPORT_TARGET_LABELS[r.target_type] ?? r.target_type}</Badge>
            {pathFn && (
              <Link
                to={pathFn(r.target_id)}
                target="_blank"
                className="text-primary text-xs inline-flex items-center gap-1 hover:underline"
              >
                Voir la cible <ExternalLink className="h-3 w-3" />
              </Link>
            )}
            <span className="text-xs text-muted-foreground font-mono">{r.target_id.slice(0, 8)}…</span>
          </div>
          {r.details && (
            <div className="bg-muted/30 rounded-md p-3 mt-2">
              <p className="text-muted-foreground text-xs mb-1">Détails</p>
              <p>{r.details}</p>
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Signalé par <span className="font-mono">{r.reporter_user_id.slice(0, 8)}…</span>
          </p>
          {r.status === "pending" && (
            <div className="flex gap-2 pt-3">
              <Button size="sm" onClick={() => handle(r.id, "reviewed")} disabled={updateStatus.isPending}>
                <CheckCircle2 className="h-4 w-4" /> Marquer traité
              </Button>
              <Button size="sm" variant="outline" onClick={() => handle(r.id, "dismissed")} disabled={updateStatus.isPending}>
                <XCircle className="h-4 w-4" /> Écarter
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <AdminLayout title="Signalements">
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : !reports || reports.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">Aucun signalement. 🎉</p>
      ) : (() => {
        const pending = reports.filter((r) => r.status === "pending");
        const handled = reports.filter((r) => r.status !== "pending");
        return (
          <Tabs defaultValue="pending" className="w-full">
            <TabsList>
              <TabsTrigger value="pending">À traiter ({pending.length})</TabsTrigger>
              <TabsTrigger value="handled">Historique ({handled.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="pending" className="mt-4">
              {pending.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Rien à traiter.</p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">{pending.map(renderCard)}</div>
              )}
            </TabsContent>
            <TabsContent value="handled" className="mt-4">
              {handled.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Aucun historique.</p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">{handled.map(renderCard)}</div>
              )}
            </TabsContent>
          </Tabs>
        );
      })()}
    </AdminLayout>
  );
}
