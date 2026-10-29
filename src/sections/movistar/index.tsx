import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AnimateOnScroll } from "../../components/animation";

const MOVISTAR_URL =
  "https://www.movistarplus.es/deportes/programa/suenos-de-golf-2022/nuria-iturrioz-con-z-de-raza/ficha?tipo=E&id=2033923";
const SUENOS_POSTER_PATH = "movistar-serie.avif";

function MovistarPlusLogo({
  className,
  title = "movistarplus+",
}: {
  className?: string;
  title?: string;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 102 45"
      role="img"
      aria-label={title}
      className={className}
    >
      <title>{title}</title>
      <g fill="currentColor" fillRule="evenodd">
        <path d="M11.654 5.211c-2.872.047-8.175 1.44-10.597 11.167-1.055 4.24-1.462 8.658-.558 13.915.83 4.852 2.307 9.038 3.301 11.345a10.1 10.1 0 0 0 1.285 2.135c1.18 1.466 3.146 1.372 3.97.974.9-.435 1.934-1.49 1.56-3.89-.18-1.16-.703-2.858-.997-3.803-.9-2.895-2.1-6.388-2.206-8.877-.138-3.33 1.196-3.766 2.083-3.957 1.49-.322 2.74 1.287 3.927 3.306 1.417 2.405 3.846 6.672 5.825 9.931 1.79 2.94 5.088 6.091 10.389 5.875 5.404-.222 9.385-2.248 11.436-8.63 1.536-4.774 2.582-8.344 4.267-11.995 1.935-4.204 4.517-6.453 6.694-5.765 2.02.636 2.523 2.579 2.547 5.431.022 2.523-.276 5.307-.506 7.351-.083.741-.236 2.233-.174 3.062.122 1.63.839 3.257 2.704 3.515 1.987.28 3.581-1.283 4.216-3.172.253-.742.468-1.882.582-2.687.585-4.078.737-6.821.473-10.994-.31-4.88-1.28-9.331-2.974-13.181-1.62-3.683-4.223-6.043-7.563-6.252-3.695-.23-7.936 2.181-10.16 6.858-2.051 4.313-3.693 8.74-4.688 11-1.01 2.29-2.492 3.704-4.772 3.941-2.79.29-5.192-1.704-6.952-4.542-1.535-2.474-4.576-7.186-6.202-8.77-1.529-1.486-3.275-3.346-6.91-3.29M102 18.049H90.95V7h-8.9v11.049H71v8.902h11.05V38h8.9V26.951H102z"></path>
      </g>
    </svg>
  );
}

export default function MovistarSection() {
  const { t } = useTranslation();
  const posterSrc = `${import.meta.env.BASE_URL}${SUENOS_POSTER_PATH}`;
  const [hasPoster, setHasPoster] = useState(true);

  return (
    <section className="relative overflow-hidden bg-linear-to-br from-[#1B3A75] via-[#24508f] to-[#2A579E] pb-24 pt-16 text-white md:pb-36 md:pt-24">
      {/* Halo de color detrás del póster */}
      <div className="pointer-events-none absolute -left-32 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-[#3C7BEA]/35 blur-3xl" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 sm:px-6 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
        <AnimateOnScroll x={-60} y={0} scale={1}>
          <a
            href={MOVISTAR_URL}
            target="_blank"
            rel="noreferrer"
            aria-label={t("movistar.ctaAria")}
            className="group relative block aspect-video overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/10"
          >
            {hasPoster ? (
              <img
                src={posterSrc}
                alt={t("movistar.episodeTitle")}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
                decoding="async"
                onError={() => setHasPoster(false)}
              />
            ) : (
              <div className="absolute inset-0 bg-linear-to-br from-[#1B3A75] to-[#3C7BEA]" />
            )}
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-black/20" />
            <MovistarPlusLogo className="absolute left-5 top-5 h-7 w-auto text-white drop-shadow" />
            {/* Botón de reproducción */}
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 text-[#1B3A75] shadow-xl transition-transform duration-300 group-hover:scale-110">
                <svg
                  viewBox="0 0 24 24"
                  className="ml-1 h-7 w-7"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z" />
                </svg>
              </span>
            </span>
          </a>
        </AnimateOnScroll>

        <AnimateOnScroll x={60} y={0} scale={1} delay={0.1}>
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-blue-200/80">
            {t("movistar.kicker")}
          </p>
          <h2 className="mt-3 text-3xl font-bold leading-tight md:text-4xl">
            {t("movistar.episodeTitle")}
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-blue-100/85">
            {t("movistar.episodeDescription")}
          </p>
          <a
            href={MOVISTAR_URL}
            target="_blank"
            rel="noreferrer"
            aria-label={t("movistar.ctaAria")}
            className="group mt-8 inline-flex items-center gap-3 rounded-full bg-white px-6 py-3.5 font-bold text-[#1B3A75] shadow-lg transition-colors hover:bg-[#E6F0FF]"
          >
            <MovistarPlusLogo className="h-5 w-auto" />
            <span className="whitespace-nowrap">{t("movistar.cta")}</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              aria-hidden="true"
            >
              <path d="M14 3h7v7" />
              <path d="M10 14 21 3" />
              <path d="M21 14v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6" />
            </svg>
          </a>
        </AnimateOnScroll>
      </div>
      {/* Fundido a blanco para entrar suave en la galería */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-linear-to-b from-transparent to-white md:h-28" />
    </section>
  );
}
