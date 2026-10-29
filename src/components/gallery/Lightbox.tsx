import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { LetPhoto } from "../../data/letPhotos";
import { useArticleDate } from "../../hooks/useArticleDate";

type LightboxProps = {
  photos: LetPhoto[];
  index: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
};

const iconButton =
  "flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white";

export default function Lightbox({
  photos,
  index,
  onClose,
  onNavigate,
}: LightboxProps) {
  const { t } = useTranslation();
  const formatDate = useArticleDate();
  const photo = photos[index];
  const [loadedId, setLoadedId] = useState<string | null>(null);
  const touchX = useRef<number | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);

  const hasPrev = index > 0;
  const hasNext = index < photos.length - 1;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && hasPrev) onNavigate(index - 1);
      if (e.key === "ArrowRight" && hasNext) onNavigate(index + 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, hasPrev, hasNext, onClose, onNavigate]);

  // Bloquea el scroll de la página y lleva el foco al visor
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  // Precarga las fotos vecinas para que pasar de una a otra sea inmediato
  useEffect(() => {
    [photos[index - 1], photos[index + 1]].forEach((p) => {
      if (p) new Image().src = p.large;
    });
  }, [index, photos]);

  if (!photo) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={photo.title}
      className="fixed inset-0 z-200 flex flex-col bg-[#081430]/95 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const delta = e.changedTouches[0].clientX - touchX.current;
        touchX.current = null;
        if (delta > 50 && hasPrev) onNavigate(index - 1);
        if (delta < -50 && hasNext) onNavigate(index + 1);
      }}
    >
      {/* Barra superior */}
      <div className="flex items-center justify-between gap-4 px-4 py-3 text-white sm:px-6">
        <span className="text-sm text-white/70 tabular-nums">
          {index + 1} / {photos.length}
        </span>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label={t("galleryPage.close")}
          className={iconButton}
        >
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
      </div>

      {/* Foto */}
      <div
        className="relative flex min-h-0 flex-1 items-center justify-center px-2 sm:px-20"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        {loadedId !== photo.id && (
          <span className="absolute h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-white" />
        )}
        <img
          key={photo.id}
          src={photo.large}
          alt={photo.title}
          onLoad={() => setLoadedId(photo.id)}
          className={`max-h-full max-w-full rounded-lg object-contain shadow-2xl transition-opacity duration-300 ${
            loadedId === photo.id ? "opacity-100" : "opacity-0"
          }`}
        />

        {hasPrev && (
          <button
            type="button"
            onClick={() => onNavigate(index - 1)}
            aria-label={t("galleryPage.previous")}
            className={`${iconButton} absolute left-4 top-1/2 hidden -translate-y-1/2 sm:flex`}
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        )}
        {hasNext && (
          <button
            type="button"
            onClick={() => onNavigate(index + 1)}
            aria-label={t("galleryPage.next")}
            className={`${iconButton} absolute right-4 top-1/2 hidden -translate-y-1/2 sm:flex`}
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        )}
      </div>

      {/* Pie: datos y acciones */}
      <div className="flex flex-col gap-4 px-4 py-4 text-white sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="min-w-0">
          <p className="truncate font-semibold">{photo.title}</p>
          <p className="text-sm text-white/60">
            {formatDate(photo.takenAt.replace(" ", "T"))}
          </p>
        </div>
        <div className="flex shrink-0 gap-3">
          <a
            href={photo.flickrUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 whitespace-nowrap rounded-full border border-white/30 px-4 py-2.5 text-center text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-white/10 sm:flex-none sm:px-5 sm:tracking-widest"
          >
            {t("galleryPage.viewOnFlickr")}
          </a>
          <a
            href={photo.downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[#1B3A75] transition-colors hover:bg-[#E6F0FF] sm:flex-none sm:px-5 sm:tracking-widest"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 4v11m0 0-4-4m4 4 4-4M5 20h14" />
            </svg>
            {t("galleryPage.download")}
          </a>
        </div>
      </div>
    </div>
  );
}
