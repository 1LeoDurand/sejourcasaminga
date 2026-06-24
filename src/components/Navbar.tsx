import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Compass, Home, LogIn, LayoutDashboard, LogOut, Bell, MessageSquare, ArrowLeftRight } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import logo from "@/assets/logo.png";
import { useAuth } from "@/contexts/AuthContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ThemeToggle from "@/components/ThemeToggle";
import AccountDropdown from "@/components/AccountDropdown";
import { useRealtimeNotifications } from "@/hooks/use-realtime-notifications";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const { notifications, unreadCount, markAllRead, markRead } = useRealtimeNotifications(user?.id);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 bg-background border-b border-border/40">
      <div className="flex h-14 items-center justify-between px-4 md:px-8 max-w-7xl mx-auto">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <img src={logo} alt="Casa Minga" className="h-9 w-9 rounded-lg object-contain" />
          <span className="font-sans text-lg font-semibold text-foreground tracking-tight">Casa Minga</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/discover" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            {t("nav.explore")}
          </Link>
          <Link to="/comment-ca-marche" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            {t("nav.howItWorks")}
          </Link>
          <Link to="/ressources" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            {t("nav.resources")}
          </Link>
          <LanguageSwitcher />
          <ThemeToggle />
          {user ? (
            <div className="flex items-center gap-2">
              {/* Cloche de notifications */}
              <div className="relative">
                <button
                  onClick={() => { setNotifOpen(!notifOpen); if (!notifOpen && unreadCount > 0) markAllRead(); }}
                  className="relative rounded-full p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                  aria-label={t("notifications.title")}
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 h-4 min-w-4 px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>

                {/* Panneau de notifications */}
                {notifOpen && (
                  <div className="absolute right-0 top-10 w-80 rounded-xl border bg-background shadow-xl z-50 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b">
                      <p className="text-sm font-semibold text-foreground">{t("notifications.title")}</p>
                      {notifications.length > 0 && (
                        <button onClick={markAllRead} className="text-xs text-primary hover:underline">
                          {t("notifications.markAllRead")}
                        </button>
                      )}
                    </div>

                    {notifications.length === 0 ? (
                      <div className="py-10 text-center">
                        <Bell className="mx-auto h-8 w-8 text-muted-foreground/30 mb-2" />
                        <p className="text-sm text-muted-foreground">{t("notifications.empty")}</p>
                      </div>
                    ) : (
                      <div className="divide-y max-h-80 overflow-y-auto">
                        {notifications.slice(0, 10).map((n) => (
                          <div
                            key={n.id}
                            className={`flex items-start gap-3 px-4 py-3 transition-colors ${n.read ? "" : "bg-primary/5"}`}
                            onClick={() => markRead(n.id)}
                          >
                            <div className={`mt-0.5 h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                              n.type === "message" ? "bg-blue-100 text-blue-600" : "bg-amber-100 text-amber-600"
                            }`}>
                              {n.type === "message"
                                ? <MessageSquare className="h-4 w-4" />
                                : <ArrowLeftRight className="h-4 w-4" />
                              }
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground">{n.title}</p>
                              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.body}</p>
                              <p className="text-[10px] text-muted-foreground/70 mt-1">
                                {formatDistanceToNow(n.createdAt, { addSuffix: true, locale: fr })}
                              </p>
                            </div>
                            {!n.read && <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-2" />}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="px-4 py-2 border-t">
                      <Link to="/dashboard?tab=messages" onClick={() => setNotifOpen(false)}
                        className="text-xs text-primary hover:underline">
                        {t("notifications.seeAll")} →
                      </Link>
                    </div>
                  </div>
                )}
              </div>
              <AccountDropdown />
            </div>
          ) : (
            <>
              <Link to="/auth">
                <Button variant="ghost" size="sm" className="text-sm">{t("common.signIn")}</Button>
              </Link>
              <Link to="/auth?tab=signup">
                <Button size="sm" className="text-sm font-medium">{t("common.signUpFree")}</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile */}
        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <LanguageSwitcher compact />
          {user ? (
            <AccountDropdown />
          ) : (
            <Link to="/auth?tab=signup">
              <Button size="sm" className="text-xs h-8 px-4 rounded-full font-medium">{t("common.signUp")}</Button>
            </Link>
          )}
          <button onClick={() => setOpen(!open)} className="p-2 text-foreground" aria-label="Menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t bg-background px-4 py-5 animate-fade-in">
          <div className="flex flex-col gap-1">
            {[
              { to: "/", label: t("nav.home"), icon: Home },
              { to: "/discover", label: t("nav.exploreStays"), icon: Compass },
              { to: "/comment-ca-marche", label: t("nav.howItWorks"), icon: Compass },
              { to: "/ressources", label: t("nav.resources"), icon: Compass },
              ...(user ? [{ to: "/dashboard", label: t("common.myAccount"), icon: LayoutDashboard }] : []),
            ].map((link) => (
              <Link key={link.to} to={link.to} onClick={() => setOpen(false)}>
                <Button variant={location.pathname === link.to ? "secondary" : "ghost"} className="w-full justify-start h-11" size="sm">
                  <link.icon className="mr-2.5 h-4 w-4" />
                  {link.label}
                </Button>
              </Link>
            ))}
            <div className="my-3 border-t" />
            {user ? (
              <Button variant="outline" className="w-full h-11" size="sm" onClick={() => { handleSignOut(); setOpen(false); }}>
                <LogOut className="mr-2 h-4 w-4" />
                {t("common.signOut")}
              </Button>
            ) : (
              <>
                <Link to="/auth" onClick={() => setOpen(false)}>
                  <Button variant="outline" className="w-full h-11" size="sm">
                    <LogIn className="mr-2 h-4 w-4" />
                    {t("common.signIn")}
                  </Button>
                </Link>
                <Link to="/auth?tab=signup" onClick={() => setOpen(false)}>
                  <Button className="w-full h-11 mt-1.5" size="sm">{t("common.signUpFree")}</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
