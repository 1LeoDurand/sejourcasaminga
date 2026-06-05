import { supabase } from "@/integrations/supabase/client";

export type LinkType = "internal" | "external" | "anchor";
export type LinkSeverity = "critical" | "warning" | "info";

export interface LinkInput {
  url: string;
  type: LinkType;
  source_page?: string;
}

export interface LinkResult {
  url: string;
  type: LinkType;
  source_page: string | null;
  status_code: number | null;
  redirect_to: string | null;
  error_message: string | null;
  severity: LinkSeverity;
  suggestion: string | null;
}

/** Application routes declared in src/App.tsx (kept in sync manually). */
export const KNOWN_ROUTES: string[] = [
  "/",
  "/discover",
  "/auth",
  "/dashboard",
  "/onboarding",
  "/create-place",
  "/create-place/quick",
  "/create-listing",
  "/edit-profile",
  "/calendar",
  "/comment-ca-marche",
  "/communaute",
  "/ressources",
  "/a-propos",
  "/hospitalite",
  "/charte",
  "/contact",
  "/admin",
  "/admin/places",
  "/admin/listings",
  "/admin/claims",
  "/admin/resources",
  "/admin/users",
  "/admin/stats",
  "/admin/link-checker",
  "/reset-password",
  "/unsubscribe",
  "/favorites",
  "/stay-requests",
  "/post-stay-review",
  "/map",
  "/statistiques",
  "/referrals",
  "/verify-claim",
];

/** Scan all internal anchor/link references contained in the live DOM. */
export function collectLinksFromDom(rootDocument: Document = document): LinkInput[] {
  const out: LinkInput[] = [];
  const seen = new Set<string>();
  const sourcePage = window.location.pathname;

  rootDocument.querySelectorAll<HTMLAnchorElement>("a[href]").forEach((a) => {
    const href = a.getAttribute("href") ?? "";
    if (!href || href.startsWith("javascript:") || href.startsWith("mailto:") || href.startsWith("tel:")) return;

    let type: LinkType = "external";
    if (href.startsWith("#")) type = "anchor";
    else if (href.startsWith("/") || href.startsWith(window.location.origin)) type = "internal";

    const key = `${type}::${href}`;
    if (seen.has(key)) return;
    seen.add(key);
    out.push({ url: href, type, source_page: sourcePage });
  });

  return out;
}

/** Build the full list of links to scan: known routes + DOM-discovered links. */
export function buildScanList(): LinkInput[] {
  const sourcePage = window.location.pathname;
  const routes: LinkInput[] = KNOWN_ROUTES.map((url) => ({
    url,
    type: "internal" as const,
    source_page: sourcePage,
  }));
  const dom = collectLinksFromDom();
  const map = new Map<string, LinkInput>();
  [...routes, ...dom].forEach((l) => map.set(`${l.type}::${l.url}`, l));
  return [...map.values()];
}

export async function runScan(links: LinkInput[]) {
  const { data, error } = await supabase.functions.invoke("check-links", {
    body: { links, origin: window.location.origin },
  });
  if (error) throw error;
  return data as { scan_id: string; results: LinkResult[]; counts: Record<LinkSeverity | "ok", number> };
}

export function toCsv(rows: LinkResult[]): string {
  const head = ["url", "type", "severity", "status_code", "redirect_to", "source_page", "suggestion", "error_message"];
  const escape = (v: any) => {
    if (v == null) return "";
    const s = String(v).replace(/"/g, '""');
    return /[",\n]/.test(s) ? `"${s}"` : s;
  };
  return [head.join(","), ...rows.map((r) => head.map((k) => escape((r as any)[k])).join(","))].join("\n");
}
