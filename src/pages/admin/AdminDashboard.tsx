import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Home, BedDouble, Users, ShieldCheck, FileText, Library, Loader2 } from "lucide-react";

function useCount(label: string, queryFn: () => Promise<number>) {
  return useQuery({ queryKey: ["admin-count", label], queryFn });
}

export default function AdminDashboard() {
  const places = useCount("places", async () => {
    const { count } = await supabase.from("places").select("*", { count: "exact", head: true });
    return count ?? 0;
  });
  const listings = useCount("listings", async () => {
    const { count } = await supabase.from("listings").select("*", { count: "exact", head: true });
    return count ?? 0;
  });
  const users = useCount("users", async () => {
    const { count } = await supabase.from("profiles").select("*", { count: "exact", head: true });
    return count ?? 0;
  });
  const claims = useCount("claims", async () => {
    const { count } = await supabase
      .from("place_claim_requests" as any)
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");
    return count ?? 0;
  });
  const posts = useCount("posts", async () => {
    const { count } = await supabase
      .from("blog_posts")
      .select("*", { count: "exact", head: true })
      .eq("is_published", true);
    return count ?? 0;
  });
  const resources = useCount("resources", async () => {
    const { count } = await supabase
      .from("resources")
      .select("*", { count: "exact", head: true })
      .eq("is_published", true);
    return count ?? 0;
  });

  const cards = [
    { label: "Lieux", value: places.data, icon: Home },
    { label: "Séjours", value: listings.data, icon: BedDouble },
    { label: "Utilisateurs", value: users.data, icon: Users },
    { label: "Revendications en attente", value: claims.data, icon: ShieldCheck, accent: true },
    { label: "Articles publiés", value: posts.data, icon: FileText },
    { label: "Ressources publiées", value: resources.data, icon: Library },
  ];

  return (
    <AdminLayout title="Tableau de bord">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Card key={c.label} className={c.accent ? "border-primary/40" : ""}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {c.label}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-display">
                  {c.value === undefined ? <Loader2 className="h-5 w-5 animate-spin" /> : c.value}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </AdminLayout>
  );
}
