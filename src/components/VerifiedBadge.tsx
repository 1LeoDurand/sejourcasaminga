import { BadgeCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useIsMemberVerified } from "@/hooks/use-verification";
import { cn } from "@/lib/utils";

interface VerifiedBadgeProps {
  /** Member/host whose verification status to display. */
  userId: string | undefined;
  /**
   * "full"  → branded pill with the "Verified profile" label (headers, profile pages)
   * "icon"  → bare check icon, for tight spots like cards/lists
   */
  variant?: "full" | "icon";
  className?: string;
}

/**
 * Reusable "Verified profile" badge. Renders nothing unless the member is
 * verified, so callers can drop it inline without extra guards. The underlying
 * `is_member_verified` query is cached per userId (React Query dedupes), so the
 * same host across many cards triggers a single network call.
 */
export function VerifiedBadge({ userId, variant = "full", className }: VerifiedBadgeProps) {
  const { t } = useTranslation();
  const { data: isVerified } = useIsMemberVerified(userId);

  if (!isVerified) return null;

  if (variant === "icon") {
    return (
      <BadgeCheck
        className={cn("h-4 w-4 shrink-0 text-primary", className)}
        aria-label={t("memberProfile.verifiedBadge")}
      />
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary",
        className,
      )}
    >
      <BadgeCheck className="h-4 w-4" />
      {t("memberProfile.verifiedBadge")}
    </span>
  );
}

export default VerifiedBadge;
