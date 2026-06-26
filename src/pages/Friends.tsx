import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Loader2, Check, X, UserMinus, Users } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  useFriends,
  usePendingRequests,
  useRespondFriendRequest,
  useRemoveFriend,
  type FriendProfile,
} from "@/hooks/use-friends";

function MemberRow({
  userId,
  profile,
  children,
}: {
  userId: string;
  profile: FriendProfile;
  children?: React.ReactNode;
}) {
  const { t } = useTranslation();
  const name = profile.display_name || t("memberProfile.member");
  const avatar =
    profile.avatar_url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
  return (
    <div className="flex items-center gap-3 rounded-xl border bg-card p-3">
      <Avatar className="h-11 w-11 shrink-0">
        <AvatarImage src={avatar} alt={name} />
        <AvatarFallback>{name.slice(0, 1).toUpperCase()}</AvatarFallback>
      </Avatar>
      <Link to={`/membre/${userId}`} className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground hover:underline">{name}</p>
      </Link>
      <div className="flex shrink-0 items-center gap-2">{children}</div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed bg-card px-4 py-8 text-center">
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

const Friends = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const { data: friends, isLoading: loadingFriends } = useFriends();
  const { data: pending, isLoading: loadingPending } = usePendingRequests();
  const respond = useRespondFriendRequest();
  const remove = useRemoveFriend();

  // Connected only.
  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [loading, user, navigate]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container px-5 py-20 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  const incoming = pending?.incoming ?? [];
  const outgoing = pending?.outgoing ?? [];
  const busy = respond.isPending || remove.isPending;

  return (
    <div className="min-h-screen bg-background">
      <SEO title={`${t("friends.pageTitle")} | Casa Minga`} description={t("friends.seoDesc")} canonical="/amis" noindex />
      <Navbar />

      <div className="container px-5 py-8 max-w-3xl">
        <h1 className="flex items-center gap-2 text-2xl md:text-3xl text-foreground">
          <Users className="h-6 w-6 text-primary" />
          {t("friends.pageTitle")}
        </h1>

        {/* Incoming requests */}
        <section className="mt-8">
          <h2 className="mb-3 text-lg text-foreground">{t("friends.incomingTitle")}</h2>
          {loadingPending ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : incoming.length === 0 ? (
            <EmptyState text={t("friends.emptyIncoming")} />
          ) : (
            <div className="space-y-2">
              {incoming.map((r) => (
                <MemberRow key={r.friendshipId} userId={r.userId} profile={r.profile}>
                  <Button
                    variant="default"
                    size="sm"
                    disabled={busy}
                    onClick={() =>
                      respond.mutate(
                        { id: r.friendshipId, accept: true },
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
                    disabled={busy}
                    onClick={() =>
                      respond.mutate(
                        { id: r.friendshipId, accept: false },
                        {
                          onSuccess: () => toast.success(t("friends.toastDeclined")),
                          onError: () => toast.error(t("friends.toastError")),
                        },
                      )
                    }
                  >
                    <X className="h-4 w-4" /> {t("friends.decline")}
                  </Button>
                </MemberRow>
              ))}
            </div>
          )}
        </section>

        {/* My friends */}
        <section className="mt-8">
          <h2 className="mb-3 text-lg text-foreground">{t("friends.myFriendsTitle")}</h2>
          {loadingFriends ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : !friends || friends.length === 0 ? (
            <EmptyState text={t("friends.emptyFriends")} />
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {friends.map((f) => (
                <MemberRow key={f.friendshipId} userId={f.userId} profile={f.profile}>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={busy}
                    onClick={() =>
                      remove.mutate(f.userId, {
                        onSuccess: () => toast.success(t("friends.toastRemoved")),
                        onError: () => toast.error(t("friends.toastError")),
                      })
                    }
                  >
                    <UserMinus className="h-4 w-4" /> {t("friends.remove")}
                  </Button>
                </MemberRow>
              ))}
            </div>
          )}
        </section>

        {/* Outgoing requests */}
        {outgoing.length > 0 && (
          <section className="mt-8">
            <h2 className="mb-3 text-lg text-foreground">{t("friends.outgoingTitle")}</h2>
            <div className="space-y-2">
              {outgoing.map((r) => (
                <MemberRow key={r.friendshipId} userId={r.userId} profile={r.profile}>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={busy}
                    onClick={() =>
                      remove.mutate(r.userId, {
                        onSuccess: () => toast.success(t("friends.toastRemoved")),
                        onError: () => toast.error(t("friends.toastError")),
                      })
                    }
                  >
                    <X className="h-4 w-4" /> {t("friends.cancel")}
                  </Button>
                </MemberRow>
              ))}
            </div>
          </section>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Friends;
