import { BadgeCheck, ShieldCheck, Sparkles, Heart, Gem, type LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useHostTrust } from "@/hooks/use-host-trust";
import { tenureTier, type TenureTier } from "@/lib/badges";
import { cn } from "@/lib/utils";

interface MemberBadgesProps {
  /** Member whose verification status is already known by the caller. */
  verified: boolean | undefined;
  /** ISO creation date of the member's account (for the tenure badge). */
  createdAt: string | null | undefined;
  /** Place ids owned by the member (for the trusted-host badge). */
  placeIds: string[];
}

function BadgePill({
  icon: Icon,
  label,
  title,
  className,
}: {
  icon: LucideIcon;
  label: string;
  title: string;
  className?: string;
}) {
  return (
    <span
      title={title}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium",
        className,
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </span>
  );
}

const TENURE_META: Record<TenureTier, { icon: LucideIcon; key: string; className: string }> = {
  new: { icon: Sparkles, key: "tenureNew", className: "border-border bg-muted text-muted-foreground" },
  loyal: { icon: Heart, key: "tenureLoyal", className: "border-rose-300/40 bg-rose-500/10 text-rose-600 dark:text-rose-400" },
  pillar: { icon: Gem, key: "tenurePillar", className: "border-amber-300/50 bg-amber-500/10 text-amber-700 dark:text-amber-400" },
};

/**
 * Composes the member's earned badges: verified profile, trusted host (item 24)
 * and automatic tenure tier (item 29). Always renders the tenure badge when a
 * creation date is known, so the panel is never empty for a real member.
 */
export function MemberBadges({ verified, createdAt, placeIds }: MemberBadgesProps) {
  const { t } = useTranslation();
  const { data: trust } = useHostTrust(placeIds);
  const tier = tenureTier(createdAt);

  const badges: JSX.Element[] = [];

  if (verified) {
    badges.push(
      <BadgePill
        key="verified"
        icon={BadgeCheck}
        label={t("memberProfile.verifiedBadge")}
        title={t("memberProfile.verifiedBadge")}
        className="border-primary/25 bg-primary/10 text-primary"
      />,
    );
  }

  if (trust?.trusted) {
    badges.push(
      <BadgePill
        key="trusted"
        icon={ShieldCheck}
        label={t("memberProfile.trustedBadge")}
        title={t("memberProfile.trustedBadgeTitle", { count: trust.reviewCount })}
        className="border-emerald-300/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
      />,
    );
  }

  if (tier) {
    const meta = TENURE_META[tier];
    badges.push(
      <BadgePill
        key="tenure"
        icon={meta.icon}
        label={t(`memberProfile.${meta.key}`)}
        title={t(`memberProfile.${meta.key}Title`)}
        className={meta.className}
      />,
    );
  }

  if (badges.length === 0) {
    return (
      <div className="rounded-xl border border-dashed bg-card px-4 py-6 text-center">
        <p className="text-sm text-muted-foreground">{t("memberProfile.soon")}</p>
      </div>
    );
  }

  return <div className="flex flex-wrap gap-2">{badges}</div>;
}

export default MemberBadges;
