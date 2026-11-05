import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import gsap from "gsap";

const VERSION_URL = `${import.meta.env.BASE_URL}version.json`;
const CHECK_INTERVAL = 5 * 60 * 1000;

// Pide /version.json saltándose cualquier caché y dice si el build subido
// es distinto al que está corriendo en el navegador
async function hasNewVersion() {
  try {
    const res = await fetch(`${VERSION_URL}?t=${Date.now()}`, {
      cache: "no-store",
    });
    if (!res.ok) return false;
    const { version } = await res.json();
    return typeof version === "string" && version !== __BUILD_ID__;
  } catch {
    return false;
  }
}

const UpdateNotice = () => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const [isReloading, setIsReloading] = useState(false);
  const noticeRef = useRef<HTMLDivElement>(null);

  // Revisa al entrar, cada 5 minutos y al volver a la pestaña
  useEffect(() => {
    if (import.meta.env.DEV) return;

    let cancelled = false;
    const check = async () => {
      if (document.visibilityState !== "visible") return;
      if (await hasNewVersion()) {
        if (!cancelled) setIsVisible(true);
      }
    };

    check();
    const interval = window.setInterval(check, CHECK_INTERVAL);
    document.addEventListener("visibilitychange", check);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", check);
    };
  }, []);

  useEffect(() => {
    if (isVisible && noticeRef.current) {
      gsap.fromTo(
        noticeRef.current,
        { y: "100%", opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: "power3.out" },
      );
    }
  }, [isVisible]);

  // Antes de recargar se vuelve a pedir el HTML con cache "reload", así el
  // navegador reemplaza la copia vieja que tenga guardada
  const handleReload = async () => {
    setIsReloading(true);
    try {
      await fetch(window.location.href, { cache: "reload" });
    } catch {
      // Si falla, la recarga normal igual revalida el HTML
    }
    window.location.reload();
  };

  const handleClose = () => {
    if (noticeRef.current) {
      gsap.to(noticeRef.current, {
        y: "100%",
        opacity: 0,
        scale: 0.95,
        duration: 0.3,
        onComplete: () => setIsVisible(false),
      });
    } else {
      setIsVisible(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div
      ref={noticeRef}
      role="status"
      className="fixed z-60 flex flex-col pointer-events-none bottom-0 left-0 right-0 w-full items-center md:bottom-6 md:left-6 md:right-auto md:w-auto md:items-start"
    >
      <div className="bg-white text-black pointer-events-auto relative overflow-hidden w-full border-t border-x border-[#E6E6E6] shadow-[0_-5px_20px_rgba(0,0,0,0.1)] p-5 md:w-96 md:rounded-xl md:border md:shadow-2xl">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-linear-to-br from-[#2A579E]/10 to-transparent rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex items-start gap-4 relative z-10">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-base md:text-lg text-black leading-tight mb-1">
              {t("updateNotice.title")}
            </h3>
            <p className="text-sm text-gray-600 leading-tight">
              {t("updateNotice.text")}
            </p>
          </div>

          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-black transition-colors p-1 -mr-2 -mt-2"
            aria-label={t("updateNotice.close")}
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

        <div className="mt-4 flex justify-end relative z-10">
          <button
            onClick={handleReload}
            disabled={isReloading}
            className="bg-[#2A579E] text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-[#1e4075] transition-colors shadow-lg shadow-[#2A579E]/20 disabled:opacity-70"
          >
            {t("updateNotice.reload")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateNotice;
