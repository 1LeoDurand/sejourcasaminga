// Pulls the leading "TL;DR — …" paragraph out of a resource's `content` HTML so
// ResourceDetail can render it as a friendly "L'essentiel" callout instead of a
// cryptic inline TL;DR. The text stays unchanged in the DB; we only re-present it.

const TLDR_RE = /^\s*tl\s*;?\s*dr\b\s*[—:–-]*\s*/i;

export type SummarySplit = { summary: string | null; content: string };

/**
 * Extract the first paragraph starting with "TL;DR" (case-insensitive).
 * Returns the cleaned summary text (label stripped) and the content with that
 * paragraph removed. If none is found (or no DOMParser), returns the content as-is.
 */
export function extractSummary(html: string | null | undefined): SummarySplit {
  if (!html) return { summary: null, content: html ?? "" };
  if (typeof DOMParser === "undefined") return { summary: null, content: html };

  const doc = new DOMParser().parseFromString(html, "text/html");
  for (const p of Array.from(doc.querySelectorAll("p"))) {
    const txt = (p.textContent || "").replace(/\s+/g, " ").trim();
    if (TLDR_RE.test(txt)) {
      const summary = txt.replace(TLDR_RE, "").trim();
      if (!summary) return { summary: null, content: html };
      p.remove();
      return { summary, content: doc.body.innerHTML };
    }
  }
  return { summary: null, content: html };
}
