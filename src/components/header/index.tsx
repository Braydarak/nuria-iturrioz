import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useLayout } from "../../context/LayoutContext";
import LogoLoopMobile from "../LogoLoopMobile";
import {
  getNextTournament,
  type NextTournament,
} from "../../utils/tournamentDate";
import LanguageSelector from "../languageSelector";
import { useTranslation } from "react-i18next";
import { useLiveStatus } from "../../hooks/useLiveStatus";

const Header = () => {
  const { isHeaderOpen: open, setIsHeaderOpen: setOpen } = useLayout();
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { t } = useTranslation();
  const { isLive } = useLiveStatus();
  const [nextTournament, setNextTournament] = useState<NextTournament | null>(
    null,
  );

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const visible = location.pathname !== "/" || scrolled || open;

  useEffect(() => {
    let cancelled = false;
    getNextTournament()
      .then((tournament) => {
        if (!cancelled) setNextTournament(tournament);
      })
      .catch(() => {
        if (!cancelled) setNextTournament(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const parsedDate = nextTournament?.parsedDate;
  const daysUntilStart = parsedDate
    ? Math.ceil(
        (parsedDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
      )
    : null;
  const showNextTournament =
    !!nextTournament &&
    (nextTournament.isCurrent ||
      (typeof daysUntilStart === "number" &&
        daysUntilStart >= 0 &&
        daysUntilStart <= 7));

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isActive = (to: string) =>
    to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);

  const desktopNavLinkClassName = (to: string) => {
    const active = isActive(to);
    return `relative text-2xl transition-colors hover:text-[#2A579E] after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-full after:bg-[#2A579E] after:origin-left after:scale-x-0 after:transition-transform after:duration-300 hover:after:scale-x-100 ${
      active ? "text-[#2A579E] after:scale-x-100" : "text-black"
    }`;
  };

  const mobileNavLinkClassName = (to: string) => {
    const active = isActive(to);
    return `inline-block px-2 py-2 rounded transition relative hover:bg-[#E6E6E6] hover:text-[#2A579E] after:content-[''] after:absolute after:left-1/2 after:-translate-x-1/2 after:-bottom-0.5 after:h-[2px] after:bg-[#2A579E] after:w-0 after:transition-[width] after:duration-300 hover:after:w-full ${
      active ? "text-[#2A579E] after:w-full" : "text-black"
    }`;
  };

  return (
    <header
      className={`fixed top-0 z-100 w-full font-header transform transition-all drop-shadow-2xl duration-300 ${
        visible
          ? "translate-y-0 opacity-100 bg-[#F8F8F8] border-b border-[#E6E6E6] shadow-sm"
          : "-translate-y-full opacity-0"
      }`}
    >
      <div className="mx-auto max-w-screen">
        <div className="flex h-26 items-center justify-between md:justify-around px-4">
          {/* Left: Logo */}
          <Link
            to="/"
            className="flex items-center gap-2"
            onClick={handleScrollToTop}
          >
            <img
              src="/NuriaLogo.blue.svg"
              alt="Nuria Iturrioz"
              className="md:h-20 h-15 w-auto md:m-0 pl-5"
            />
          </Link>

          {/* Center: Navs (desktop) */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className={desktopNavLinkClassName("/")}
              onClick={handleScrollToTop}
            >
              {t("header.home")}
            </Link>
            <Link to="/career" className={desktopNavLinkClassName("/career")}>
              {t("header.career")}
            </Link>
            <Link to="/stats" className={desktopNavLinkClassName("/stats")}>
              {t("header.stats")}
            </Link>
            <Link to="/news" className={desktopNavLinkClassName("/news")}>
              {t("header.news")}
            </Link>
            <Link to="/contact" className={desktopNavLinkClassName("/contact")}>
              {t("header.contact")}
            </Link>
            <LanguageSelector />
          </nav>

          {/* Mobile: Hamburger & Language */}
          <div className="md:hidden flex items-center gap-4">
            <LanguageSelector />
            <button
              aria-label="Abrir menú"
              aria-expanded={open}
              aria-controls="mobile-menu"
              className="inline-flex items-center justify-center rounded-md p-2 text-black hover:text-[#2A579E] hover:bg-[#E6E6E6] transition"
              onClick={() => setOpen((v) => !v)}
            >
              {/* Icon */}
              <svg
                className="h-6 w-6"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3 6h18M3 12h18M3 18h18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu panel */}
        <div
          id="mobile-menu"
          className={`md:hidden overflow-hidden transition-all duration-500 ease-in-out ${
            open
              ? "h-[calc(100vh-6.5rem)] opacity-100 translate-y-0 border-t border-[#E6E6E6] bg-[#F8F8F8]"
              : "h-0 opacity-0 -translate-y-5"
          }`}
        >
          <div className="flex flex-col h-full pt-10 w-full">
            <div className="flex flex-col items-center justify-center text-xl gap-7">
              <Link
                to="/"
                className={mobileNavLinkClassName("/")}
                onClick={() => {
                  setOpen(false);
                  handleScrollToTop();
                }}
              >
                {t("header.home")}
              </Link>
              <Link
                to="/career"
                className={mobileNavLinkClassName("/career")}
                onClick={() => setOpen(false)}
              >
                {t("header.career")}
              </Link>
              <Link
                to="/stats"
                className={mobileNavLinkClassName("/stats")}
                onClick={() => setOpen(false)}
              >
                {t("header.stats")}
              </Link>
              <Link
                to="/news"
                className={mobileNavLinkClassName("/news")}
                onClick={() => setOpen(false)}
              >
                {t("header.news")}
              </Link>
              <Link
                to="/contact"
                className={mobileNavLinkClassName("/contact")}
                onClick={() => setOpen(false)}
              >
                {t("header.contact")}
              </Link>
              <div className="w-3/4 h-0.5 bg-[#E6E6E6]" />

              {showNextTournament && nextTournament && (
                <div className="flex flex-col justify-center items-center gap-2 text-center">
                  <span className="text-[#2A579E] text-sm uppercase tracking-widest font-bold flex items-center gap-2">
                    {nextTournament.isCurrent
                      ? t("header.actualTour")
                      : t("header.nextTour")}
                    {nextTournament.isCurrent && isLive && (
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                      </span>
                    )}
                  </span>
                  {nextTournament.isCurrent && isLive ? (
                    <Link
                      to="/live"
                      className="group flex flex-col items-center"
                      onClick={() => setOpen(false)}
                    >
                      <span className="text-black text-2xl font-semibold leading-tight px-4 group-hover:text-[#2A579E] transition-colors">
                        {nextTournament.name}
                      </span>
                      <span className="text-green-600 text-lg font-medium mt-1 flex items-center gap-1">
                        <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        {t("header.viewLiveScores")} &rarr;
                      </span>
                    </Link>
                  ) : (
                    <>
                      <span className="text-black text-2xl font-semibold leading-tight px-4">
                        {nextTournament.name}
                      </span>
                      <span className="text-gray-500 text-lg">
                        {nextTournament.date} - {nextTournament.country}
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="mt-auto w-full">
              <LogoLoopMobile />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
