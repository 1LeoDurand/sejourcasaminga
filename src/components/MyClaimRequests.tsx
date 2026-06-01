import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Clock, CheckCircle2, XCircle, Home, ChevronRight } from "lucide-react";
import { useMyClaimRequests, ClaimRequest } from "@/hooks/use-claim-requests";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: "En attente", color: "bg-soleil/15 text-soleil-foreground border-soleil/25", icon: Clock },
  approved: { label: "Approuvée", color: "bg-olive/15 text-olive border-olive/25", icon: CheckCircle2 },
  rejected: { label: "Refusée", color: "bg-destructive/10 text-destructive border-destructive/20", icon: XCircle },
};

const MyClaimRequests = ({ userId }: { userId: string }) => {
  const { data: requests, isLoading } = useMyClaimRequests(userId);

  if (isLoading || !requests || requests.length === 0) return null;

  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <ShieldCheck className="h-4 w-4 text-primary" />
        <h3 className="text-base font-serif text-foreground">Mes revendications</h3>
      </div>
      <div className="space-y-3">
        {requests.map((r: ClaimRequest) => {
          const s = statusConfig[r.status] || statusConfig.pending;
          const Icon = s.icon;
          return (
            <Link
              key={r.id}
              to={`/habitat/${r.place_id}`}
              className="flex items-center gap-3 rounded-xl border bg-card p-3 hover:shadow-sm transition-shadow"
            >
              <div className="h-14 w-18 rounded-lg bg-muted overflow-hidden shrink-0 flex items-center justify-center">
                {r.places?.image ? (
                  <img src={r.places.image} alt="" className="h-full w-full object-cover" />
                ) : (
                  <Home className="h-5 w-5 text-muted-foreground/40" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-serif text-sm text-foreground">{r.places?.name || "Lieu"}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Demandé le {format(new Date(r.created_at), "dd MMM yyyy", { locale: fr })}
                </p>
              </div>
              <Badge variant="outline" className={`text-xs shrink-0 gap-1 ${s.color}`}>
                <Icon className="h-3 w-3" /> {s.label}
              </Badge>
              <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0" />
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default MyClaimRequests;
