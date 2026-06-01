import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useBlogPosts } from "@/hooks/use-blog-posts";
import { Feather } from "lucide-react";
import { useTranslation } from "react-i18next";

const Blog = () => {
  const { data: posts, isLoading } = useBlogPosts();
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage?.startsWith("en") ? "en-US" : "fr-FR";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO
        title="Blog Casa Minga — Récits d'habitats participatifs et écolieux"
        description="Histoires, retours d'expérience et inspirations autour des habitats participatifs, écolieux et lieux de vie collective. Le blog de Casa Minga."
        canonical="/blog"
      />
      <Navbar />
      <main className="flex-1">
        <section className="bg-warm py-16 md:py-24">
          <div className="container text-center max-w-2xl">
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">{t("blog.title")}</h1>
            <p className="text-muted-foreground text-base md:text-lg">{t("blog.subtitle")}</p>
          </div>
        </section>

        <section className="container py-12 md:py-16">
          {isLoading && (
            <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="overflow-hidden animate-pulse">
                  <div className="w-full h-48 bg-muted" />
                  <CardContent className="p-5 pt-4 space-y-3">
                    <div className="h-4 bg-muted rounded w-1/3" />
                    <div className="h-5 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!isLoading && (!posts || posts.length === 0) && (
            <div className="text-center py-16 max-w-md mx-auto">
              <Feather className="w-10 h-10 text-primary mx-auto mb-4 opacity-60" />
              <p className="text-muted-foreground text-sm">{t("blog.empty")}</p>
            </div>
          )}

          {!isLoading && posts && posts.length > 0 && (
            <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
              {posts.map((post) => (
                <Link key={post.id} to={`/blog/${post.slug}`} className="group">
                  <Card className="overflow-hidden flex flex-col h-full transition-shadow group-hover:shadow-md">
                    {post.cover_image && (
                      <img src={post.cover_image} alt={post.title} className="w-full h-48 object-cover" loading="lazy" />
                    )}
                    <CardContent className="flex flex-col flex-1 p-5 pt-4">
                      <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
                        {post.category && (
                          <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                            {post.category}
                          </span>
                        )}
                        {post.published_at && (
                          <span>
                            {new Date(post.published_at).toLocaleDateString(locale, {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </span>
                        )}
                      </div>
                      <h2 className="font-serif font-semibold text-lg text-foreground mb-2">{post.title}</h2>
                      {post.excerpt && (
                        <p className="text-sm text-muted-foreground mb-4 flex-1">{post.excerpt}</p>
                      )}
                      <span className="text-sm font-medium text-primary group-hover:underline">
                        {t("common.readArticle")} →
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Blog;
