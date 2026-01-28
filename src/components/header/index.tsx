import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useLayout } from "../../context/LayoutContext";

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

  return (
    <header
      className={`fixed top-0 z-50 w-full font-header transform transition-all drop-shadow-2xl duration-300 ${
        visible
          ? "translate-y-0 opacity-100 bg-[#F8F8F8] border-b border-[#E6E6E6] shadow-sm"
          : "-translate-y-full opacity-0"
      }`}
    >
      <div className="mx-auto max-w-screen px-4">
        <div className="flex h-26 items-center justify-between md:justify-around">
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
            <a
              href="#"
              className="text-black text-2xl hover:text-[#2A579E] transition-colors"
            >
              Sponsors
            </a>
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
          className={`md:hidden overflow-hidden transition-all duration-200 ${
            open ? "max-h-64 border-t border-[#E6E6E6] bg-[#F8F8F8]" : "max-h-0"
          }`}
        >
          <div className="py-3 space-y-2">
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
            <div className="mt-1 pt-2 border-t border-[#E6E6E6]">
              <span className="block px-2 py-2 text-black/90">Sponsors</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
