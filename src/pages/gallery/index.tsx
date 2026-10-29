import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import Lightbox from "../../components/gallery/Lightbox";
import { fetchLetPhotos, type LetPhoto } from "../../data/letPhotos";
import { useArticleDate } from "../../hooks/useArticleDate";
import { DEFAULT_OG_IMAGE_URL, SITE_URL } from "../../utils/constants";

const PAGE_SIZE = 36;

function PhotoTile({ photo, onOpen }: { photo: LetPhoto; onOpen: () => void }) {
  const { t } = useTranslation();
  const formatDate = useArticleDate();
  const [loaded, setLoaded] = useState(false);

  return (
    <figure className="group relative mb-3 break-inside-avoid overflow-hidden rounded-xl bg-neutral-100 md:mb-4">
      <button
        type="button"
        onClick={onOpen}
        aria-label={`${t("galleryPage.open")}: ${photo.title}`}
        className="block w-full cursor-zoom-in focus:outline-none focus-visible:ring-4 focus-visible:ring-[#2A579E]/40"
      >
        <img
          src={photo.thumb}
          alt={photo.title}
          width={photo.thumbWidth}
          height={photo.thumbHeight}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          className={`h-auto w-full transition-[opacity,transform] duration-700 group-hover:scale-105 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
        />
        <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 to-transparent p-3 text-left text-xs font-semibold text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          {formatDate(photo.takenAt.replace(" ", "T"))}
        </figcaption>
      </button>
      {/* Descarga rápida sin abrir el visor */}
      <a
        href={photo.downloadUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t("galleryPage.download")}
        title={t("galleryPage.download")}
        className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#1B3A75] opacity-0 shadow transition-opacity duration-300 hover:bg-white focus:opacity-100 group-hover:opacity-100"
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
      </a>
    </figure>
  );
}

export default function GalleryPage() {
  const { t } = useTranslation();
  const [photos, setPhotos] = useState<LetPhoto[] | null>(null);
  const [error, setError] = useState(false);
  const [year, setYear] = useState<number | null>(null);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchLetPhotos()
      .then((all) => !cancelled && setPhotos(all))
      .catch(() => !cancelled && setError(true));
    return () => {
      cancelled = true;
    };
  }, []);

  const years = useMemo(() => {
    const counts = new Map<number, number>();
    photos?.forEach((p) => counts.set(p.year, (counts.get(p.year) ?? 0) + 1));
    return [...counts.entries()].sort((a, b) => b[0] - a[0]);
  }, [photos]);

  const filtered = useMemo(
    () => (photos ?? []).filter((p) => year === null || p.year === year),
    [photos, year],
  );
  const shown = filtered.slice(0, visible);

  // Carga más fotos al acercarse al final de la grilla
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible((v) => v + PAGE_SIZE);
      },
      { rootMargin: "800px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
    // Se vuelve a observar cada vez que crece la grilla: si el marcador sigue
    // cerca de la pantalla, carga otra tanda
  }, [photos, year, visible]);

  const selectYear = (next: number | null) => {
    setYear(next);
    setVisible(PAGE_SIZE);
  };

  const closeLightbox = useCallback(() => setOpenIndex(null), []);
  const navigate = useCallback((index: number) => {
    setOpenIndex(index);
    // Si el visor llega a fotos que aún no están en la grilla, se agregan
    setVisible((v) => Math.max(v, index + 1));
  }, []);

  const chipClass = (active: boolean) =>
    `shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
      active
        ? "border-[#2A579E] bg-[#2A579E] text-white"
        : "border-neutral-200 bg-white text-neutral-700 hover:border-[#2A579E]/40 hover:text-[#2A579E]"
    }`;

  return (
    <>
      <Helmet>
        <title>{`${t("galleryPage.title")} – Nuria Iturrioz`}</title>
        <meta name="description" content={t("galleryPage.description")} />
        <link rel="canonical" href={`${SITE_URL}/gallery`} />
        <meta property="og:type" content="website" />
        <meta
          property="og:title"
          content={`${t("galleryPage.title")} – Nuria Iturrioz`}
        />
        <meta
          property="og:description"
          content={t("galleryPage.description")}
        />
        <meta property="og:image" content={DEFAULT_OG_IMAGE_URL} />
      </Helmet>

      <main className="min-h-screen bg-white pt-[68px] md:pt-[84px]">
        <div className="w-full px-4 pb-16 pt-8 md:px-8 md:pb-24 md:pt-12">
          <div>
            <h1 className="font-signature text-5xl text-[#2A579E] md:text-7xl">
              {t("galleryPage.title")}
            </h1>

            {photos && (
              <div className="-mx-4 mt-8 flex items-center gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:mt-10 md:flex-wrap md:px-0">
                <button
                  type="button"
                  onClick={() => selectYear(null)}
                  className={chipClass(year === null)}
                >
                  {t("galleryPage.all")}
                  <span className="ml-2 opacity-70">{photos.length}</span>
                </button>
                {years.map(([y, count]) => (
                  <button
                    key={y}
                    type="button"
                    onClick={() => selectYear(y)}
                    className={chipClass(year === y)}
                  >
                    {y}
                    <span className="ml-2 opacity-70">{count}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="mt-8 md:mt-10">
            {error && (
              <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
                {t("galleryPage.error")}
              </p>
            )}
            {!photos && !error && (
              // Marcadores con proporciones variadas mientras llegan las fotos
              <div
                aria-hidden="true"
                className="columns-2 gap-3 sm:columns-3 md:gap-4 lg:columns-4 2xl:columns-5"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <div
                    key={i}
                    className="mb-3 animate-pulse break-inside-avoid rounded-xl bg-neutral-100 md:mb-4"
                    style={{ aspectRatio: i % 3 === 1 ? "2 / 3" : "3 / 2" }}
                  />
                ))}
              </div>
            )}
            {photos && (
              <div className="columns-2 gap-3 sm:columns-3 md:gap-4 lg:columns-4 2xl:columns-5">
                {shown.map((photo, index) => (
                  <PhotoTile
                    key={photo.id}
                    photo={photo}
                    onOpen={() => setOpenIndex(index)}
                  />
                ))}
              </div>
            )}
            {visible < filtered.length && (
              <div ref={sentinelRef} className="h-px" />
            )}
          </div>
        </div>
      </main>

      {openIndex !== null && (
        <Lightbox
          photos={filtered}
          index={openIndex}
          onClose={closeLightbox}
          onNavigate={navigate}
        />
      )}
    </>
  );
}
