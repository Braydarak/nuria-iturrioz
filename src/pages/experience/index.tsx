import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ExperienceIntro from "../../components/experience-intro";
import ExperienceParts from "../../components/experience-parts";
import HeaderExperience from "../../components/experience-parts/headerExperience";
import Footer from "../../components/footer";

const ExperiencePage = () => {
  const [showContent, setShowContent] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 6500);
    return () => clearTimeout(timer);
  }, []);

  return (
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
  );
};

export default ExperiencePage;
