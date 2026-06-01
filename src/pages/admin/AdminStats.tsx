import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  usePublicStats, useRegionDistribution, useAdminTrends, useAdminFunnel, useEmailDeliveryStats, usePopularPlaces,
} from "@/hooks/use-stats";
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import { Home, Users, BedDouble, TrendingUp, Mail } from "lucide-react";

const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--secondary))", "hsl(var(--muted-foreground))"];

export default function AdminStats() {
  const stats = usePublicStats();
  const trends = useAdminTrends();
  const regions = useRegionDistribution();
  const funnel = useAdminFunnel();
  const emails = useEmailDeliveryStats(30);
  const popular = usePopularPlaces(30, 10);

  const fmt = (n: number) => new Intl.NumberFormat("fr-FR").format(n);

  const funnelData = funnel.data ? [
    { stage: "Inscriptions", value: funnel.data.signups },
    { stage: "Ont demandé un séjour", value: funnel.data.requesters },
    { stage: "Séjours confirmés", value: funnel.data.completed },
  ] : [];

  const conversionPct = funnel.data && funnel.data.signups > 0
    ? Math.round((funnel.data.completed / funnel.data.signups) * 100) : 0;

  const emailDeliveryRate = emails.data && emails.data.total > 0
    ? Math.round(((emails.data as any).sent / emails.data.total) * 100) : 0;

  return (
    <AdminLayout title="Statistiques">
      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {[
          { label: "Habitats", value: stats.data?.habitats, icon: Home },
          { label: "Membres", value: stats.data?.members, icon: Users },
          { label: "Séjours", value: stats.data?.stays, icon: BedDouble },
          { label: "Croissance annuelle", value: stats.data ? `+${stats.data.growth_pct}%` : undefined, icon: TrendingUp },
        ].map((c) => {
          const Icon = c.icon;
          return (
            <Card key={c.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm text-muted-foreground">{c.label}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="font-display text-3xl">
                  {c.value === undefined ? <Skeleton className="h-8 w-20" /> : typeof c.value === "number" ? fmt(c.value) : c.value}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Habitats over time */}
        <Card>
          <CardHeader><CardTitle>Nouveaux habitats (12 mois)</CardTitle></CardHeader>
          <CardContent>
            {trends.isLoading ? <Skeleton className="h-64" /> : (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={trends.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" fontSize={11} stroke="hsl(var(--muted-foreground))" />
                  <YAxis fontSize={11} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                  <Line type="monotone" dataKey="habitats" stroke="hsl(var(--primary))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Stays per month */}
        <Card>
          <CardHeader><CardTitle>Demandes de séjour par mois</CardTitle></CardHeader>
          <CardContent>
            {trends.isLoading ? <Skeleton className="h-64" /> : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={trends.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" fontSize={11} stroke="hsl(var(--muted-foreground))" />
                  <YAxis fontSize={11} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                  <Bar dataKey="stays" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Member growth */}
        <Card>
          <CardHeader><CardTitle>Croissance des membres</CardTitle></CardHeader>
          <CardContent>
            {trends.isLoading ? <Skeleton className="h-64" /> : (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={trends.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" fontSize={11} stroke="hsl(var(--muted-foreground))" />
                  <YAxis fontSize={11} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                  <Area type="monotone" dataKey="members" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.2)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Regions */}
        <Card>
          <CardHeader><CardTitle>Distribution régionale</CardTitle></CardHeader>
          <CardContent>
            {regions.isLoading ? <Skeleton className="h-64" /> : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={regions.data} dataKey="count" nameKey="region" outerRadius={90}>
                    {(regions.data ?? []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Conversion funnel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Tunnel de conversion
              <Badge variant="secondary">{conversionPct}%</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {funnel.isLoading ? <Skeleton className="h-64" /> : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={funnelData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <YAxis dataKey="stage" type="category" width={160} stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Email delivery */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Mail className="h-4 w-4" /> Emails (30 derniers jours)</CardTitle>
          </CardHeader>
          <CardContent>
            {emails.isLoading ? <Skeleton className="h-32" /> : (
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs text-muted-foreground">Total</p><p className="font-display text-2xl">{emails.data?.total ?? 0}</p></div>
                <div><p className="text-xs text-muted-foreground">Taux de livraison</p><p className="font-display text-2xl">{emailDeliveryRate}%</p></div>
                <div><p className="text-xs text-muted-foreground">Envoyés</p><p className="text-xl">{(emails.data as any)?.sent ?? 0}</p></div>
                <div><p className="text-xs text-muted-foreground">Échecs</p><p className="text-xl">{(emails.data as any)?.dlq ?? 0}</p></div>
                <div><p className="text-xs text-muted-foreground">Supprimés</p><p className="text-xl">{(emails.data as any)?.suppressed ?? 0}</p></div>
                <div><p className="text-xs text-muted-foreground">En attente</p><p className="text-xl">{(emails.data as any)?.pending ?? 0}</p></div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top habitats */}
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Top 10 habitats (engagement, 30j)</CardTitle></CardHeader>
          <CardContent>
            {popular.isLoading ? <Skeleton className="h-40" /> : (popular.data?.length ?? 0) === 0 ? (
              <p className="text-sm text-muted-foreground">Pas encore de données d'engagement.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-muted-foreground">
                    <tr><th className="py-2">#</th><th>Habitat</th><th>Région</th><th className="text-right">Vues</th><th className="text-right">Favoris</th></tr>
                  </thead>
                  <tbody>
                    {popular.data!.map((p, i) => (
                      <tr key={p.place_id} className="border-t">
                        <td className="py-2">{i + 1}</td>
                        <td>{p.name}</td>
                        <td>{p.region}</td>
                        <td className="text-right">{p.view_count}</td>
                        <td className="text-right">{p.favorite_count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
