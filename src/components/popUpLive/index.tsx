import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLiveStatus } from "../../hooks/useLiveStatus";
import gsap from "gsap";
import nuriaImg from "../../assets/nuri.png";

const PopUpLive = () => {
  const { isLive, loading, position, tournamentName } = useLiveStatus();
  const location = useLocation();
  const { t } = useTranslation();
  const [isManuallyClosed, setIsManuallyClosed] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setHasScrolled(true);
      } else {
        setHasScrolled(false);
      }
    };

    // Initial check
    handleScroll();

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isHidden = localStorage.getItem("hideLivePopup") === "true";
  const isLivePage = location.pathname === "/live";
  const isHomePage = location.pathname === "/";

  // Determine visibility
  // Only show if:
  // 1. Not loading
  // 2. isLive is explicitly true (checked by useLiveStatus which handles finished/retired logic)
  // 3. Not hidden by user preference
  // 4. Not on live page
  // 5. Not manually closed in this session
  // 6. On homepage only after scroll, or immediately on other pages
  const shouldShow =
    !loading &&
    isLive &&
    !isHidden &&
    !isLivePage &&
    !isManuallyClosed &&
    (!isHomePage || hasScrolled);

  useEffect(() => {
    if (shouldShow && popupRef.current) {
      gsap.fromTo(
        popupRef.current,
        { y: "100%", opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: "power3.out" },
      );
    }
  }, [shouldShow]);

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem("hideLivePopup", "true");
    }

    if (popupRef.current) {
      gsap.to(popupRef.current, {
        y: "100%",
        opacity: 0,
        scale: 0.95,
        duration: 0.3,
        onComplete: () => setIsManuallyClosed(true),
      });
    } else {
      setIsManuallyClosed(true);
    }
  };

  if (!shouldShow) return null;

  return (
    <div
      ref={popupRef}
      className="fixed z-50 flex flex-col pointer-events-none bottom-0 left-0 right-0 w-full items-center md:bottom-6 md:right-6 md:left-auto md:w-auto md:items-end"
    >
      <div className="bg-white text-black pointer-events-auto relative overflow-hidden group w-full border-t border-x border-[#E6E6E6] shadow-[0_-5px_20px_rgba(0,0,0,0.1)] p-5 md:w-96 md:rounded-xl md:border md:shadow-2xl">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-linear-to-br from-[#2A579E]/10 to-transparent rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex items-start gap-4 relative z-10">
          <div className="relative shrink-0">
            {/* Live indicator ring */}
            <div className="absolute -inset-1 bg-linear-to-br from-[#2A579E] to-blue-300 rounded-full opacity-75 blur-sm animate-pulse"></div>
            <img
              src={nuriaImg}
              alt="Nuria Live"
              className="relative w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border-2 border-white shadow-md"
            />
            <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full z-20"></div>
          </div>

          <div className="flex-1 min-w-0 pt-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              <span className="text-xs font-bold text-[#2A579E] uppercase tracking-wider">
                {t("popUpLive.liveNow")}
              </span>
            </div>

            <h3 className="font-bold text-base md:text-lg text-black leading-tight mb-1 line-clamp-2">
              {tournamentName || t("popUpLive.tournamentFallback")}
            </h3>

            <p className="text-sm text-gray-600 leading-tight">
              {t("popUpLive.currentPosition")}{" "}
              <span className="font-bold text-black text-lg">
                {position ? `T${position}` : "-"}
              </span>
            </p>
          </div>

          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-black transition-colors p-1 -mr-2 -mt-2"
            aria-label="Cerrar"
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
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3 relative z-10 border-t border-gray-100 pt-3">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="dontShow"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="rounded border-gray-300 text-[#2A579E] focus:ring-[#2A579E]/50 w-4 h-4 cursor-pointer"
            />
            <label
              htmlFor="dontShow"
              className="text-xs text-gray-500 cursor-pointer select-none hover:text-gray-700 transition-colors"
            >
              {t("popUpLive.dontShowAgain")}
            </label>
          </div>

          <Link
            to="/live"
            onClick={() => setIsManuallyClosed(true)}
            className="bg-[#2A579E] text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-[#1e4075] transition-colors shadow-lg shadow-[#2A579E]/20"
          >
            {t("popUpLive.viewLeaderboard")}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PopUpLive;
