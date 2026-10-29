import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import trophiesData from "../../data/trophies.json";

const trophyImages = import.meta.glob(
  "../../assets/trophies/*.{png,webp,jpg,jpeg,avif}",
  { eager: true, import: "default" },
) as Record<string, string>;

const getImagePath = (jsonPath: string) => {
  const filename = jsonPath.split("/").pop();
  if (!filename) return "";
  const key = Object.keys(trophyImages).find((k) => k.endsWith(filename));
  return key ? trophyImages[key] : "";
};

// Dos repisas completas en desktop (5 por fila)
const PAGE_SIZE = 10;
const GOLD = "#D4B26A";

// Cuántos trofeos muestra el adelanto de la home
const PREVIEW_SIZE = 4;

const pickRandom = <T,>(items: T[], count: number) =>
  [...items].sort(() => Math.random() - 0.5).slice(0, count);

/**
 * Sala de trofeos completa (Carrera) o un adelanto con algunos trofeos al
 * azar y un enlace a la sala (home).
 */
export default function TrophyMuseum({
  preview = false,
}: {
  preview?: boolean;
}) {
  const { t } = useTranslation();
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const trophies = trophiesData.trophies;
  // Se guarda el número original de cada trofeo para su placa
  const [previewItems] = useState(() =>
    pickRandom(
      trophies.map((trophy, index) => ({ trophy, index })),
      PREVIEW_SIZE,
    ),
  );
  const shown = preview
    ? previewItems
    : trophies
        .slice(0, visibleCount)
        .map((trophy, index) => ({ trophy, index }));

  return (
    <section
      aria-labelledby="trophy-museum-title"
      className="relative overflow-hidden py-24 md:py-32 text-white"
      style={{
        background:
          "radial-gradient(ellipse 80% 60% at 50% 0%, #1E3A6E 0%, #0F2148 45%, #081430 100%)",
      }}
    >
      <style>{`
        .museum-wall {
          background-image: repeating-linear-gradient(90deg, rgba(255,255,255,0.025) 0 1px, transparent 1px 140px);
        }
        .museum-niche {
          background: linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 55%, rgba(255,255,255,0.02) 100%);
          box-shadow: inset 0 10px 30px rgba(0,0,0,0.35), inset 0 -1px 0 rgba(255,255,255,0.06);
        }
        .museum-spot {
          background: radial-gradient(ellipse 50% 70% at 50% 0%, rgba(255,240,205,0.42) 0%, rgba(255,240,205,0.12) 45%, transparent 75%);
          transition: opacity 500ms ease;
        }
        .museum-item:hover .museum-spot { opacity: 1; }
        .museum-pool {
          background: radial-gradient(ellipse 50% 50% at 50% 50%, rgba(255,236,190,0.30), transparent 70%);
        }
        .museum-trophy {
          filter: drop-shadow(0 14px 12px rgba(0,0,0,0.55));
          transition: transform 500ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        .museum-item:hover .museum-trophy { transform: translateY(-6px); }
        .museum-shelf {
          background: linear-gradient(180deg, #4A5F86 0%, #2A3B5E 35%, #17243F 100%);
          box-shadow: 0 18px 24px -12px rgba(0,0,0,0.7);
        }
        .museum-plaque {
          background: linear-gradient(135deg, #F1E1B5 0%, ${GOLD} 45%, #B8934A 100%);
          box-shadow: 0 2px 6px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.5);
        }
        @media (prefers-reduced-motion: reduce) {
          .museum-item:hover .museum-trophy { transform: none; }
        }
      `}</style>

      <div className="museum-wall pointer-events-none absolute inset-0" />

      <div className="relative mx-auto max-w-7xl px-4">
        <header className="mb-16 md:mb-20 text-center">
          <p
            className="text-xs font-bold uppercase tracking-[0.35em]"
            style={{ color: GOLD }}
          >
            {t("trophies.eyebrow")}
          </p>
          <h2
            id="trophy-museum-title"
            className="mt-3 font-signature text-5xl md:text-6xl text-white"
          >
            {t("trophies.title")}
          </h2>
          <div className="mx-auto mt-5 flex items-center justify-center gap-3 text-sm text-blue-100/70">
            <span className="h-px w-10" style={{ background: GOLD }} />
            {t("trophies.pieces", { count: trophies.length })}
            <span className="h-px w-10" style={{ background: GOLD }} />
          </div>
        </header>

        <ul
          className={`grid gap-y-16 ${
            preview
              ? "grid-cols-2 lg:grid-cols-4"
              : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5"
          }`}
        >
          {shown.map(({ trophy, index }) => {
            const src = getImagePath(trophy.image);
            const number = String(index + 1).padStart(2, "0");
            const name = trophy.name ? t(trophy.name) : "";
            return (
              <li key={trophy.id} className="museum-item flex flex-col">
                <figure className="flex flex-col">
                  {/* Nicho con foco de luz */}
                  <div className="relative mx-3 md:mx-4 h-52 md:h-56 overflow-hidden rounded-t-full museum-niche">
                    <div className="absolute left-1/2 top-0 h-1.5 w-12 -translate-x-1/2 rounded-b-full bg-[#2C3E62] shadow-[0_2px_10px_rgba(255,236,190,0.6)]" />
                    <div className="museum-spot absolute inset-0 opacity-80" />
                    <div className="museum-pool absolute bottom-0 left-1/2 h-10 w-36 -translate-x-1/2 translate-y-1/2" />
                    {src && (
                      <img
                        src={src}
                        alt={name || t("trophies.title")}
                        loading="lazy"
                        decoding="async"
                        className="museum-trophy absolute bottom-1 left-1/2 h-32 md:h-36 w-auto max-w-[85%] -translate-x-1/2 object-contain"
                      />
                    )}
                  </div>

                  {/* Repisa (sin separación entre columnas para que sea continua) */}
                  <div className="museum-shelf h-3" />

                  {/* Placa */}
                  <figcaption className="museum-plaque mx-auto mt-5 w-[82%] rounded-[3px] px-2.5 py-2 text-center text-[#3A2D10]">
                    <span className="block text-[9px] font-bold uppercase tracking-[0.25em] opacity-70">
                      {t("trophies.plaqueNumber", { number })}
                    </span>
                    {name && (
                      <span className="mt-0.5 block text-[10px] md:text-[11px] font-bold uppercase leading-snug tracking-wide line-clamp-3">
                        {name}
                      </span>
                    )}
                  </figcaption>
                </figure>
              </li>
            );
          })}
        </ul>

        {preview && (
          <div className="mt-16 flex justify-center">
            <Link
              to="/carrer"
              className="group inline-flex items-center gap-3 rounded-full border px-8 py-4 text-xs font-bold uppercase tracking-widest transition-colors hover:bg-[#D4B26A] hover:text-[#081430]"
              style={{ borderColor: GOLD, color: GOLD }}
            >
              {t("trophies.viewAll")}
              <svg
                className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 12h14M13 6l6 6-6 6"
                />
              </svg>
            </Link>
          </div>
        )}

        {!preview && visibleCount < trophies.length && (
          <div className="mt-16 flex justify-center">
            <button
              type="button"
              onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
              className="group inline-flex items-center gap-3 rounded-full border px-8 py-4 text-xs font-bold uppercase tracking-widest transition-colors hover:bg-[#D4B26A] hover:text-[#081430]"
              style={{ borderColor: GOLD, color: GOLD }}
            >
              {t("trophies.loadMore")}
              <svg
                className="h-4 w-4 transition-transform duration-300 group-hover:translate-y-0.5"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
