import { useEffect } from "react";

const SITE_URL = "https://www.casaminga.com";
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpg`;
const SITE_NAME = "Casa Minga";

type SEOProps = {
  title?: string;
  description?: string;
  /** Path or absolute URL. Defaults to current location. */
  canonical?: string;
  image?: string;
  type?: "website" | "article";
  /** JSON-LD structured data (object or array). */
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  noindex?: boolean;
};

const FALLBACK_TITLE = "Casa Minga — Voyager au cœur de collectifs vivants";
const FALLBACK_DESC =
  "Casa Minga relie les habitats participatifs, écolieux et colocations durables. Échangez entre foyers vivants et voyagez autrement.";

const truncate = (s: string, max: number) =>
  s.length <= max ? s : s.slice(0, max - 1).trimEnd() + "…";

const upsertMeta = (attr: "name" | "property", key: string, content: string) => {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
};

const upsertLink = (rel: string, href: string) => {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
};

const setJsonLd = (data: SEOProps["jsonLd"]) => {
  // Remove previously injected JSON-LD by this component
  document.head
    .querySelectorAll('script[type="application/ld+json"][data-seo="1"]')
    .forEach((n) => n.remove());
  if (!data) return;
  const arr = Array.isArray(data) ? data : [data];
  arr.forEach((obj) => {
    const s = document.createElement("script");
    s.type = "application/ld+json";
    s.setAttribute("data-seo", "1");
    s.text = JSON.stringify(obj);
    document.head.appendChild(s);
  });
};

const SEO = ({
  title,
  description,
  canonical,
  image,
  type = "website",
  jsonLd,
  noindex = false,
}: SEOProps) => {
  useEffect(() => {
    const finalTitle = truncate(title || FALLBACK_TITLE, 65);
    const finalDesc = truncate(description || FALLBACK_DESC, 165);
    const finalImage = image || DEFAULT_OG_IMAGE;

    const path =
      canonical && canonical.startsWith("http")
        ? canonical
        : `${SITE_URL}${canonical || window.location.pathname}`;

    document.title = finalTitle;
    upsertMeta("name", "description", finalDesc);
    upsertMeta("name", "robots", noindex ? "noindex,nofollow" : "index,follow");

    upsertLink("canonical", path);

    upsertMeta("property", "og:title", finalTitle);
    upsertMeta("property", "og:description", finalDesc);
    upsertMeta("property", "og:type", type);
    upsertMeta("property", "og:url", path);
    upsertMeta("property", "og:image", finalImage);
    upsertMeta("property", "og:site_name", SITE_NAME);
    upsertMeta("property", "og:locale", "fr_FR");

    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", finalTitle);
    upsertMeta("name", "twitter:description", finalDesc);
    upsertMeta("name", "twitter:image", finalImage);

    setJsonLd(jsonLd);
  }, [title, description, canonical, image, type, jsonLd, noindex]);

  return null;
};

export default SEO;
export { SITE_URL, DEFAULT_OG_IMAGE, SITE_NAME };
