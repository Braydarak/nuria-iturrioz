import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import SocialLinks from "../socialLinks";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { t } = useTranslation();

  return (
    <footer className="relative bg-[#2A579E] text-white pt-16 pb-8">
      {/* Línea divisoria superior con gradiente */}
      <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-white/30 to-transparent" />

      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-12 mb-12">
          {/* Logo y descripción */}
          <div className="flex flex-col items-center lg:items-start gap-6 max-w-md text-center lg:text-left">
            <Link to="/" className="group">
              <img
                src="/nuria_logo.webp"
                alt="Nuria Iturrioz"
                className="h-20 w-auto brightness-0 invert transition-opacity duration-300 group-hover:opacity-90"
              />
            </Link>
            <p className="text-blue-100/90 text-sm leading-relaxed font-light">
              {t("footer.description")}
            </p>
          </div>

          {/* Redes Sociales y Enlaces */}
          <div className="flex flex-col items-center lg:items-end gap-6">
            <h3 className="text-sm uppercase tracking-[0.2em] font-semibold text-blue-200">
              {t("footer.followMe")}
            </h3>
            <SocialLinks />
          </div>
        </div>

        {/* Separador sutil */}
        <div className="w-full h-px bg-blue-400/30 mb-8" />

        {/* Legal y Copyright */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-blue-100/60 font-light">
          <div className="text-center md:text-left max-w-2xl space-y-2">
            <p>
              © {currentYear} Nuria Iturrioz. {t("footer.rights")}
            </p>
            <p className="leading-relaxed">{t("footer.legal")}</p>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/legal" className="hover:text-white transition-colors">
              {t("legals.legalNotice.title", "Aviso legal")}
            </Link>
            <Link to="/privacy" className="hover:text-white transition-colors">
              {t("footer.privacy")}
            </Link>
            <Link to="/cookies" className="hover:text-white transition-colors">
              {t("footer.cookies")}
            </Link>
            <Link to="/contact" className="hover:text-white transition-colors">
              {t("footer.contact")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
