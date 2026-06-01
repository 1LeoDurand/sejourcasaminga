import { useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import {
  Home,
  Eye,
  Pencil,
  Calendar,
  Users,
  Plus,
  Heart,
  ClipboardList,
  Sparkles,
  MessageCircle,
  Star,
  UserCircle,
  ShieldCheck,
  Settings,
  LogOut,
  ChevronDown,
  Gift,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { useProfile } from "@/hooks/use-profile";
import { useFavorites } from "@/hooks/use-favorites";
import { useMyConversations } from "@/hooks/use-conversations";
import { useMyExchangeRequests } from "@/hooks/use-exchange-requests";
import { useMyListings } from "@/hooks/use-listings";
import { useUserPreferences } from "@/hooks/use-user-preferences";
import { computeCompletion } from "@/lib/profile-completion";
import { cn } from "@/lib/utils";

type MenuAction = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  to?: string;
  onClick?: () => void;
  badge?: string | number | null;
  badgeVariant?: "default" | "destructive" | "secondary" | "success";
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-4 pt-3 pb-1.5 text-[10px] font-semibold tracking-[0.12em] uppercase text-muted-foreground">
      {children}
    </div>
  );
}

function MenuRow({
  item,
  onSelect,
  indent = false,
}: {
  item: MenuAction;
  onSelect: () => void;
  indent?: boolean;
}) {
  const navigate = useNavigate();
  const Icon = item.icon;
  const handle = () => {
    if (item.onClick) item.onClick();
    else if (item.to) navigate(item.to);
    onSelect();
  };
  return (
    <button
      onClick={handle}
      className={cn(
        "w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground/90 hover:bg-muted/60 transition-colors text-left min-h-[44px] md:min-h-0",
        indent && "pl-9",
      )}
    >
      <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
      <span className="flex-1 truncate">{item.label}</span>
      {item.badge !== null && item.badge !== undefined && item.badge !== 0 && item.badge !== "" && (
        <Badge
          variant={item.badgeVariant === "destructive" ? "destructive" : "secondary"}
          className={cn(
            "h-5 px-1.5 text-[10px] font-medium",
            item.badgeVariant === "destructive" && "animate-pulse",
            item.badgeVariant === "success" && "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
          )}
        >
          {item.badge}
        </Badge>
      )}
    </button>
  );
}

function MenuContent({ close }: { close: () => void }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const userId = user?.id;

  const { data: profile } = useProfile(userId);
  const { data: prefs } = useUserPreferences(userId);
  const { data: myListings } = useMyListings(userId);
  const { data: favorites } = useFavorites(userId);
  const { data: conversations } = useMyConversations(userId);
  const { data: requests } = useMyExchangeRequests(userId);

  const completion = useMemo(
    () =>
      computeCompletion({
        avatar_url: profile?.avatar_url,
        bio: profile?.bio,
        preferred_values: prefs?.preferred_values,
        languages: profile?.languages,
        preferred_regions: prefs?.preferred_regions,
      }),
    [profile, prefs],
  );

  const unreadMessages =
    conversations?.reduce((acc: number, c: any) => acc + (c.unread_count || 0), 0) || 0;

  const pendingRequests =
    requests?.filter((r: any) => ["pending", "accepted", "confirmed"].includes(r.status)).length || 0;

  // Group user's listings by place
  const placeGroups = useMemo(() => {
    if (!myListings) return [];
    const map = new Map<string, { place: any; listings: any[] }>();
    for (const l of myListings as any[]) {
      const p = l.places;
      if (!p) continue;
      if (!map.has(p.id)) map.set(p.id, { place: p, listings: [] });
      map.get(p.id)!.listings.push(l);
    }
    return Array.from(map.values());
  }, [myListings]);

  const handleSignOut = async () => {
    await signOut();
    close();
    navigate("/");
  };

  const discoveryItems: MenuAction[] = [
    { icon: Heart, label: "Maisons favorites", to: "/favorites", badge: favorites?.length || null },
    { icon: ClipboardList, label: "Mes demandes de séjour", to: "/exchanges", badge: pendingRequests || null },
    {
      icon: MessageCircle,
      label: "Mes messages",
      to: "/dashboard?tab=messages",
      badge: unreadMessages || null,
      badgeVariant: unreadMessages > 0 ? "destructive" : "default",
    },
    { icon: Sparkles, label: "Recommandations", to: "/discover" },
    { icon: Star, label: "Mes préférences", to: "/profile/edit" },
  ];

  const profileItems: MenuAction[] = [
    {
      icon: UserCircle,
      label: "Mon profil",
      to: "/profile/edit",
      badge: `${completion.pct}%`,
      badgeVariant: completion.pct >= 80 ? "success" : "default",
    },
    {
      icon: ShieldCheck,
      label: "Vérification",
      to: "/profile/edit",
      badge: completion.pct >= 80 ? "Vérifié" : "À compléter",
      badgeVariant: completion.pct >= 80 ? "success" : "default",
    },
    { icon: Gift, label: "Inviter des amis", to: "/referrals" },
    { icon: Settings, label: "Paramètres", to: "/profile/edit" },
    { icon: LogOut, label: "Déconnexion", onClick: handleSignOut },
  ];

  return (
    <div className="flex flex-col max-h-[80vh] overflow-y-auto">
      {/* Header */}
      <div className="px-4 py-3 border-b">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback>
              {(profile?.display_name || user?.email || "?").slice(0, 1).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{profile?.display_name || "Mon compte"}</div>
            <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
            <span>Profil complété</span>
            <span className="font-medium">{completion.pct}%</span>
          </div>
          <Progress value={completion.pct} className="h-1.5" />
        </div>
      </div>

      {/* Section 1: Habitats */}
      <SectionTitle>
        <span className="inline-flex items-center gap-1.5">
          <Home className="h-3 w-3" /> Mes lieux & logements
        </span>
      </SectionTitle>
      {placeGroups.length === 0 ? (
        <button
          onClick={() => {
            navigate("/places/new");
            close();
          }}
          className="w-full text-left px-4 py-2.5 text-xs text-muted-foreground italic hover:bg-muted/60 min-h-[44px] md:min-h-0"
        >
          Aucun logement enregistré.
        </button>
      ) : (
        placeGroups.map(({ place, listings }) => (
          <div key={place.id} className="pb-1">
            <div className="px-4 pt-1 pb-0.5 text-sm font-medium text-foreground truncate">
              {place.name}
              {place.region && (
                <span className="text-muted-foreground font-normal"> · {place.region}</span>
              )}
            </div>
            <MenuRow
              indent
              item={{ icon: Eye, label: "Voir le lieu", to: `/places/${place.slug || place.id}` }}
              onSelect={close}
            />
            {listings.slice(0, 2).map((l: any) => (
              <MenuRow
                key={l.id}
                indent
                item={{ icon: Pencil, label: `Éditer · ${l.title}`, to: `/listings/${l.id}/edit` }}
                onSelect={close}
              />
            ))}
            <MenuRow
              indent
              item={{ icon: Calendar, label: "Mes disponibilités", to: "/calendar" }}
              onSelect={close}
            />
            <MenuRow
              indent
              item={{
                icon: Users,
                label: "Demandes d'accueil",
                to: "/exchanges",
                badge: pendingRequests || null,
              }}
              onSelect={close}
            />
          </div>
        ))
      )}
      <MenuRow
        item={{ icon: Plus, label: "Ajouter un logement", to: "/listings/new" }}
        onSelect={close}
      />

      <div className="my-1 border-t border-dashed" />

      {/* Section 2: Discovery */}
      <SectionTitle>
        <span className="inline-flex items-center gap-1.5">
          <Heart className="h-3 w-3" /> Mes découvertes & séjours
        </span>
      </SectionTitle>
      {discoveryItems.map((item) => (
        <MenuRow key={item.label} item={item} onSelect={close} />
      ))}

      <div className="my-1 border-t border-dashed" />

      {/* Section 3: Profile */}
      <SectionTitle>
        <span className="inline-flex items-center gap-1.5">
          <UserCircle className="h-3 w-3" /> Mon profil
        </span>
      </SectionTitle>
      {profileItems.map((item) => (
        <MenuRow key={item.label} item={item} onSelect={close} />
      ))}
    </div>
  );
}

export function AccountDropdown() {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const { data: profile } = useProfile(user?.id);
  const { data: conversations } = useMyConversations(user?.id);

  if (!user) return null;

  const unread =
    conversations?.reduce((acc: number, c: any) => acc + (c.unread_count || 0), 0) || 0;

  const Trigger = (
    <button
      className="relative flex items-center gap-1.5 rounded-full hover:bg-muted/60 pl-1 pr-2 py-1 transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
      aria-label="Ouvrir le menu compte"
    >
      <Avatar className="h-8 w-8">
        <AvatarImage src={profile?.avatar_url || undefined} />
        <AvatarFallback className="text-xs">
          {(profile?.display_name || user.email || "?").slice(0, 1).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden sm:block" />
      {unread > 0 && (
        <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-destructive ring-2 ring-background animate-pulse" />
      )}
    </button>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>{Trigger}</DrawerTrigger>
        <DrawerContent className="max-h-[88vh]">
          <div className="pb-4">
            <MenuContent close={() => setOpen(false)} />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>{Trigger}</DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="w-80 p-0 overflow-hidden">
        <MenuContent close={() => setOpen(false)} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default AccountDropdown;
