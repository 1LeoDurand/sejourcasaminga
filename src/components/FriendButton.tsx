import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { UserPlus, UserCheck, Check, X, Clock, UserMinus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import {
  useFriendshipStatus,
  usePendingRequests,
  useSendFriendRequest,
  useRespondFriendRequest,
  useRemoveFriend,
} from "@/hooks/use-friends";

interface FriendButtonProps {
  userId: string | undefined;
  className?: string;
}

/** Friendship action button shown on another member's profile. */
export default function FriendButton({ userId, className }: FriendButtonProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data: status, isLoading } = useFriendshipStatus(userId);
  const { data: pending } = usePendingRequests();
  const send = useSendFriendRequest();
  const respond = useRespondFriendRequest();
  const remove = useRemoveFriend();

  // Hidden when logged out or viewing your own profile.
  if (!user || !userId || userId === user.id) return null;
  if (isLoading || !status) {
    return (
      <Button variant="secondary" size="sm" disabled className={className}>
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    );
  }

  const busy = send.isPending || respond.isPending || remove.isPending;

  if (status === "blocked") return null;

  if (status === "none") {
    return (
      <Button
        variant="default"
        size="sm"
        className={className}
        disabled={busy}
        onClick={() =>
          send.mutate(userId, {
            onSuccess: () => toast.success(t("friends.toastSent")),
            onError: () => toast.error(t("friends.toastError")),
          })
        }
      >
        <UserPlus className="h-4 w-4" /> {t("friends.add")}
      </Button>
    );
  }

  if (status === "pending_outgoing") {
    return (
      <Button variant="secondary" size="sm" disabled className={className}>
        <Clock className="h-4 w-4" /> {t("friends.requestSent")}
      </Button>
    );
  }

  if (status === "pending_incoming") {
    const requestId = pending?.incoming.find((r) => r.userId === userId)?.friendshipId;
    return (
      <div className={`flex items-center gap-2 ${className ?? ""}`}>
        <Button
          variant="default"
          size="sm"
          disabled={busy || !requestId}
          onClick={() =>
            requestId &&
            respond.mutate(
              { id: requestId, accept: true },
              {
                onSuccess: () => toast.success(t("friends.toastAccepted")),
                onError: () => toast.error(t("friends.toastError")),
              },
            )
          }
        >
          <Check className="h-4 w-4" /> {t("friends.accept")}
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={busy || !requestId}
          onClick={() =>
            requestId &&
            respond.mutate(
              { id: requestId, accept: false },
              {
                onSuccess: () => toast.success(t("friends.toastDeclined")),
                onError: () => toast.error(t("friends.toastError")),
              },
            )
          }
        >
          <X className="h-4 w-4" /> {t("friends.decline")}
        </Button>
      </div>
    );
  }

  // status === "friends"
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" size="sm" disabled={busy} className={className}>
          <UserCheck className="h-4 w-4" /> {t("friends.friends")}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={() =>
            remove.mutate(userId, {
              onSuccess: () => toast.success(t("friends.toastRemoved")),
              onError: () => toast.error(t("friends.toastError")),
            })
          }
        >
          <UserMinus className="h-4 w-4" /> {t("friends.remove")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
