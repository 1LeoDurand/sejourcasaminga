import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Loader2, Users, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { breadcrumbLd } from "@/lib/structured-data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useGroup, useGroupMembers, useIsGroupMember } from "@/hooks/use-groups";
import GroupJoinButton from "@/components/GroupJoinButton";

const GroupDetail = () => {
  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const { data: group, isLoading } = useGroup(slug);
  const { data: members } = useGroupMembers(group?.id);
  const { data: isMember } = useIsGroupMember(group?.id);

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

  if (!group) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container px-5 py-20 text-center">
          <h1 className="text-2xl text-foreground">{t("groups.notFound")}</h1>
          <Link to="/groupes" className="mt-4 inline-block text-primary underline">
            {t("groups.back")}
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={`${group.name} | Casa Minga`}
        description={group.description || t("groups.seoDesc")}
        canonical={`/groupes/${group.slug}`}
        image={group.cover_image || undefined}
        jsonLd={breadcrumbLd([
          { name: "Accueil", url: "/" },
          { name: t("groups.pageTitle"), url: "/groupes" },
          { name: group.name, url: `/groupes/${group.slug}` },
        ])}
      />
      <Navbar />

      <div className="container px-5 py-8 max-w-3xl">
        <Link
          to="/groupes"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> {t("groups.back")}
        </Link>

        {/* Header */}
        <div className="mt-4 overflow-hidden rounded-2xl border bg-card">
          {group.cover_image ? (
            <img src={group.cover_image} alt={group.name} className="h-44 w-full object-cover" />
          ) : (
            <div className="flex h-44 w-full items-center justify-center bg-gradient-to-br from-primary/15 to-muted">
              <Users className="h-10 w-10 text-primary/40" />
            </div>
          )}
          <div className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl text-foreground">{group.name}</h1>
                  {group.theme && <Badge variant="secondary" className="text-xs">{group.theme}</Badge>}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("groups.members", { count: group.memberCount })}
                </p>
              </div>
              <GroupJoinButton groupId={group.id} isMember={!!isMember} size="default" />
            </div>
            {group.description && (
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {group.description}
              </p>
            )}
          </div>
        </div>

        {/* Members */}
        <div className="mt-8">
          <h2 className="mb-4 text-lg text-foreground">{t("groups.membersTitle")}</h2>
          {!members || members.length === 0 ? (
            <div className="rounded-xl border border-dashed bg-card px-4 py-8 text-center">
              <p className="text-sm text-muted-foreground">{t("groups.noMembers")}</p>
            </div>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {members.map((m) => {
                const name = m.profile.display_name || t("memberProfile.member");
                const avatar =
                  m.profile.avatar_url ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
                return (
                  <Link
                    key={m.userId}
                    to={`/membre/${m.userId}`}
                    className="flex items-center gap-3 rounded-xl border bg-card p-3 hover:bg-muted/40 transition-colors"
                  >
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarImage src={avatar} alt={name} />
                      <AvatarFallback>{name.slice(0, 1).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{name}</p>
                      {m.role === "admin" && (
                        <span className="text-xs text-primary">admin</span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default GroupDetail;
