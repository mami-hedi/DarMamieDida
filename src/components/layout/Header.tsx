import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

import flagFR from "@/assets/flags/fr.png";
import flagEN from "@/assets/flags/enn.jpg";


const navigation = [
  { key: "nav.home", href: "/" },
  { key: "nav.about", href: "/a-propos" },
  { key: "nav.gallery", href: "/galerie" },
  { key: "nav.services", href: "/services" },
  { key: "nav.rooms", href: "/chambres" },
  { key: "nav.contact", href: "/contact" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng: "fr" | "en") => {
    i18n.changeLanguage(lng);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <nav className="container-custom flex items-center justify-between py-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <span className="font-display text-2xl font-semibold tracking-wide text-foreground">
            Dar Mamie <span className="text-primary">Dida</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navigation.map((item) => (
            <Link
              key={item.key}
              to={item.href}
              className={cn(
                "font-body text-sm font-medium tracking-wide transition-colors hover:text-primary",
                location.pathname === item.href
                  ? "text-primary"
                  : "text-foreground"
              )}
            >
              {t(item.key)}
            </Link>
          ))}

          <Button asChild variant="default" size="sm">
            <Link to="/disponibilite">{t("nav.availability")}</Link>
          </Button>

          {/* Language Flags Desktop */}
          <div className="flex items-center gap-2 ml-4">
  <button
    onClick={() => changeLanguage("fr")}
    title="Français"
    className="hover:scale-110 transition-transform"
  >
    <img src={flagFR} alt="FR" className="w-6 h-6 rounded-sm shadow-sm" />
  </button>
  <button
    onClick={() => changeLanguage("en")}
    title="English"
    className="hover:scale-110 transition-transform"
  >
    <img src={flagEN} alt="EN" className="w-6 h-6 rounded-sm shadow-sm" />
  </button>
</div>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6 text-foreground" />
          ) : (
            <Menu className="h-6 w-6 text-foreground" />
          )}
        </button>
      </nav>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-background border-b border-border">
          <div className="container-custom py-4 flex flex-col gap-4">
            {navigation.map((item) => (
              <Link
                key={item.key}
                to={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "font-body text-base font-medium tracking-wide transition-colors hover:text-primary py-2",
                  location.pathname === item.href
                    ? "text-primary"
                    : "text-foreground"
                )}
              >
                {t(item.key)}
              </Link>
            ))}

            <Button asChild variant="default" className="mt-2">
              <Link
                to="/disponibilite"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t("nav.availability")}
              </Link>
            </Button>

            {/* Language Flags Mobile */}
            <div className="flex items-center gap-4 mt-4">
  <button
    onClick={() => changeLanguage("fr")}
    title="Français"
  >
    <img src={flagFR} alt="FR" className="w-6 h-6 rounded-sm shadow-sm" />
  </button>
  <button
    onClick={() => changeLanguage("en")}
    title="English"
  >
    <img src={flagEN} alt="EN" className="w-6 h-6 rounded-sm shadow-sm" />
  </button>
</div>
          </div>
        </div>
      )}
    </header>
  );
}
