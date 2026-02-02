import { useTranslation } from "react-i18next";
import NewsSection from "../../components/newsCard";

const NewsPage = () => {
  const { t } = useTranslation("global");

  return (
    <main className="relative min-h-screen bg-gray-50">
      {/* Fondo decorativo opcional o simple */}
      <div className="mx-auto max-w-7xl px-4 pt-40 pb-16 md:px-8 lg:px-12">
        <div className="mb-12 text-center">
          <h1 className="font-signature text-5xl md:text-6xl text-[#2A579E] font-bold drop-shadow-sm mb-4">
            {t("newsPage.title")}
          </h1>
          <div className="w-24 h-1 bg-[#2A579E] mx-auto rounded-full"></div>
          <p className="mt-6 text-gray-600 max-w-2xl mx-auto text-lg">
            {t("newsPage.description")}
          </p>
        </div>

        <NewsSection />
      </div>
    </main>
  );
};

export default NewsPage;
