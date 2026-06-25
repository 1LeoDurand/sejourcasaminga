import { SITE_URL } from "@/components/SEO";

// ---------------------------------------------------------------------------
// Reusable schema.org JSON-LD builders.
// Pass the result(s) to <SEO jsonLd={...} /> (accepts an object or an array).
// Relative URLs are resolved against SITE_URL; absolute URLs are passed through.
// ---------------------------------------------------------------------------

type LdObject = Record<string, unknown>;

const absUrl = (url: string) => (url.startsWith("http") ? url : `${SITE_URL}${url}`);

/** Ordered breadcrumb trail (Accueil → … → current page). */
export function breadcrumbLd(items: { name: string; url: string }[]): LdObject {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: absUrl(it.url),
    })),
  };
}

/** Article — ready for the future blog (not yet wired anywhere). */
export function articleLd(a: {
  title: string;
  description?: string | null;
  url: string;
  image?: string | null;
  datePublished?: string;
  dateModified?: string;
  /** Person author; falls back to the Casa Minga organization. */
  authorName?: string;
}): LdObject {
  const url = absUrl(a.url);
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.title,
    description: a.description || undefined,
    url,
    mainEntityOfPage: url,
    image: a.image || undefined,
    datePublished: a.datePublished || undefined,
    dateModified: a.dateModified || a.datePublished || undefined,
    author: a.authorName
      ? { "@type": "Person", name: a.authorName }
      : { "@type": "Organization", name: "Casa Minga" },
    publisher: {
      "@type": "Organization",
      name: "Casa Minga",
      logo: { "@type": "ImageObject", url: `${SITE_URL}/favicon.png` },
    },
  };
}

/** FAQ — ready for the future blog / help pages (not yet wired anywhere). */
export function faqLd(qas: { question: string; answer: string }[]): LdObject {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: qas.map((qa) => ({
      "@type": "Question",
      name: qa.question,
      acceptedAnswer: { "@type": "Answer", text: qa.answer },
    })),
  };
}
