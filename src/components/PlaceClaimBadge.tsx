import { Badge } from "@/components/ui/badge";
import { Import, Clock, ShieldCheck, BadgeCheck } from "lucide-react";

interface Props {
  claimStatus: string;
  isImported: boolean;
}

const PlaceClaimBadge = ({ claimStatus, isImported }: Props) => {
  if (claimStatus === "verified") {
    return (
      <Badge className="bg-olive/15 text-olive border-olive/25 gap-1">
        <BadgeCheck className="h-3 w-3" /> Lieu vérifié
      </Badge>
    );
  }

  if (claimStatus === "claimed") {
    return (
      <Badge className="bg-primary/10 text-primary border-primary/20 gap-1">
        <ShieldCheck className="h-3 w-3" /> Fiche revendiquée
      </Badge>
    );
  }

  if (claimStatus === "claim_pending") {
    return (
      <Badge variant="outline" className="bg-soleil/10 text-soleil-foreground border-soleil/25 gap-1">
        <Clock className="h-3 w-3" /> Revendication en cours
      </Badge>
    );
  }

  if (isImported) {
    return (
      <Badge variant="outline" className="bg-muted text-muted-foreground gap-1">
        <Import className="h-3 w-3" /> Fiche importée
      </Badge>
    );
  }

  return null;
};

export default PlaceClaimBadge;
