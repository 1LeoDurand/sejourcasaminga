import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ExternalLink } from "lucide-react";
import { useResources, type ResourceType } from "@/hooks/use-resources";

const FILTERS: { value: "all" | ResourceType; label: string }[] = [
  { value: "all", label: "Tous" },
  { value: "livre", label: "Livres" },
  { value: "film", label: "Films" },
  { value: "documentaire", label: "Documentaires" },
  { value: "podcast", label: "Podcasts" },
  { value: "article", label: "Articles" },
  { value: "guide", label: "Guides" },
];

const typeLabel: Record<string, string> = {
  livre: "Livre",
  film: "Film",
  documentaire: "Documentaire",
  podcast: "Podcast",
  article: "Article",
  guide: "Guide",
};

const Resources = () => {
  const [filter, setFilter] = useState<"all" | ResourceType>("all");
  const { data: resources, isLoading } = useResources(filter);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO
        title="Ressources Casa Minga — Livres, films, podcasts inspirants"
        description="Une sélection de livres, films, documentaires, podcasts et guides pour explorer l'habitat collectif, l'écologie et les communs."
        canonical="/ressources"
      />
      <Navbar />
      <main className="flex-1">
        <section className="bg-warm py-16 md:py-24">
          <div className="container text-center max-w-2xl">
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
              Ressources
            </h1>
            <p className="text-muted-foreground text-base md:text-lg">
              Une bibliothèque d'inspirations autour de l'habitat collectif, des écolieux et des communs.
            </p>
          </div>
        </section>

        <section className="container py-10 md:py-14">
          <div className="flex flex-wrap gap-2 justify-center mb-10">
            {FILTERS.map((f) => (
              <Button
                key={f.value}
                variant={filter === f.value ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(f.value)}
                className="rounded-full"
              >
                {f.label}
              </Button>
            ))}
          </div>

          {isLoading && (
            <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="overflow-hidden animate-pulse">
                  <div className="w-full h-44 bg-muted" />
                  <CardContent className="p-5 space-y-3">
                    <div className="h-4 bg-muted rounded w-1/3" />
                    <div className="h-5 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!isLoading && (!resources || resources.length === 0) && (
            <div className="text-center py-16 max-w-md mx-auto">
              <BookOpen className="w-10 h-10 text-primary mx-auto mb-4 opacity-60" />
              <p className="text-muted-foreground text-sm">
                Aucune ressource pour le moment dans cette catégorie.
              </p>
            </div>
          )}

          {!isLoading && resources && resources.length > 0 && (
            <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
              {resources.map((r) => {
                const Wrapper: any = r.external_link ? "a" : "div";
                const wrapperProps = r.external_link
                  ? { href: r.external_link, target: "_blank", rel: "noopener noreferrer" }
                  : {};
                return (
                  <Wrapper key={r.id} {...wrapperProps} className="group">
                    <Card className="overflow-hidden flex flex-col h-full transition-shadow group-hover:shadow-md">
                      {r.cover_image && (
                        <img
                          src={r.cover_image}
                          alt={r.title}
                          className="w-full h-44 object-cover"
                          loading="lazy"
                        />
                      )}
                      <CardContent className="flex flex-col flex-1 p-5">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary" className="text-xs">
                            {typeLabel[r.type] || r.type}
                          </Badge>
                          {r.year && (
                            <span className="text-xs text-muted-foreground">{r.year}</span>
                          )}
                        </div>
                        <h2 className="font-serif font-semibold text-lg text-foreground mb-1">
                          {r.title}
                        </h2>
                        {r.author_or_director && (
                          <p className="text-xs text-muted-foreground mb-2 italic">
                            {r.author_or_director}
                          </p>
                        )}
                        {r.description && (
                          <p className="text-sm text-muted-foreground mb-4 flex-1 line-clamp-4">
                            {r.description}
                          </p>
                        )}
                        {r.tags && r.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {r.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="text-[10px] uppercase tracking-wide text-muted-foreground"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                        {r.external_link && (
                          <span className="text-sm font-medium text-primary group-hover:underline inline-flex items-center gap-1 mt-auto">
                            Découvrir <ExternalLink className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </CardContent>
                    </Card>
                  </Wrapper>
                );
              })}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Resources;
