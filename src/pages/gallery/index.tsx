import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import Lightbox from "../../components/gallery/Lightbox";
import { fetchLetPhotos, type LetPhoto } from "../../data/letPhotos";
import { useArticleDate } from "../../hooks/useArticleDate";
import { useInView } from "../../hooks/useInView";
import { DEFAULT_OG_IMAGE_URL, SITE_URL } from "../../utils/constants";

const PAGE_SIZE = 36;

// Columnas según el ancho (mismos cortes que Tailwind: sm, lg, 2xl)
const columnCountFor = (width: number) =>
  width >= 1536 ? 5 : width >= 1024 ? 4 : width >= 640 ? 3 : 2;

function useColumnCount() {
  const [count, setCount] = useState(() =>
    typeof window === "undefined" ? 4 : columnCountFor(window.innerWidth),
  );
  useEffect(() => {
    const onResize = () => setCount(columnCountFor(window.innerWidth));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return count;
}

/**
 * Reparte las fotos en columnas, cada una a la columna más corta según sus
 * proporciones. Es determinista: al sumar fotos al final, las anteriores no
 * cambian de lugar (a diferencia de las columnas CSS, que se reequilibran).
 */
function toColumns(photos: LetPhoto[], count: number) {
  const columns = Array.from({ length: count }, () => [] as number[]);
  const heights = new Array(count).fill(0);
  photos.forEach((photo, index) => {
    const shortest = heights.indexOf(Math.min(...heights));
    columns[shortest].push(index);
    heights[shortest] += photo.thumbHeight / photo.thumbWidth;
  });
  return columns;
}

function PhotoTile({
  photo,
  onOpen,
  column,
}: {
  photo: LetPhoto;
  onOpen: () => void;
  column: number;
}) {
  const { t } = useTranslation();
  const formatDate = useArticleDate();
  const [loaded, setLoaded] = useState(false);
  // Entra con animación al llegar a pantalla
  const { ref, inView } = useInView<HTMLElement>(0.1);

  return (
    <figure
      ref={ref}
      className={`group relative overflow-hidden rounded-xl bg-neutral-100 transition-[opacity,translate] duration-700 ease-out ${
        inView
          ? "translate-y-0 opacity-100"
          : "opacity-0 motion-safe:translate-y-8"
      }`}
      style={{ transitionDelay: inView ? `${column * 70}ms` : "0ms" }}
    >
      <button
        type="button"
        onClick={onOpen}
        aria-label={`${t("galleryPage.open")}: ${photo.title}`}
        className="relative block w-full cursor-zoom-in focus:outline-none focus-visible:ring-4 focus-visible:ring-[#2A579E]/40"
        // El lugar de la foto queda reservado antes de que cargue
        style={{ aspectRatio: `${photo.thumbWidth} / ${photo.thumbHeight}` }}
      >
        <img
          src={photo.thumb}
          alt={photo.title}
          width={photo.thumbWidth}
          height={photo.thumbHeight}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          className={`absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-700 group-hover:scale-105 ${
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
  const columnCount = useColumnCount();
  const columns = useMemo(
    () => toColumns(shown, columnCount),
    [shown, columnCount],
  );

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
            {/* Sin título visible: solo para lectores de pantalla */}
            <h1 className="sr-only">{t("galleryPage.title")}</h1>

            {photos && (
              <div className="-mx-4 flex items-center gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:px-0">
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
              <div aria-hidden="true" className="flex gap-3 md:gap-4">
                {Array.from({ length: columnCount }, (_, c) => (
                  <div key={c} className="flex flex-1 flex-col gap-3 md:gap-4">
                    {Array.from({ length: 4 }, (_, i) => (
                      <div
                        key={i}
                        className="animate-pulse rounded-xl bg-neutral-100"
                        style={{
                          aspectRatio: (c + i) % 3 === 1 ? "2 / 3" : "3 / 2",
                        }}
                      />
                    ))}
                  </div>
                ))}
              </div>
            )}
            {photos && (
              <div className="flex items-start gap-3 md:gap-4">
                {columns.map((indexes, column) => (
                  <div
                    key={column}
                    className="flex min-w-0 flex-1 flex-col gap-3 md:gap-4"
                  >
                    {indexes.map((index) => (
                      <PhotoTile
                        key={shown[index].id}
                        photo={shown[index]}
                        column={column}
                        onOpen={() => setOpenIndex(index)}
                      />
                    ))}
                  </div>
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
