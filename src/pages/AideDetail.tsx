import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import SEO, { SITE_URL } from "@/components/SEO";
import AideCorps from "@/components/AideCorps";
import { Button } from "@/components/ui/button";
import {
  fetchAideArticle,
  fetchAideArticles,
  fetchAideCategories,
  getStoredVote,
  incrementAideView,
  storeVote,
  voteAide,
  type AideArticle,
  type AideCategory,
} from "@/lib/aide";
import { AideShell, AideUnavailable } from "./Aide";

/** /aide/:segment is either a category slug or an article slug (same URL shape). */

const Crumbs = ({ items }: { items: { to?: string; label: string }[] }) => (
  <nav aria-label="breadcrumb" className="mb-4 flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
    {items.map((it, i) => (
      <span key={i} className="flex items-center gap-1.5 min-w-0">
        {i > 0 && <span aria-hidden="true">/</span>}
        {it.to ? (
          <Link to={it.to} className="hover:text-foreground">{it.label}</Link>
        ) : (
          <span className="text-foreground break-words">{it.label}</span>
        )}
      </span>
    ))}
  </nav>
);

const Loading = () => (
  <div className="flex justify-center py-24">
    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
  </div>
);

const CategoryView = ({ category, articles }: { category: AideCategory; articles: AideArticle[] }) => {
  const { t } = useTranslation();
  const list = articles.filter((a) => a.categorySlug === category.slug);
  const faq = list.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: list
          .filter((a) => a.excerpt)
          .map((a) => ({
            "@type": "Question",
            name: a.title,
            acceptedAnswer: { "@type": "Answer", text: a.excerpt },
          })),
      }
    : undefined;

  return (
    <>
      <SEO
        title={`${category.label} — ${t("aide.title")} — Casa Minga`}
        description={category.description ?? t("aide.subtitle")}
        canonical={`/aide/${category.slug}`}
        jsonLd={faq && (faq.mainEntity as unknown[]).length ? faq : undefined}
        noindex={list.length === 0}
      />
      <div className="container px-4 py-10 max-w-3xl">
        <Crumbs items={[{ to: "/aide", label: t("aide.title") }, { label: category.label }]} />
        <h1 className="font-serif text-3xl font-bold text-foreground mb-2">{category.label}</h1>
        {category.description && <p className="text-muted-foreground mb-6">{category.description}</p>}
        {list.length === 0 ? (
          <p className="text-muted-foreground">{t("aide.emptyCategory")}</p>
        ) : (
          <ul className="space-y-3">
            {list.map((a) => (
              <li key={a.slug}>
                <Link to={`/aide/${a.slug}`} className="block rounded-lg border bg-card p-4 hover:border-primary/50 transition-colors">
                  <span className="font-semibold text-foreground">{a.title}</span>
                  {a.excerpt && <span className="mt-1 block text-sm text-muted-foreground">{a.excerpt}</span>}
                </Link>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-10 text-sm text-muted-foreground">
          {t("aide.notFound")}{" "}
          <Link to="/contact" className="text-primary underline underline-offset-2">{t("aide.contactUs")}</Link>
        </p>
      </div>
    </>
  );
};

const VoteBox = ({ slug }: { slug: string }) => {
  const { t } = useTranslation();
  const [vote, setVote] = useState<"yes" | "no" | null>(() => getStoredVote(slug));
  const [busy, setBusy] = useState(false);

  const cast = async (v: "yes" | "no") => {
    if (vote || busy) return;
    setBusy(true);
    const ok = await voteAide(slug, v === "yes");
    setBusy(false);
    if (ok) {
      storeVote(slug, v);
      setVote(v);
    }
  };

  return (
    <div className="mt-10 rounded-lg border bg-card p-5 text-center">
      {vote ? (
        <p className="text-sm text-muted-foreground">{t("aide.thanks")}</p>
      ) : (
        <>
          <p className="mb-3 font-medium text-foreground">{t("aide.helpful")}</p>
          <div className="flex justify-center gap-3">
            <Button variant="outline" disabled={busy} onClick={() => cast("yes")}>{t("aide.yes")}</Button>
            <Button variant="outline" disabled={busy} onClick={() => cast("no")}>{t("aide.no")}</Button>
          </div>
        </>
      )}
    </div>
  );
};

const ArticleView = ({
  article,
  category,
  siblings,
}: {
  article: AideArticle;
  category: AideCategory | undefined;
  siblings: AideArticle[];
}) => {
  const { t } = useTranslation();

  useEffect(() => {
    void incrementAideView(article.slug);
  }, [article.slug]);

  const date = new Date(article.updatedAt);
  const dateLabel = Number.isNaN(date.getTime())
    ? null
    : date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

  return (
    <>
      <SEO
        title={`${article.title} — ${t("aide.title")}`}
        description={article.excerpt ?? t("aide.subtitle")}
        canonical={`/aide/${article.slug}`}
        type="article"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: t("aide.title"), item: `${SITE_URL}/aide` },
            ...(category
              ? [{ "@type": "ListItem", position: 2, name: category.label, item: `${SITE_URL}/aide/${category.slug}` }]
              : []),
          ],
        }}
      />
      <article className="container px-4 py-10 max-w-3xl">
        <Crumbs
          items={[
            { to: "/aide", label: t("aide.title") },
            ...(category ? [{ to: `/aide/${category.slug}`, label: category.label }] : []),
            { label: article.title },
          ]}
        />
        <h1 className="font-serif text-3xl font-bold text-foreground mb-2">{article.title}</h1>
        {dateLabel && <p className="mb-6 text-sm text-muted-foreground">{t("aide.updated", { date: dateLabel })}</p>}
        <AideCorps body={article.body} />
        <VoteBox slug={article.slug} />

        {siblings.length > 0 && (
          <section className="mt-10">
            <h2 className="font-serif text-xl font-bold mb-3">{t("aide.related")}</h2>
            <ul className="space-y-2">
              {siblings.map((a) => (
                <li key={a.slug}>
                  <Link to={`/aide/${a.slug}`} className="text-primary underline underline-offset-2">{a.title}</Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <p className="mt-10 text-sm text-muted-foreground">
          {t("aide.notFound")}{" "}
          <Link to="/contact" className="text-primary underline underline-offset-2">{t("aide.contactUs")}</Link>
        </p>
      </article>
    </>
  );
};

const AideDetail = () => {
  const { segment = "" } = useParams<{ segment: string }>();
  const cats = useQuery({ queryKey: ["aide", "categories"], queryFn: fetchAideCategories, retry: false });
  const arts = useQuery({ queryKey: ["aide", "articles"], queryFn: fetchAideArticles, retry: false });
  const category = cats.data?.find((c) => c.slug === segment);
  const listReady = cats.isSuccess && arts.isSuccess;
  const isArticleCandidate = listReady && !category;
  const article = useQuery({
    queryKey: ["aide", "article", segment],
    queryFn: () => fetchAideArticle(segment),
    enabled: isArticleCandidate,
    retry: false,
  });

  let content: React.ReactNode;
  if (cats.isError || arts.isError || article.isError) {
    content = <AideUnavailable />;
  } else if (!listReady) {
    content = <Loading />;
  } else if (category) {
    content = <CategoryView category={category} articles={arts.data ?? []} />;
  } else if (article.isLoading || article.isPending) {
    content = <Loading />;
  } else if (!article.data) {
    // Unknown slug (article not written yet): send people to the help home, not a 404.
    return <Navigate to="/aide" replace />;
  } else {
    const a = article.data;
    const siblings = (arts.data ?? []).filter((x) => x.categorySlug === a.categorySlug && x.slug !== a.slug).slice(0, 5);
    content = (
      <ArticleView
        key={a.slug}
        article={a}
        category={cats.data?.find((c) => c.slug === a.categorySlug)}
        siblings={a.categorySlug ? siblings : []}
      />
    );
  }

  return <AideShell>{content}</AideShell>;
};

export default AideDetail;
