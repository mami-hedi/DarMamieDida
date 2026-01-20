import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Facebook, Instagram } from "lucide-react";
import { FaTiktok } from "react-icons/fa";
import { useTranslation } from "react-i18next";

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-foreground text-background">
      <div className="container-custom section-padding">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">

          {/* Brand */}
          <div>
            <h3 className="font-display text-2xl font-semibold mb-4">
              Dar Mamie <span className="text-primary">Dida</span>
            </h3>

            <p className="font-body text-sm text-background/70 leading-relaxed">
              {t("footer.description")}
            </p>

            <h4 className="font-display text-lg font-semibold mt-6 mb-2">
              {t("footer.otherLinks")}
            </h4>

            
            <Link
              to=""
              className="font-body text-sm text-background/70 hover:text-primary transition-colors"
            >
              Politique de confidentialité
            </Link><br/>
            <Link
              to=""
              className="font-body text-sm text-background/70 hover:text-primary transition-colors"
            >
              Mentions légales
            </Link><br/>

            <Link
              to=""
              className="font-body text-sm text-background/70 hover:text-primary transition-colors"
            >
              Politique d’annulation
            </Link> <br/>
            <Link
              to="/faq"
              className="font-body text-sm text-background/70 hover:text-primary transition-colors"
            >
              FAQ
            </Link><br/>
            
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-4">
              {t("footer.navigation")}
            </h4>

            <nav className="flex flex-col gap-2">
              <Link to="/" className="flex items-center gap-3 font-body text-sm text-background/70 hover:text-primary">{t("nav.home")}</Link>
              <Link to="/a-propos" className="flex items-center gap-3 font-body text-sm text-background/70 hover:text-primary">{t("nav.about")}</Link>
              <Link to="/galerie" className="flex items-center gap-3 font-body text-sm text-background/70 hover:text-primary">{t("nav.gallery")}</Link>
              <Link to="/services" className="flex items-center gap-3 font-body text-sm text-background/70 hover:text-primary">{t("nav.services")}</Link>
              <Link to="/chambres" className="flex items-center gap-3 font-body text-sm text-background/70 hover:text-primary">{t("nav.rooms")}</Link>
              <Link to="/contact" className="flex items-center gap-3 font-body text-sm text-background/70 hover:text-primary">{t("nav.contact")}</Link>
              <Link to="/disponibilite" className="flex items-center gap-3 font-body text-sm text-background/70 hover:text-primary">{t("nav.availability")}</Link>
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-4">
              {t("footer.contact")}
            </h4>

            <div className="flex flex-col gap-3">

              <a
                href="mailto:contact@maisonmh.com"
                className="flex items-center gap-3 font-body text-sm text-background/70 hover:text-primary"
              >
                <Mail className="h-4 w-4" />
                contact@maisonmh.com
              </a>

              <a
                href="tel:+33123456789"
                className="flex items-center gap-3 font-body text-sm text-background/70 hover:text-primary"
              >
                <Phone className="h-4 w-4" />
                +33 1 23 45 67 89
              </a>

              <div className="flex items-start gap-3 font-body text-sm text-background/70">
                <MapPin className="h-4 w-4 mt-0.5" />
                <div>
                  <span>{t("footer.address")}</span>

                  <div className="flex gap-4 mt-3">
                    <a href="https://facebook.com" target="_blank" className="flex items-center gap-3 font-body text-sm text-background/70 hover:text-primary">
                      <Facebook className="h-5 w-6" />
                    </a>
                    <a href="https://instagram.com" target="_blank" className="flex items-center gap-3 font-body text-sm text-background/70 hover:text-primary">
                      <Instagram className="h-5 w-6" />
                    </a>
                    <a href="https://tiktok.com" target="_blank" className="flex items-center gap-3 font-body text-sm text-background/70 hover:text-primary">
                      <FaTiktok className="h-5 w-6" />
                    </a>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-background/10 mt-12 pt-8 text-center">
          <p className="font-body text-sm text-background/50">
            © {new Date().getFullYear()} Dar Mamie Dida — {t("footer.rights")} ·{" "}
            <a
              href="https://www.mh-digital-solution.com"
              target="_blank"
              className="hover:text-primary"
            >
              MH Digital Solution
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
