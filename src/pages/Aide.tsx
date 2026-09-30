import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Search } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Input } from "@/components/ui/input";
import { fetchAideArticles, fetchAideCategories, searchAide } from "@/lib/aide";

export const AideShell = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen flex flex-col bg-background overflow-x-hidden">
    <Navbar />
    <main className="flex-1">{children}</main>
    <Footer />
  </div>
);

export const AideUnavailable = () => {
  const { t } = useTranslation();
  return (
    <section className="container px-4 py-16 text-center max-w-xl">
      <h2 className="font-serif text-2xl font-bold mb-2">{t("aide.unavailableTitle")}</h2>
      <p className="text-muted-foreground mb-6">{t("aide.unavailableText")}</p>
      <Link to="/contact" className="text-primary underline underline-offset-2">{t("aide.contactUs")}</Link>
    </section>
  );
};

const Aide = () => {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const cats = useQuery({ queryKey: ["aide", "categories"], queryFn: fetchAideCategories, retry: false });
  const arts = useQuery({ queryKey: ["aide", "articles"], queryFn: fetchAideArticles, retry: false });

  const loading = cats.isLoading || arts.isLoading;
  const failed = cats.isError || arts.isError;
  const categories = cats.data ?? [];
  const articles = arts.data ?? [];
  const empty = !loading && !failed && articles.length === 0;

  const results = useMemo(() => searchAide(articles, query), [articles, query]);
  const popular = useMemo(
    () =>
      [...articles]
        .filter((a) => a.viewCount > 0)
        .sort((a, b) => b.viewCount - a.viewCount)
        .slice(0, 5),
    [articles],
  );
  const countByCat = useMemo(() => {
    const m = new Map<string, number>();
    for (const a of articles) if (a.categorySlug) m.set(a.categorySlug, (m.get(a.categorySlug) ?? 0) + 1);
    return m;
  }, [articles]);

  return (
    <AideShell>
      <SEO
        title={`${t("aide.title")} — Casa Minga`}
        description={t("aide.subtitle")}
        canonical="/aide"
        noindex={failed || empty}
      />
      <section className="bg-warm py-12 md:py-20">
        <div className="container px-4 text-center max-w-2xl">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-3">{t("aide.title")}</h1>
          <p className="text-muted-foreground mb-6">{t("aide.subtitle")}</p>
          {!failed && (
            <div className="relative max-w-lg mx-auto">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("aide.searchPlaceholder")}
                aria-label={t("aide.searchPlaceholder")}
                className="pl-9"
              />
            </div>
          )}
        </div>
      </section>

      {loading && (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {failed && <AideUnavailable />}

      {empty && (
        <section className="container px-4 py-16 text-center max-w-xl text-muted-foreground">
          {t("aide.empty")}
        </section>
      )}

      {!loading && !failed && !empty && (
        <div className="container px-4 py-10 max-w-4xl space-y-10">
          {query.trim() ? (
            <section aria-live="polite">
              <h2 className="font-serif text-xl font-bold mb-4">
                {t("aide.results", { count: results.length })}
              </h2>
              {results.length === 0 ? (
                <p className="text-muted-foreground">{t("aide.noResults")}</p>
              ) : (
                <ul className="space-y-3">
                  {results.map((a) => (
                    <li key={a.slug}>
                      <Link to={`/aide/${a.slug}`} className="block rounded-lg border bg-card p-4 hover:border-primary/50 transition-colors">
                        <span className="font-semibold text-foreground">{a.title}</span>
                        {a.excerpt && <span className="mt-1 block text-sm text-muted-foreground">{a.excerpt}</span>}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ) : (
            <>
              <section>
                <div className="grid gap-4 sm:grid-cols-2">
                  {categories.map((c) => (
                    <Link
                      key={c.slug}
                      to={`/aide/${c.slug}`}
                      className="rounded-lg border bg-card p-5 hover:border-primary/50 transition-colors"
                    >
                      <h2 className="font-serif text-lg font-bold text-foreground">{c.label}</h2>
                      {c.description && <p className="mt-1 text-sm text-muted-foreground">{c.description}</p>}
                      <p className="mt-3 text-xs text-muted-foreground">
                        {t("aide.articleCount", { count: countByCat.get(c.slug) ?? 0 })}
                      </p>
                    </Link>
                  ))}
                </div>
              </section>

              {popular.length > 0 && (
                <section>
                  <h2 className="font-serif text-xl font-bold mb-4">{t("aide.popular")}</h2>
                  <ul className="divide-y rounded-lg border bg-card">
                    {popular.map((a) => (
                      <li key={a.slug}>
                        <Link to={`/aide/${a.slug}`} className="block px-4 py-3 hover:bg-muted/50 transition-colors">
                          {a.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </>
          )}

          <p className="text-center text-sm text-muted-foreground">
            {t("aide.notFound")}{" "}
            <Link to="/contact" className="text-primary underline underline-offset-2">{t("aide.contactUs")}</Link>
          </p>
        </div>
      )}
    </AideShell>
  );
};

export default Aide;
