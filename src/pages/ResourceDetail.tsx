import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO, { SITE_URL } from "@/components/SEO";
import ResourceCover from "@/components/ResourceCover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ExternalLink, Loader2, BookOpen } from "lucide-react";
import { useResource, useResources } from "@/hooks/use-resources";

// Build schema.org JSON-LD adapted to the resource type (+ breadcrumb) for rich SEO.
function buildResourceJsonLd(r: {
  slug: string;
  title: string;
  description: string | null;
  type: string;
  author_or_director: string | null;
  year: number | null;
  cover_image: string | null;
}): Record<string, unknown>[] {
  const url = `${SITE_URL}/ressources/${r.slug}`;
  const image = r.cover_image || undefined;
  const person = r.author_or_director
    ? { "@type": "Person", name: r.author_or_director }
    : undefined;

  let main: Record<string, unknown>;
  if (r.type === "film" || r.type === "documentaire") {
    main = {
      "@context": "https://schema.org",
      "@type": "Movie",
      name: r.title,
      description: r.description || undefined,
      url,
      image,
      director: person,
      datePublished: r.year ? String(r.year) : undefined,
      genre: r.type === "documentaire" ? "Documentary" : undefined,
    };
  } else if (r.type === "livre") {
    main = {
      "@context": "https://schema.org",
      "@type": "Book",
      name: r.title,
      description: r.description || undefined,
      url,
      image,
      author: person,
      datePublished: r.year ? String(r.year) : undefined,
    };
  } else if (r.type === "podcast") {
    main = {
      "@context": "https://schema.org",
      "@type": "PodcastSeries",
      name: r.title,
      description: r.description || undefined,
      url,
      image,
      author: person,
    };
  } else {
    main = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: r.title,
      description: r.description || undefined,
      url,
      image,
      mainEntityOfPage: url,
      datePublished: r.year ? `${r.year}-01-01` : undefined,
      author: { "@type": "Organization", name: r.author_or_director || "Casa Minga" },
      publisher: {
        "@type": "Organization",
        name: "Casa Minga",
        logo: { "@type": "ImageObject", url: `${SITE_URL}/favicon.png` },
      },
    };
  }

  const breadcrumb: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Ressources", item: `${SITE_URL}/ressources` },
      { "@type": "ListItem", position: 3, name: r.title, item: url },
    ],
  };

  return [main, breadcrumb];
}

const ResourceDetail = () => {
  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const { data: resource, isLoading } = useResource(slug);
  const { data: sameType } = useResources(resource?.type);
  const similar = (sameType ?? []).filter((x) => x.slug !== resource?.slug).slice(0, 3);
  const typeLabel: Record<string, string> = {
    livre: t("resources.tBook"),
    film: t("resources.tFilm"),
    documentaire: t("resources.tDoc"),
    podcast: t("resources.tPodcast"),
    article: t("resources.tArticle"),
    guide: t("resources.tGuide"),
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <SEO title={`${t("resources.notFoundTitle")} — Casa Minga`} noindex />
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-24">
          <div className="text-center max-w-md px-4">
            <BookOpen className="w-10 h-10 text-primary mx-auto mb-4 opacity-60" />
            <h1 className="font-serif text-2xl text-foreground mb-2">{t("resources.notFoundTitle")}</h1>
            <p className="text-muted-foreground text-sm mb-6">
              {t("resources.notFoundText")}
            </p>
            <Button asChild variant="outline">
              <Link to="/ressources">
                <ArrowLeft className="h-4 w-4" /> {t("resources.backToList")}
              </Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO
        title={`${resource.title} — Ressources Casa Minga`}
        description={resource.description ?? undefined}
        canonical={`/ressources/${resource.slug}`}
        image={resource.cover_image ?? undefined}
        type="article"
        jsonLd={buildResourceJsonLd(resource)}
      />
      <Navbar />
      <main className="flex-1">
        <article className="container max-w-3xl py-10 md:py-14">
          <nav
            aria-label="Fil d'Ariane"
            className="mb-8 flex items-center gap-1.5 text-sm text-muted-foreground"
          >
            <Link to="/" className="hover:text-foreground transition-colors">{t("nav.home")}</Link>
            <span aria-hidden="true">/</span>
            <Link to="/ressources" className="hover:text-foreground transition-colors">{t("resources.breadcrumb")}</Link>
            <span aria-hidden="true">/</span>
            <span className="text-foreground truncate max-w-[12rem]">{resource.title}</span>
          </nav>

          <div className="flex items-center gap-2 mb-3">
            <Badge variant="secondary" className="text-xs">
              {typeLabel[resource.type] || resource.type}
            </Badge>
            {resource.year && (
              <span className="text-sm text-muted-foreground">{resource.year}</span>
            )}
          </div>

          <h1 className="font-serif font-bold text-3xl md:text-4xl text-foreground mb-2">
            {resource.title}
          </h1>
          {resource.author_or_director && (
            <p className="text-muted-foreground italic mb-6">{resource.author_or_director}</p>
          )}

          <ResourceCover
            image={resource.cover_image}
            title={resource.title}
            type={resource.type}
            className="w-full h-72 md:h-96 object-cover rounded-xl mb-8"
          />

          {resource.content ? (
            <div
              className="prose prose-stone max-w-none prose-headings:font-serif prose-h2:text-xl prose-a:text-primary"
              dangerouslySetInnerHTML={{ __html: resource.content }}
            />
          ) : (
            resource.description && (
              <p className="text-foreground/90 leading-relaxed">{resource.description}</p>
            )
          )}

          {resource.tags && resource.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t">
              {resource.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs uppercase tracking-wide text-muted-foreground"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {resource.external_link && (
            <div className="mt-8">
              <Button asChild>
                <a href={resource.external_link} target="_blank" rel="noopener noreferrer">
                  {t("resources.discoverBtn")} <ExternalLink className="w-4 h-4" />
                </a>
              </Button>
            </div>
          )}

          {similar.length > 0 && (
            <section className="mt-14 pt-8 border-t">
              <h2 className="font-serif text-xl text-foreground mb-5">{t("resources.related")}</h2>
              <div className="grid gap-4 sm:grid-cols-3">
                {similar.map((s) => (
                  <Link
                    key={s.id}
                    to={`/ressources/${s.slug}`}
                    className="group rounded-xl border bg-card overflow-hidden transition-shadow hover:shadow-md"
                  >
                    <ResourceCover
                      image={s.cover_image}
                      title={s.title}
                      type={s.type}
                      className="w-full h-28 object-cover"
                    />
                    <p className="p-3 text-sm font-medium text-foreground group-hover:text-primary line-clamp-2">
                      {s.title}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </article>
      </main>
      <Footer />
    </div>
  );
};

export default ResourceDetail;
