import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Compass, Home, LogIn, LayoutDashboard, LogOut } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import logo from "@/assets/logo.png";
import { useAuth } from "@/contexts/AuthContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import AccountDropdown from "@/components/AccountDropdown";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

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
          <Link to="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Blog
          </Link>
          <Link to="/ressources" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Ressources
          </Link>
          <LanguageSwitcher />
          {user ? (
            <AccountDropdown />
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
              { to: "/blog", label: "Blog", icon: Compass },
              { to: "/ressources", label: "Ressources", icon: Compass },
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
