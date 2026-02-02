import { useState } from "react";
import { useLetNews } from "../../data/news";
import letLogo from "../../assets/LET-LOGO.webp";
import AnimatedLoader from "../animatedLoader";
import { useTranslation } from "react-i18next";

const NewsSection = () => {
  const { t } = useTranslation("global");
  const { news, loading, error } = useLetNews();
  const [visibleCount, setVisibleCount] = useState(() => {
    // Check window if available during initialization (safe for client-side only apps like Vite)
    if (typeof window !== "undefined") {
      return window.innerWidth < 768 ? 4 : 6;
    }
    return 6;
  });

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 6);
  };

  if (loading)
    return (
      <div className="flex w-full justify-center items-center">
        <AnimatedLoader />
      </div>
    );
  if (error) return null;

  const displayedNews = news.slice(0, visibleCount);

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {displayedNews.map((item) => (
          <div
            key={item.link}
            className="group flex flex-col bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow h-full"
          >
            <div className="p-6 flex flex-col h-full">
              <p className="text-sm text-[#2A579E] font-bold mb-2">
                {new Date(item.pubDate).toLocaleDateString()}
              </p>
              <h3 className="text-xl font-bold text-black mb-3 group-hover:text-[#2A579E] transition-colors">
                {item.title}
              </h3>
              <p className="text-gray-600 line-clamp-3 mb-4 grow">
                {item.description}
              </p>
              <div className="mt-auto pt-4">
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full bg-[#2A579E] text-white font-bold py-2 px-4 rounded hover:bg-[#1B3A75] transition-colors"
                >
                  <span>{t("newsPage.viewOnLet")}</span>
                  <img
                    src={letLogo}
                    alt="LET Logo"
                    className="h-10 w-auto filter brightness-0 invert"
                  />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {visibleCount < news.length && (
        <div className="flex justify-center">
          <button
            onClick={handleLoadMore}
            className="px-6 py-3 border-2 border-[#2A579E] text-[#2A579E] font-bold rounded-full hover:bg-[#2A579E] hover:text-white transition-all duration-300"
          >
            {t("newsPage.loadMore")}
          </button>
        </div>
      )}
    </div>
  );
};

export default NewsSection;
