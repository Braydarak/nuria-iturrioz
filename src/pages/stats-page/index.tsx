import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import SeasonStats from "../../components/season_stats";
import CareerKpis from "../../components/stats/CareerKpis";
import GameMetrics from "../../components/stats/GameMetrics";
import CareerRecords from "../../components/stats/CareerRecords";
import AnimatedLoader from "../../components/animatedLoader";
import Animation, { AnimateOnScroll } from "../../components/animation";
import { useLetCareer } from "../../data/letCareer";
import { DEFAULT_OG_IMAGE_URL, SITE_URL } from "../../utils/constants";

function SectionHeader({
  title,
  subtitle,
  light = false,
}: {
  title: string;
  subtitle?: string;
  light?: boolean;
}) {
  return (
    <header className="mb-8 md:mb-10">
      <h2
        className={`font-signature text-3xl sm:text-4xl md:text-5xl ${
          light ? "text-white" : "text-[#2A579E]"
        }`}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={`mt-2 ${light ? "text-blue-100/80" : "text-neutral-600"}`}
        >
          {subtitle}
        </p>
      )}
    </header>
  );
}

function Section({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`py-12 md:py-24 ${className}`}>
      <div className="mx-auto max-w-6xl px-5 sm:px-6">{children}</div>
    </section>
  );
}

export default function StatsPage() {
  const { t } = useTranslation();
  const { career, loading } = useLetCareer();
  const title = `${t("statsPage.title")} – Nuria Iturrioz`;
  const description = t("statsPage.description");
  const url = `${SITE_URL}/stats`;

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={url} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={url} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={DEFAULT_OG_IMAGE_URL} />
        <meta property="og:site_name" content="Nuria Iturrioz" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={url} />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={DEFAULT_OG_IMAGE_URL} />
      </Helmet>

      <style>{`
        .stats-dots {
          background:
            radial-gradient(circle, rgba(255,255,255,0.12) 1.6px, transparent 2px) 0 0/26px 26px,
            radial-gradient(circle, rgba(255,255,255,0.12) 1.6px, transparent 2px) 13px 13px/26px 26px;
        }
      `}</style>

      <main className="w-full bg-white pt-[68px] md:pt-[84px]">
        <Animation>
          {/* Encabezado + totales de carrera */}
          <Section className="pt-8 pb-10 md:pt-12 md:pb-16">
            <AnimateOnScroll y={20} x={0} scale={1}>
              <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#2A579E]/70">
                {t("statsPage.eyebrow")}
              </p>
              <h1 className="mt-3 font-signature text-5xl text-[#2A579E] md:text-7xl">
                {t("statsPage.title")}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-neutral-700 md:mt-6 md:text-lg">
                {t("statsPage.description")}
              </p>
            </AnimateOnScroll>
            <div className="mt-8 md:mt-12">
              {loading ? (
                <div className="flex justify-center py-10">
                  <AnimatedLoader />
                </div>
              ) : (
                career && <CareerKpis career={career} />
              )}
            </div>
          </Section>

          {/* Resultados por temporada */}
          <Section className="pt-4 md:pt-8">
            <SectionHeader
              title={t("seasonStats.title")}
              subtitle={t("seasonStats.description")}
            />
            <SeasonStats />
          </Section>
        </Animation>

        {/* Mi juego */}
        {career && (
          <section className="relative overflow-hidden bg-linear-to-br from-[#173a70] via-[#2A579E] to-[#1f4a8f] py-12 md:py-24">
            <div className="stats-dots pointer-events-none absolute inset-0 opacity-40" />
            <div className="relative mx-auto max-w-6xl px-5 sm:px-6">
              <SectionHeader
                title={t("statsPage.game.title")}
                subtitle={t("statsPage.game.subtitle")}
                light
              />
              <GameMetrics career={career} />
            </div>
          </section>
        )}

        {/* Récords */}
        {career && (
          <Section className="bg-[#F8FAFD]">
            <SectionHeader title={t("statsPage.records.title")} />
            <CareerRecords career={career} />
          </Section>
        )}
      </main>
    </>
  );
}
