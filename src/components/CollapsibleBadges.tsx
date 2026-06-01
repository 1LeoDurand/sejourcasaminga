import { useState, ReactNode, Children, cloneElement, isValidElement } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface CollapsibleBadgesProps {
  children: ReactNode;
  /** Max badges visible on mobile before "voir plus" toggle */
  mobileLimit?: number;
  className?: string;
  /** Whether to use short labels on mobile */
  useShortLabels?: boolean;
}

/**
 * Wraps a list of badge children in a flex-wrap container.
 * On mobile, hides extra badges past `mobileLimit` behind a "voir plus" toggle.
 * Optionally uses short labels on mobile if badges have data-short-label attribute.
 */
const CollapsibleBadges = ({
  children,
  mobileLimit = 6,
  className = "flex flex-wrap gap-2",
  useShortLabels = false,
}: CollapsibleBadgesProps) => {
  const isMobile = useIsMobile();
  const [expanded, setExpanded] = useState(false);

  // Transform children to use short labels on mobile if available
  const processedChildren = Children.map(children, (child) => {
    if (!isValidElement(child) || !useShortLabels) return child;
    
    const shortLabel = child.props["data-short-label"];
    if (isMobile && shortLabel) {
      return cloneElement(child, {
        ...child.props,
        children: shortLabel,
      });
    }
    return child;
  });

  const items = Children.toArray(processedChildren);
  const shouldCollapse = isMobile && !expanded && items.length > mobileLimit;
  const visible = shouldCollapse ? items.slice(0, mobileLimit) : items;
  const hiddenCount = items.length - mobileLimit;

  return (
    <div className={className}>
      {visible}
      {shouldCollapse && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="inline-flex items-center rounded-full border border-dashed border-border px-2.5 py-0.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-colors"
        >
          +{hiddenCount} voir plus
        </button>
      )}
      {isMobile && expanded && items.length > mobileLimit && (
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="inline-flex items-center rounded-full border border-dashed border-border px-2.5 py-0.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-colors"
        >
          voir moins
        </button>
      )}
    </div>
  );
};

export default CollapsibleBadges;
