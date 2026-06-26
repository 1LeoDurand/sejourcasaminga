import { Link } from "react-router-dom";
import { Home as HomeIcon, Users, BedDouble, TrendingUp, Sparkles, Flame, Target, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  usePublicStats, usePopularPlaces, useValueSearchStats, useRegionDistribution, useNewArrivals,
} from "@/hooks/use-stats";
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";

const KPI_ICONS = { habitats: HomeIcon, members: Users, stays: BedDouble, growth: TrendingUp };

const PIE_COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--secondary))", "hsl(var(--muted-foreground))", "hsl(var(--primary) / 0.6)", "hsl(var(--accent) / 0.6)"];

function KpiCard({ icon: Icon, value, label, suffix }: { icon: any; value: number | string; label: string; suffix?: string }) {
  return (
    <Card className="border-primary/10">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="rounded-full bg-primary/10 p-2 text-primary"><Icon className="h-5 w-5" /></div>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
        <p className="font-display text-4xl">{value}{suffix}</p>
      </CardContent>
    </Card>
  );
}

export default function PublicStats() {
  const stats = usePublicStats();
  const popular = usePopularPlaces(30, 5);
  const newArrivals = useNewArrivals(5);
  const values = useValueSearchStats();
  const regions = useRegionDistribution();

  const fmt = (n: number) => new Intl.NumberFormat("fr-FR").format(n);

  return (
    <>
      <SEO title="Casa Minga en chiffres — Notre communauté" description="Découvrez la croissance de Casa Minga : habitats collectifs, membres actifs, séjours, valeurs partagées." />
      <Navbar />
      <main className="min-h-screen bg-background">
        {/* Hero */}
        <section className="border-b bg-gradient-to-b from-primary/5 to-background">
          <div className="container mx-auto px-4 py-12 md:py-20">
            <div className="max-w-2xl mx-auto text-center mb-12">
              <Badge variant="secondary" className="mb-4">Transparence radicale</Badge>
              <h1 className="font-display text-4xl md:text-5xl mb-4">Casa Minga en chiffres</h1>
              <p className="text-lg text-muted-foreground">
                Une communauté grandissante d'habitats collectifs qui s'ouvrent à l'échange et à l'hospitalité.
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
              {stats.isLoading ? (
                Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32" />)
              ) : (
                <>
                  <KpiCard icon={KPI_ICONS.habitats} value={fmt(stats.data?.habitats ?? 0)} label="Habitats" />
                  <KpiCard icon={KPI_ICONS.members} value={fmt(stats.data?.members ?? 0)} label="Membres" />
                  <KpiCard icon={KPI_ICONS.stays} value={fmt(stats.data?.stays ?? 0)} label="Séjours" />
                  <KpiCard icon={KPI_ICONS.growth} value={`+${stats.data?.growth_pct ?? 0}`} suffix="%" label="Croissance annuelle" />
                </>
              )}
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-12 grid lg:grid-cols-2 gap-8">
          {/* Regional distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-2xl">Répartition par région</CardTitle>
            </CardHeader>
            <CardContent>
              {regions.isLoading ? <Skeleton className="h-72" /> : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={regions.data ?? []} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis dataKey="region" type="category" width={120} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Values pie */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-2xl flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" /> Valeurs les plus recherchées
              </CardTitle>
            </CardHeader>
            <CardContent>
              {values.isLoading ? <Skeleton className="h-72" /> : (values.data?.length ?? 0) === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-10">Pas encore assez de données.</p>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={values.data ?? []} dataKey="count" nameKey="value" outerRadius={80} innerRadius={40}>
                        {(values.data ?? []).map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 mt-4">
                    {(values.data ?? []).slice(0, 5).map((v, i) => {
                      const total = (values.data ?? []).reduce((s, x) => s + Number(x.count), 0) || 1;
                      const pct = Math.round((Number(v.count) / total) * 100);
                      return (
                        <div key={v.value}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="capitalize">{v.value.replace(/_/g, " ")}</span>
                            <span className="text-muted-foreground">{pct}%</span>
                          </div>
                          <Progress value={pct} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Popular places */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-2xl flex items-center gap-2">
                <Flame className="h-5 w-5 text-primary" /> Lieux populaires ce mois-ci
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {popular.isLoading ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16" />)
                : (popular.data?.length ?? 0) === 0 ? <p className="text-sm text-muted-foreground">Pas encore de données.</p>
                : popular.data!.map((p, i) => (
                  <Link key={p.place_id} to={`/habitat/${p.place_id}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition">
                    <div className="font-display text-2xl w-8 text-center text-muted-foreground">{i + 1}</div>
                    {p.image && <img src={p.image} alt={p.name} className="h-12 w-12 rounded object-cover" loading="lazy" />}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.region} · {p.view_count} vues · {p.favorite_count} favoris</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                ))}
            </CardContent>
          </Card>

          {/* New arrivals */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-2xl flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" /> Nouvelles arrivées
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {newArrivals.isLoading ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16" />)
                : newArrivals.data!.map((p) => {
                  const days = Math.floor((Date.now() - new Date(p.created_at).getTime()) / 86400000);
                  return (
                    <Link key={p.id} to={`/habitat/${(p as any).slug || p.id}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition">
                      {p.image && <img src={p.image} alt={p.name} className="h-12 w-12 rounded object-cover" loading="lazy" />}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.region} · il y a {days}j</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </Link>
                  );
                })}
              <Link to="/discover" className="text-sm text-primary hover:underline inline-flex items-center gap-1 mt-2">
                Découvrir tous les habitats <ArrowRight className="h-3 w-3" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  );
}
