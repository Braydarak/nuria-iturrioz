import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLayout } from "../../context/LayoutContext";
import { useLiveStatus } from "../../hooks/useLiveStatus";
import { useNextTournament } from "../../hooks/useNextTournament";
import LogoLoopMobile from "../LogoLoopMobile";
import LanguageSelector from "../languageSelector";

const NAV_ITEMS = [
  { to: "/", label: "header.home" },
  { to: "/carrer", label: "header.career" },
  { to: "/stats", label: "header.stats" },
  { to: "/news", label: "header.news" },
  { to: "/gallery", label: "header.gallery" },
] as const;

const BRAND_BLUE = "#2A579E";
const BRAND_NAVY = "#1B3A75";
const MENU_CLOSE_MS = 450;

const LiveDot = () => (
  <span className="relative flex h-2.5 w-2.5">
    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
  </span>
);

const Header = () => {
  const { isHeaderOpen: open, setIsHeaderOpen: setOpen } = useLayout();
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { t } = useTranslation();
  const { isLive } = useLiveStatus();
  const { nextTournament, showNextTournament } = useNextTournament();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Bloquea el scroll del body mientras el menú móvil está abierto
  useEffect(() => {
    if (!open) return;

    const scrollY = window.scrollY;
    const originalStyles = {
      position: document.body.style.position,
      top: document.body.style.top,
      left: document.body.style.left,
      right: document.body.style.right,
      width: document.body.style.width,
      overflow: document.body.style.overflow,
    };

    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.position = originalStyles.position;
      document.body.style.top = originalStyles.top;
      document.body.style.left = originalStyles.left;
      document.body.style.right = originalStyles.right;
      document.body.style.width = originalStyles.width;
      document.body.style.overflow = originalStyles.overflow;
      window.scrollTo(0, scrollY);
    };
  }, [open]);

  // En la home el header aparece al hacer scroll (el hero tiene su propio logo)
  const visible = location.pathname !== "/" || scrolled || open;
  const elevated = scrolled && !open;
  const tournamentIsLive = !!nextTournament?.isCurrent && isLive;

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNavClick = (to: string) => {
    setOpen(false);
    if (to === "/") handleScrollToTop();
  };

  const isActive = (to: string) =>
    to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);

  return (
    <header
      className={`fixed top-0 z-100 w-full font-header transition-[translate,opacity] duration-300 ${
        visible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
      }`}
    >
      {/* Barra principal */}
      <div
        className={`relative bg-white transition-shadow duration-300 ${
          elevated ? "shadow-[0_6px_24px_rgba(27,58,117,0.10)]" : "shadow-sm"
        }`}
      >
        {/* Línea de marca superior */}
        <div
          className="h-1 w-full"
          style={{
            background: `linear-gradient(90deg, ${BRAND_NAVY}, ${BRAND_BLUE} 50%, #3C7BEA)`,
          }}
        />

        <div
          className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-5 md:h-20 md:px-8"
        >
          {/* Logo */}
          <Link
            to="/"
            className="flex shrink-0 items-center"
            onClick={() => handleNavClick("/")}
            aria-label="Nuria Iturrioz"
          >
            <img
              src="/NuriaLogo.blue.svg"
              alt="Nuria Iturrioz"
              className="h-11 w-auto md:h-14"
            />
          </Link>

          {/* Navegación (desktop) */}
          <nav className="hidden md:flex items-center gap-7 lg:gap-9">
            {NAV_ITEMS.map(({ to, label }) => {
              const active = isActive(to);
              return (
                <Link
                  key={to}
                  to={to}
                  onClick={() => handleNavClick(to)}
                  aria-current={active ? "page" : undefined}
                  className={`group relative py-2 text-[13px] font-bold uppercase tracking-[0.18em] transition-colors ${
                    active
                      ? "text-[#2A579E]"
                      : "text-[#1B3A75]/70 hover:text-[#2A579E]"
                  }`}
                >
                  {t(label)}
                  <span
                    className={`absolute -bottom-0.5 left-0 h-0.5 w-full origin-left rounded-full bg-[#2A579E] transition-transform duration-300 ${
                      active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          {/* Acciones (desktop) */}
          <div className="hidden md:flex items-center gap-5">
            <LanguageSelector />

            <Link
              to="/contact"
              aria-current={isActive("/contact") ? "page" : undefined}
              className="group inline-flex items-center gap-2 rounded-full bg-[#1B3A75] px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-white shadow-md transition-colors hover:bg-[#2A579E]"
            >
              {t("header.contact")}
              <svg
                className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
          </div>

          {/* Acciones (mobile) */}
          <div className="flex items-center gap-3 md:hidden">
            <LanguageSelector />
            <button
              type="button"
              aria-label={open ? t("header.closeMenu") : t("header.openMenu")}
              aria-expanded={open}
              aria-controls="mobile-menu"
              className="relative h-11 w-11 rounded-full text-[#1B3A75] transition-colors hover:bg-[#2A579E]/10"
              onClick={() => setOpen((v) => !v)}
            >
              <span
                className={`absolute left-1/2 top-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full bg-current transition-transform duration-300 ${
                  open ? "rotate-45" : "-translate-y-[6px]"
                }`}
              />
              <span
                className={`absolute left-1/2 top-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full bg-current transition-opacity duration-200 ${
                  open ? "opacity-0" : "opacity-100"
                }`}
              />
              <span
                className={`absolute left-1/2 top-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full bg-current transition-transform duration-300 ${
                  open ? "-rotate-45" : "translate-y-[6px]"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Menú móvil */}
      <div
        id="mobile-menu"
        className={`md:hidden absolute inset-x-0 top-full flex h-[calc(100dvh-4.25rem)] flex-col overflow-hidden border-t border-[#E6E6E6] bg-white text-[#1B3A75] ${
          open
            ? "visible translate-y-0 opacity-100 [clip-path:inset(0_0_0_0)]"
            : "invisible -translate-y-3 opacity-0 [clip-path:inset(0_0_100%_0)]"
        }`}
        style={{
          // Abre con fade; al cerrar se recoge de abajo hacia arriba y recién
          // al terminar se resetean opacidad/posición para la próxima apertura
          transition: open
            ? "opacity 400ms ease-out, translate 400ms ease-out"
            : `clip-path ${MENU_CLOSE_MS}ms cubic-bezier(0.4, 0, 0.2, 1), opacity 0s ${MENU_CLOSE_MS}ms, translate 0s ${MENU_CLOSE_MS}ms, visibility 0s ${MENU_CLOSE_MS}ms`,
        }}
      >
        <div className="flex-1 overflow-y-auto overscroll-contain px-8 pt-10 pb-8">
          <nav className="flex flex-col gap-1">
            {[...NAV_ITEMS, { to: "/contact", label: "header.contact" }].map(
              ({ to, label }, index) => {
                const active = isActive(to);
                return (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => handleNavClick(to)}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-baseline gap-4 py-2.5 ${
                      open
                        ? "translate-x-0 opacity-100"
                        : "-translate-x-4 opacity-0"
                    }`}
                    style={{
                      transition: open
                        ? `opacity 500ms ease-out ${80 + index * 60}ms, translate 500ms ease-out ${80 + index * 60}ms`
                        : `opacity 0s ${MENU_CLOSE_MS}ms, translate 0s ${MENU_CLOSE_MS}ms`,
                    }}
                  >
                    <span className="w-6 text-xs font-bold tracking-widest text-[#2A579E]/50">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span
                      className={`text-3xl font-bold tracking-tight ${
                        active ? "text-[#2A579E]" : "text-gray-900"
                      }`}
                    >
                      {t(label)}
                    </span>
                    {active && (
                      <span className="h-1.5 w-1.5 self-center rounded-full bg-[#2A579E]" />
                    )}
                  </Link>
                );
              },
            )}
          </nav>

          {showNextTournament && nextTournament && (
            <Link
              to={tournamentIsLive ? "/live" : "/stats"}
              onClick={() => setOpen(false)}
              className="mt-10 block rounded-2xl border border-[#2A579E]/15 bg-[#2A579E]/5 p-5"
            >
              <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#2A579E]">
                {tournamentIsLive && <LiveDot />}
                {nextTournament.isCurrent
                  ? t("header.actualTour")
                  : t("header.nextTour")}
              </span>
              <span className="mt-2 block text-xl font-semibold leading-tight">
                {nextTournament.name}
              </span>
              <span className="mt-1 block text-sm text-[#1B3A75]/60">
                {tournamentIsLive
                  ? `${t("header.viewLiveScores")} →`
                  : `${nextTournament.date} · ${nextTournament.country}`}
              </span>
            </Link>
          )}
        </div>

        <div className="w-full shrink-0">
          <LogoLoopMobile heightClass="h-24" />
        </div>
      </div>
    </header>
  );
};

export default Header;
