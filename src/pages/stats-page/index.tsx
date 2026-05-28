import SeasonStats from "../../components/season_stats";
import StatsSection from "../../sections/stats";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import Animation, { AnimateOnScroll } from "../../components/animation";
import { DEFAULT_OG_IMAGE_URL, SITE_URL } from "../../utils/constants";

export default function StatsPage() {
  const { t } = useTranslation();
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
      <main className="mx-auto max-w-screen mt-40">
        {/* Bloque superior: Season Stats con fondo blanco */}
        <section className="bg-white">
          <Animation start="top bottom">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 pt-0">
              <header className="mb-8">
                <AnimateOnScroll as="h1" y={18} x={0} scale={1} delay={0}>
                  <span className="text-3xl sm:text-4xl font-semibold tracking-tight text-neutral-900 block">
                    {t("statsPage.title")}
                  </span>
                </AnimateOnScroll>
                <AnimateOnScroll as="p" y={18} x={0} scale={1} delay={0.06}>
                  <span className="mt-2 text-sm text-neutral-600 block">
                    {t("statsPage.subtitle")}
                  </span>
                </AnimateOnScroll>
                {/* Descripción de la sección de estadísticas */}
                <AnimateOnScroll as="p" y={18} x={0} scale={1} delay={0.12}>
                  <span className="mt-4 text-base text-neutral-700 block">
                    {t("statsPage.description")}
                  </span>
                </AnimateOnScroll>
              </header>
            </div>
            <AnimateOnScroll y={18} x={0} scale={1} delay={0.16}>
              <SeasonStats />
            </AnimateOnScroll>
          </Animation>
        </section>

        {/* Bloque inferior: otras estadísticas con fondo azul y textura sutil */}
        <section className="relative">
          <style>{`
            .stats-blue-bg {
              position: absolute; inset: 0; z-index: 0;
              background-image:
                radial-gradient(circle at 20% 20%, rgba(255,255,255,0.08), transparent 40%),
                radial-gradient(circle at 80% 30%, rgba(255,255,255,0.06), transparent 45%),
                radial-gradient(circle at 30% 80%, rgba(255,255,255,0.06), transparent 45%),
                linear-gradient(135deg, #173a70 0%, #2A579E 40%, #1f4a8f 100%);
            }
            /* Sutil patrón de puntos para evitar azul plano */
            .stats-blue-dots {
              position: absolute; inset: 0; z-index: 0; opacity: 0.35; pointer-events: none;
              background:
                radial-gradient(circle, rgba(255,255,255,0.12) 1.6px, transparent 2px) 0 0/26px 26px,
                radial-gradient(circle, rgba(255,255,255,0.12) 1.6px, transparent 2px) 13px 13px/26px 26px;
            }
          `}</style>

          <div className="stats-blue-bg" />
          <div className="stats-blue-dots" />

          <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
            <Animation start="top bottom">
              <AnimateOnScroll y={18} x={0} scale={1}>
                <StatsSection />
              </AnimateOnScroll>
            </Animation>
          </div>
        </section>
      </main>
    </>
  );
}
