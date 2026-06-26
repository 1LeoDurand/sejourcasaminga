import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Loader2, Users } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Badge } from "@/components/ui/badge";
import { useGroups, useMyGroups, type CommunityGroup } from "@/hooks/use-groups";
import GroupJoinButton from "@/components/GroupJoinButton";

function GroupCard({ group, isMember }: { group: CommunityGroup; isMember: boolean }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border bg-card">
      <Link to={`/groupes/${group.slug}`} className="block">
        {group.cover_image ? (
          <img
            src={group.cover_image}
            alt={group.name}
            loading="lazy"
            className="h-32 w-full object-cover"
          />
        ) : (
          <div className="flex h-32 w-full items-center justify-center bg-gradient-to-br from-primary/15 to-muted">
            <Users className="h-8 w-8 text-primary/40" />
          </div>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <Link to={`/groupes/${group.slug}`} className="min-w-0">
            <h2 className="truncate text-base font-medium text-foreground hover:underline">{group.name}</h2>
          </Link>
          {group.theme && (
            <Badge variant="secondary" className="shrink-0 text-[10px]">{group.theme}</Badge>
          )}
        </div>
        {group.description && (
          <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{group.description}</p>
        )}
        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground">
            {t("groups.members", { count: group.memberCount })}
          </span>
          <GroupJoinButton groupId={group.id} isMember={isMember} />
        </div>
      </div>
    </div>
  );
}

const Groups = () => {
  const { t } = useTranslation();
  const { data: groups, isLoading } = useGroups();
  const { data: myGroups } = useMyGroups();
  const myIds = useMemo(() => new Set((myGroups ?? []).map((g) => g.id)), [myGroups]);

  return (
    <div className="min-h-screen bg-background">
      <SEO title={`${t("groups.pageTitle")} | Casa Minga`} description={t("groups.seoDesc")} canonical="/groupes" />
      <Navbar />

      <div className="container px-5 py-8 max-w-5xl">
        <h1 className="flex items-center gap-2 text-2xl md:text-3xl text-foreground">
          <Users className="h-6 w-6 text-primary" />
          {t("groups.pageTitle")}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{t("groups.intro")}</p>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : !groups || groups.length === 0 ? (
          <div className="mt-8 rounded-xl border border-dashed bg-card px-4 py-12 text-center">
            <p className="text-sm text-muted-foreground">{t("groups.empty")}</p>
          </div>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {groups.map((g) => (
              <GroupCard key={g.id} group={g} isMember={myIds.has(g.id)} />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Groups;
