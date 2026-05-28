import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import ExperienceIntro from "../../components/experience-intro";
import ExperienceParts from "../../components/experience-parts";
import HeaderExperience from "../../components/experience-parts/headerExperience";
import Footer from "../../components/footer";
import { DEFAULT_OG_IMAGE_URL, SITE_URL } from "../../utils/constants";

const ExperiencePage = () => {
  const [showContent, setShowContent] = useState(false);
  const { t } = useTranslation();
  const title = "Experiencia – Nuria Iturrioz";
  const description =
    "Una experiencia interactiva para conocer más sobre Nuria Iturrioz: contenido y actividades especiales.";
  const url = `${SITE_URL}/experience`;

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 6500);
    return () => clearTimeout(timer);
  }, []);

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
      <div className="relative w-full min-h-screen bg-white overflow-hidden font-sans">
        <ExperienceIntro />
        {showContent && (
          <div className="absolute inset-0 w-full min-h-screen overflow-auto">
            <HeaderExperience />
            <div className="animate-fade-in mt-20">
              <ExperienceParts />
            </div>
            <div className="mx-auto max-w-6xl px-4 pb-10">
              <div className="flex justify-center">
                <Link
                  to="/"
                  className="inline-flex items-center justify-center px-8 py-3 border-2 border-[#004b9f] text-[#004b9f] rounded-full font-bold text-lg hover:bg-blue-50 transition-colors cursor-pointer"
                >
                  {t("experience.backToWebsite", "Back to the website")}
                </Link>
              </div>
            </div>
            <Footer />
          </div>
        )}
      </div>
    </>
  );
};

export default ExperiencePage;
