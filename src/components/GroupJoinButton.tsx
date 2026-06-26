import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { LogIn, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useJoinGroup, useLeaveGroup } from "@/hooks/use-groups";

interface GroupJoinButtonProps {
  groupId: string;
  isMember: boolean;
  size?: "sm" | "default";
  className?: string;
}

/** Join / leave button for a group. Falls back to a sign-in link when logged out. */
export default function GroupJoinButton({
  groupId,
  isMember,
  size = "sm",
  className,
}: GroupJoinButtonProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const join = useJoinGroup();
  const leave = useLeaveGroup();

  if (!user) {
    return (
      <Link to="/auth">
        <Button variant="outline" size={size} className={className}>
          <LogIn className="h-4 w-4" /> {t("groups.loginToJoin")}
        </Button>
      </Link>
    );
  }

  const busy = join.isPending || leave.isPending;

  if (isMember) {
    return (
      <Button
        variant="secondary"
        size={size}
        disabled={busy}
        className={className}
        onClick={() =>
          leave.mutate(groupId, {
            onSuccess: () => toast.success(t("groups.toastLeft")),
            onError: () => toast.error(t("groups.toastError")),
          })
        }
      >
        {t("groups.leave")}
      </Button>
    );
  }

  return (
    <Button
      variant="default"
      size={size}
      disabled={busy}
      className={className}
      onClick={() =>
        join.mutate(groupId, {
          onSuccess: () => toast.success(t("groups.toastJoined")),
          onError: () => toast.error(t("groups.toastError")),
        })
      }
    >
      <Plus className="h-4 w-4" /> {t("groups.join")}
    </Button>
  );
}
