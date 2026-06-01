import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useAllClaimRequests, useReviewClaimRequest } from "@/hooks/use-claim-requests";
import { CheckCircle2, XCircle, Loader2, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "@/hooks/use-toast";

export default function AdminClaimsPage() {
  const { user } = useAuth();
  const { data: requests, isLoading } = useAllClaimRequests();
  const reviewMutation = useReviewClaimRequest();

  const handleReview = (req: any, status: "approved" | "rejected") => {
    if (!user) return;
    reviewMutation.mutate(
      {
        requestId: req.id,
        status,
        reviewerId: user.id,
        placeId: req.place_id,
        userId: req.user_id,
      },
      {
        onSuccess: () =>
          toast({ title: status === "approved" ? "Revendication approuvée" : "Revendication rejetée" }),
        onError: (e: any) => toast({ title: "Erreur", description: e.message, variant: "destructive" }),
      }
    );
  };

  return (
    <AdminLayout title="Revendications">
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : !requests || requests.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">Aucune revendication.</p>
      ) : (() => {
        const unverified = requests.filter((r: any) => !r.email_verified && r.status === "pending");
        const verified = requests.filter((r: any) => r.email_verified || r.status !== "pending");

        const renderCard = (req: any) => (
          <Card key={req.id}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 gap-4">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  {req.places?.name ?? "Lieu inconnu"}
                  <Link to={`/habitat/${req.place_id}`} className="text-muted-foreground hover:text-primary">
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  {format(new Date(req.created_at), "d MMM yyyy", { locale: fr })}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Badge
                  variant={
                    req.status === "approved" ? "default" : req.status === "rejected" ? "destructive" : "outline"
                  }
                >
                  {req.status === "pending" ? "En attente" : req.status === "approved" ? "Approuvée" : "Rejetée"}
                </Badge>
                {req.email_verified ? (
                  <Badge variant="secondary" className="text-xs">Email vérifié ✓</Badge>
                ) : (
                  <Badge variant="outline" className="text-xs text-muted-foreground">Email non vérifié</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">Demandeur : </span>
                {req.full_name} · {req.email}
              </div>
              <div>
                <span className="text-muted-foreground">Rôle : </span>
                {req.role_in_place}
              </div>
              {req.message && (
                <div className="bg-muted/30 rounded-md p-3 mt-2">
                  <p className="text-muted-foreground text-xs mb-1">Message</p>
                  <p>{req.message}</p>
                </div>
              )}
              {req.proof_url && (
                <a
                  href={req.proof_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary text-sm inline-flex items-center gap-1 hover:underline"
                >
                  Justificatif <ExternalLink className="h-3 w-3" />
                </a>
              )}
              {req.status === "pending" && (
                <div className="flex gap-2 pt-3">
                  <Button size="sm" onClick={() => handleReview(req, "approved")} disabled={reviewMutation.isPending}>
                    <CheckCircle2 className="h-4 w-4" /> Approuver
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleReview(req, "rejected")} disabled={reviewMutation.isPending}>
                    <XCircle className="h-4 w-4" /> Rejeter
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        );

        return (
          <Tabs defaultValue="verified" className="w-full">
            <TabsList>
              <TabsTrigger value="verified">Vérifiés, à approuver ({verified.length})</TabsTrigger>
              <TabsTrigger value="unverified">En attente de vérification email ({unverified.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="verified" className="mt-4">
              {verified.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Aucune demande vérifiée.</p>
              ) : (
                <div className="grid gap-4">{verified.map(renderCard)}</div>
              )}
            </TabsContent>
            <TabsContent value="unverified" className="mt-4">
              {unverified.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Aucune demande en attente de vérification.</p>
              ) : (
                <div className="grid gap-4">{unverified.map(renderCard)}</div>
              )}
            </TabsContent>
          </Tabs>
        );
      })()}
    </AdminLayout>
  );
}
