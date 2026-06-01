import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO, { SITE_URL } from "@/components/SEO";
import { useBlogPost } from "@/hooks/use-blog-posts";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BlogBlocks } from "@/components/BlogBlocks";

const stripHtml = (html: string) =>
  html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

/**
 * Editorial post-processing of the stored HTML:
 * 1. Strip the leading <h1> (we render the title ourselves as a hero).
 * 2. Extract the first <p> as a "lead" / chapô.
 * 3. Group the run of (h3 + p[+ p]) blocks inside the
 *    "Les grandes familles de lieux collectifs" section into a card grid.
 * 4. Inject an "À retenir" callout after the values list.
 * 5. Append a CTA block at the end.
 */
const transformContent = (raw: string) => {
  let html = raw;

  // 1. Remove first <h1>...</h1>
  html = html.replace(/<h1\b[^>]*>[\s\S]*?<\/h1>\s*/i, "");

  // 2. Extract first <p> as lead
  let lead = "";
  html = html.replace(/^\s*<p\b[^>]*>([\s\S]*?)<\/p>\s*/i, (_m, inner) => {
    lead = inner;
    return "";
  });

  // 3. Wrap consecutive H3 sections into cards.
  // Match runs of: <h3>...</h3> followed by one or more <p>...</p> (no other tags between).
  // We then split that run on each <h3> to build cards.
  const runRegex =
    /(?:<h3\b[^>]*>[\s\S]*?<\/h3>\s*(?:<p\b[^>]*>[\s\S]*?<\/p>\s*)+)+/g;

  html = html.replace(runRegex, (run) => {
    // Need at least 2 H3 blocks to make a "family grid"
    const h3Count = (run.match(/<h3\b/gi) || []).length;
    if (h3Count < 2) return run;

    // Split into per-H3 chunks
    const cards: string[] = [];
    const chunkRegex =
      /<h3\b[^>]*>([\s\S]*?)<\/h3>\s*((?:<p\b[^>]*>[\s\S]*?<\/p>\s*)+)/g;
    let m: RegExpExecArray | null;
    while ((m = chunkRegex.exec(run)) !== null) {
      const title = m[1].trim();
      const body = m[2].trim();
      cards.push(
        `<div class="editorial-family-card"><h3>${title}</h3>${body}</div>`,
      );
    }
    return `<div class="editorial-family-grid">${cards.join("")}</div>`;
  });

  // 4. Insert "À retenir" callout after the first <ul>...</ul>
  // (which is the values list under "Ce qui relie ces lieux")
  let calloutInserted = false;
  html = html.replace(/<\/ul>/i, (match) => {
    if (calloutInserted) return match;
    calloutInserted = true;
    return `${match}
<aside class="editorial-callout">
  <p class="editorial-callout-title">À retenir</p>
  <p class="editorial-callout-body">Un lieu de collectif n’est pas seulement un habitat partagé. C’est un cadre de confiance où l’on apprend à habiter, décider et coopérer autrement.</p>
</aside>`;
  });

  // 5. Append CTA
  const cta = `
<aside class="editorial-cta">
  <h3>Découvrir d’autres manières d’habiter</h3>
  <p>Casa Minga permet d’échanger sa maison ou son appartement avec des personnes qui partagent une même sensibilité au collectif, à l’écologie et au soin des lieux.</p>
  <a href="/discover">Découvrir Casa Minga</a>
</aside>`;

  return { lead, body: html + cta };
};

const BlogArticle = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading, error } = useBlogPost(slug || "");
  const post = data?.post;
  const blocks = data?.blocks ?? [];
  const hasBlocks = blocks.length > 0;

  const seoTitle = post ? `${post.title} | Blog Casa Minga` : "Article | Blog Casa Minga";
  const seoDesc = post
    ? (post.excerpt || (post.content ? stripHtml(post.content) : "")).slice(0, 155) ||
      "Récit et inspiration autour des habitats participatifs et écolieux."
    : "Récit et inspiration autour des habitats participatifs et écolieux.";

  const articleJsonLd = post
    ? {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: post.title,
        image: post.cover_image ? [post.cover_image] : undefined,
        datePublished: post.published_at || undefined,
        dateModified: post.published_at || undefined,
        author: { "@type": "Organization", name: "Casa Minga" },
        publisher: {
          "@type": "Organization",
          name: "Casa Minga",
          logo: { "@type": "ImageObject", url: `${SITE_URL}/favicon.png` },
        },
        mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
        description: seoDesc,
      }
    : undefined;

  const transformed = !hasBlocks && post?.content ? transformContent(post.content) : null;

  return (
    <div className="min-h-screen flex flex-col bg-[hsl(36,45%,96%)]">
      <SEO
        title={seoTitle}
        description={seoDesc}
        canonical={slug ? `/blog/${slug}` : "/blog"}
        image={post?.cover_image || undefined}
        type="article"
        jsonLd={articleJsonLd}
        noindex={!post && !isLoading}
      />
      <Navbar />
      <main className="flex-1">
        <div className="container max-w-[760px] py-10 md:py-20 px-5 md:px-6">
          <Link to="/blog">
            <Button variant="ghost" size="sm" className="mb-8 gap-1 text-muted-foreground">
              <ArrowLeft className="w-4 h-4" /> Retour au blog
            </Button>
          </Link>

          {isLoading && (
            <div className="space-y-4 animate-pulse">
              <div className="h-10 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-1/3" />
              <div className="h-72 bg-muted rounded" />
            </div>
          )}

          {error && (
            <div className="text-center py-16">
              <p className="text-muted-foreground">Cet article n’existe pas ou n’est plus disponible.</p>
              <Link to="/blog">
                <Button variant="outline" className="mt-4">Voir tous les articles</Button>
              </Link>
            </div>
          )}

          {post && (
            <article className="editorial-article">
              {post.category && (
                <p className="text-xs uppercase tracking-[0.18em] text-[hsl(var(--terracotta))] font-medium mb-4">
                  {post.category}
                </p>
              )}

              <h1>{post.title}</h1>

              {post.published_at && (
                <p className="text-sm text-muted-foreground mb-8 not-prose">
                  {new Date(post.published_at).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              )}

              {post.cover_image && (
                <img
                  src={post.cover_image}
                  alt={post.title}
                  className="w-full rounded-2xl object-cover max-h-[460px] mb-10 shadow-sm"
                />
              )}

              {hasBlocks ? (
                <BlogBlocks blocks={blocks} />
              ) : (
                <>
                  {transformed?.lead && (
                    <p
                      className="editorial-lead"
                      dangerouslySetInnerHTML={{ __html: transformed.lead }}
                    />
                  )}
                  {transformed?.body && (
                    <div dangerouslySetInnerHTML={{ __html: transformed.body }} />
                  )}
                </>
              )}
            </article>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BlogArticle;
