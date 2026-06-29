import { faqLd } from "@/lib/structured-data";

// ---------------------------------------------------------------------------
// Extracts an FAQ from a resource's `content` HTML and turns it into a
// schema.org FAQPage JSON-LD object (big AEO/GEO win for answer engines).
//
// Convention in the content: an <h2> whose text is "Questions fréquentes"
// (FR) — accent/case-insensitive, a few common variants accepted — followed
// by <h3>question</h3> blocks, each answered by the nodes up to the next
// <h3>/<h2>. Parsing uses DOMParser (browser + jsdom in tests), never a
// brittle regex.
// ---------------------------------------------------------------------------

const FAQ_HEADINGS = [
  "questions frequentes",
  "foire aux questions",
  "faq",
  "frequently asked questions",
  "preguntas frecuentes",
];

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export type FaqPair = { question: string; answer: string };

/** Collect question/answer pairs from the FAQ section of an HTML string. */
export function extractFaqPairs(html: string | null | undefined): FaqPair[] {
  if (!html || typeof DOMParser === "undefined") return [];

  const doc = new DOMParser().parseFromString(html, "text/html");
  const faqH2 = Array.from(doc.querySelectorAll("h2")).find((h) =>
    FAQ_HEADINGS.includes(normalize(h.textContent || "")),
  );
  if (!faqH2) return [];

  const pairs: FaqPair[] = [];
  let current: { question: string; parts: string[] } | null = null;

  for (let node = faqH2.nextElementSibling; node && node.tagName !== "H2"; node = node.nextElementSibling) {
    if (node.tagName === "H3") {
      if (current) pairs.push({ question: current.question, answer: current.parts.join(" ").trim() });
      current = { question: (node.textContent || "").trim(), parts: [] };
    } else if (current) {
      const txt = (node.textContent || "").replace(/\s+/g, " ").trim();
      if (txt) current.parts.push(txt);
    }
  }
  if (current) pairs.push({ question: current.question, answer: current.parts.join(" ").trim() });

  return pairs.filter((p) => p.question && p.answer);
}

/** Build a FAQPage JSON-LD object from HTML content, or null if no FAQ found. */
export function faqJsonLdFromHtml(
  html: string | null | undefined,
): Record<string, unknown> | null {
  const pairs = extractFaqPairs(html);
  if (pairs.length === 0) return null;
  return faqLd(pairs) as Record<string, unknown>;
}
