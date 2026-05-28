import { useState } from "react";
import { useTranslation } from "react-i18next";

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
    <section className="relative overflow-hidden bg-white text-[#1B3A75]">
      <div className="relative mx-auto max-w-screen px-8 md:px-16 lg:px-24 py-10 md:py-12">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-16 lg:justify-center">
          <div className="lg:justify-self-center w-full">
            <div className="relative overflow-hidden rounded-2xl ring-1 ring-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.08)] bg-white">
              <div className="relative h-[280px] sm:h-[320px] lg:h-[260px]">
                {hasPoster ? (
                  <img
                    src={posterSrc}
                    alt={t("movistar.episodeTitle")}
                    className="absolute inset-0 h-full w-full object-cover"
                    loading="lazy"
                    decoding="async"
                    onError={() => setHasPoster(false)}
                  />
                ) : (
                  <div className="absolute inset-0">
                    <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-[#A8D0FF]/35 blur-3xl" />
                    <div className="absolute top-16 right-0 h-72 w-72 rounded-full bg-[#3C7BEA]/25 blur-3xl" />
                  </div>
                )}

                <div className="absolute inset-0 bg-linear-to-t from-black/65 via-black/15 to-transparent" />

                <div className="absolute top-4 left-4">
                  <MovistarPlusLogo className="h-7 w-auto text-white drop-shadow" />
                </div>
              </div>

              <div className="h-1 w-full bg-linear-to-r from-[#1B3A75] via-[#2A579E] to-[#3C7BEA]" />
            </div>
          </div>

          <div className="space-y-4 lg:pl-16 lg:justify-self-end">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold leading-tight uppercase tracking-wide">
              {t("movistar.episodeTitle")}
            </h2>

            <div className="text-[#1B3A75]/85 text-base md:text-lg leading-relaxed max-w-xl">
              {t("movistar.description")}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-1">
              <a
                href={MOVISTAR_URL}
                target="_blank"
                rel="noreferrer"
                aria-label={t("movistar.ctaAria")}
                className="group inline-flex items-center justify-center gap-3 rounded-full bg-[#1B3A75] text-white px-6 py-3.5 text-base md:text-lg font-extrabold shadow-lg hover:bg-[#2A579E] hover:shadow-blue-900/20 transition-all duration-200"
              >
                <MovistarPlusLogo className="h-6 w-auto text-white" />
                <span className="whitespace-nowrap">{t("movistar.cta")}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-transform duration-200 group-hover:translate-x-1"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path d="M14 3h7v7" />
                  <path d="M10 14 21 3" />
                  <path d="M21 14v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="mb-8 md:mb-10 flex justify-center">
        <div className="h-[2px] w-[70%] bg-[#2A579E]" />
      </div>
    </section>
  );
}
