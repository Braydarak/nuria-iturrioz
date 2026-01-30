import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

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
            <div className="flex items-center gap-6">
              {/* Instagram */}
              <a
                href="https://www.instagram.com/nuriaitu"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 hover:scale-110 transition-all duration-300 border border-white/5 backdrop-blur-sm"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>

              {/* Facebook */}
              <a
                href="https://www.facebook.com/nuriaitu"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 hover:scale-110 transition-all duration-300 border border-white/5 backdrop-blur-sm"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </a>

              {/* X (Twitter) */}
              <a
                href="https://x.com/nuriaitu"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X (Twitter)"
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 hover:scale-110 transition-all duration-300 border border-white/5 backdrop-blur-sm"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
                </svg>
              </a>

              {/* LinkedIn */}
              <a
                href="https://www.linkedin.com/in/nuria-iturrioz-79176b128/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 hover:scale-110 transition-all duration-300 border border-white/5 backdrop-blur-sm"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect x="2" y="9" width="4" height="12"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
              </a>
            </div>
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
