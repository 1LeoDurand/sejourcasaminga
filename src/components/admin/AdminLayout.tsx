import { ReactNode, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Home,
  BedDouble,
  ShieldCheck,
  FileText,
  Library,
  Users,
  BarChart3,
  Link2,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/use-claim-requests";
import { Button } from "@/components/ui/button";

const items = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard, end: true },
  { title: "Lieux", url: "/admin/places", icon: Home },
  { title: "Séjours", url: "/admin/listings", icon: BedDouble },
  { title: "Revendications", url: "/admin/claims", icon: ShieldCheck },
  { title: "Blog", url: "/admin/blog", icon: FileText },
  { title: "Ressources", url: "/admin/resources", icon: Library },
  { title: "Utilisateurs", url: "/admin/users", icon: Users },
  { title: "Statistiques", url: "/admin/stats", icon: BarChart3 },
  { title: "Liens cassés", url: "/admin/link-checker", icon: Link2 },
];

function AdminSidebar() {
  const { pathname } = useLocation();
  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Casa Minga · Admin</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const active = item.end ? pathname === item.url : pathname.startsWith(item.url);
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={active}>
                      <NavLink to={item.url} end={item.end} className="flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

export default function AdminLayout({ children, title }: { children: ReactNode; title?: string }) {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin(user?.id);

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [loading, user, navigate]);

  if (loading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md text-center px-4">
          <ShieldCheck className="mx-auto h-10 w-10 text-muted-foreground/40 mb-3" />
          <h1 className="font-display text-2xl mb-2">Accès réservé</h1>
          <p className="text-muted-foreground text-sm mb-6">
            Cette zone est réservée aux administrateurs Casa Minga.
          </p>
          <Button variant="outline" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-4 w-4" /> Retour au tableau de bord
          </Button>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center gap-3 border-b bg-card px-4 sticky top-0 z-10">
            <SidebarTrigger />
            <h1 className="font-display text-lg">{title ?? "Admin"}</h1>
            <div className="ml-auto">
              <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
                Retour au site
              </Button>
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6 overflow-x-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
