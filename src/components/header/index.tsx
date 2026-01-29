import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useLayout } from "../../context/LayoutContext";
import LogoLoopMobile from "../LogoLoopMobile";
import { getNextTournament } from "../../utils/tournamentDate";

const Header = () => {
  const { isHeaderOpen: open, setIsHeaderOpen: setOpen } = useLayout();
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const visible = location.pathname !== "/" || scrolled || open;

  const nextTournament = getNextTournament();

  return (
    <header
      className={`fixed top-0 z-50 w-full font-header transform transition-all drop-shadow-2xl duration-300 ${
        visible
          ? "translate-y-0 opacity-100 bg-[#F8F8F8] border-b border-[#E6E6E6] shadow-sm"
          : "-translate-y-full opacity-0"
      }`}
    >
      <div className="mx-auto max-w-screen">
        <div className="flex h-26 items-center justify-between md:justify-around px-4">
          {/* Left: Logo */}
          <Link to="/" className="flex items-center gap-2">
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
              className="text-black text-2xl hover:text-[#2A579E] transition-colors"
            >
              Inicio
            </Link>
            <Link
              to="/carrer"
              className="text-black text-2xl hover:text-[#2A579E] transition-colors"
            >
              Carrera
            </Link>
            <Link
              to="/stats"
              className="text-black text-2xl hover:text-[#2A579E] transition-colors"
            >
              Estadísticas
            </Link>
            <Link
              to="/news"
              className="text-black text-2xl hover:text-[#2A579E] transition-colors"
            >
              Noticias
            </Link>
          </nav>

          {/* Mobile: Hamburger */}
          <button
            aria-label="Abrir menú"
            aria-expanded={open}
            aria-controls="mobile-menu"
            className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-black hover:text-[#2A579E] hover:bg-[#E6E6E6] transition"
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
            <div className="flex flex-col items-center justify-center text-xl gap-10">
              <Link
                to="/"
                className="block px-2 py-2 rounded text-black hover:bg-[#E6E6E6] hover:text-[#2A579E] transition"
                onClick={() => setOpen(false)}
              >
                Inicio
              </Link>
              <Link
                to="/carrer"
                className="block px-2 py-2 rounded text-black hover:bg-[#E6E6E6] hover:text-[#2A579E] transition"
                onClick={() => setOpen(false)}
              >
                Carrera
              </Link>
              <Link
                to="/stats"
                className="block px-2 py-2 rounded text-black hover:bg-[#E6E6E6] hover:text-[#2A579E] transition"
                onClick={() => setOpen(false)}
              >
                Estadísticas
              </Link>
              <Link
                to="/news"
                className="block px-2 py-2 rounded text-black hover:bg-[#E6E6E6] hover:text-[#2A579E] transition"
                onClick={() => setOpen(false)}
              >
                Noticias
              </Link>
              <div className="w-3/4 h-0.5 bg-[#E6E6E6]" />

              {nextTournament && (
                <div className="flex flex-col justify-center items-center gap-2 text-center">
                  <span className="text-[#2A579E] text-sm uppercase tracking-widest font-bold">
                    {nextTournament.isCurrent
                      ? "Torneo actual"
                      : "Próximo torneo"}
                  </span>
                  <span className="text-black text-2xl font-semibold leading-tight px-4">
                    {nextTournament.name}
                  </span>
                  <span className="text-gray-500 text-lg">
                    {nextTournament.date} - {nextTournament.country}
                  </span>
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
