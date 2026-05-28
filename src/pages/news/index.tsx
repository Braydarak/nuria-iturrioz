import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import NewsSection from "../../components/newsCard";
import Animation, { AnimateOnScroll } from "../../components/animation";
import { DEFAULT_OG_IMAGE_URL, SITE_URL } from "../../utils/constants";

const NewsPage = () => {
  const { t } = useTranslation("global");
  const title = `${t("newsPage.title")} – Nuria Iturrioz`;
  const description = t("newsPage.description");
  const url = `${SITE_URL}/news`;

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
      <main className="relative min-h-screen bg-gray-50">
        <Animation start="top bottom">
          <div className="mx-auto max-w-7xl px-4 pt-40 pb-16 md:px-8 lg:px-12">
            <div className="mb-12 text-center">
              <AnimateOnScroll as="h1" y={20} x={0} scale={1} delay={0}>
                <span className="font-signature text-5xl md:text-6xl text-[#2A579E] font-bold drop-shadow-sm mb-4 block">
                  {t("newsPage.title")}
                </span>
              </AnimateOnScroll>
              <AnimateOnScroll y={20} x={0} scale={1} delay={0.05}>
                <div className="w-24 h-1 bg-[#2A579E] mx-auto rounded-full"></div>
              </AnimateOnScroll>
              <AnimateOnScroll as="p" y={20} x={0} scale={1} delay={0.1}>
                <span className="mt-6 text-gray-600 max-w-2xl mx-auto text-lg block">
                  {t("newsPage.description")}
                </span>
              </AnimateOnScroll>
            </div>

            <AnimateOnScroll y={20} x={0} scale={1} delay={0.15}>
              <NewsSection />
            </AnimateOnScroll>
          </div>
        </Animation>
      </main>
    </>
  );
};

export default NewsPage;
