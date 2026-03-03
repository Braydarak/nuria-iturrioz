import { useState } from "react";
import { useLetNews, type NewsItem } from "../../data/news";
import letLogo from "../../assets/LET-LOGO.webp";
import AnimatedLoader from "../animatedLoader";
import { useTranslation } from "react-i18next";

// Import Nuria images
import nuria1 from "../../assets/nuria/Nuria1.jpg";
import nuria2 from "../../assets/nuria/Nuria2.jpg";
import nuria3 from "../../assets/nuria/Nuria3.JPG";
import nuria4 from "../../assets/nuria/Nuria4.JPG";
import nuria5 from "../../assets/nuria/Nuria5.jpg";
import nuria6 from "../../assets/nuria/Nuria6.JPG";
import nuria7 from "../../assets/nuria/Nuria7.JPG";
import nuria8 from "../../assets/nuria/Nuria8.JPG";
import nuria9 from "../../assets/nuria/Nuria9.jpg";
import nuria10 from "../../assets/nuria/Nuria10.jpg";
import nuria11 from "../../assets/nuria/Nuria11.JPG";
import nuria12 from "../../assets/nuria/Nuria12.JPG";
import nuria13 from "../../assets/nuria/Nuria13.jpg";

const nuriaImages = [
  nuria1,
  nuria2,
  nuria3,
  nuria4,
  nuria5,
  nuria6,
  nuria7,
  nuria8,
  nuria9,
  nuria10,
  nuria11,
  nuria12,
  nuria13,
];

const NewsCard = ({
  item,
  t,
  getThumbnail,
}: {
  item: NewsItem;
  t: (key: string) => string;
  getThumbnail: (item: NewsItem) => string;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  // Aumentamos el umbral para que coincida aproximadamente con 5 líneas de texto
  const isLongText = item.description.length > 300;

  return (
    <div className="group flex flex-col bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow h-full">
      <div className="relative h-64 w-full overflow-hidden bg-gray-100">
        <img
          src={getThumbnail(item)}
          alt={item.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            e.currentTarget.src = "/NuriaLogo.blue.svg";
            e.currentTarget.onerror = null;
          }}
        />
      </div>
      <div className="p-6 flex flex-col h-full">
        <p className="text-sm text-[#2A579E] font-bold mb-2">
          {new Date(item.pubDate).toLocaleDateString()}
        </p>
        <h3 className="text-xl font-bold text-black mb-3 group-hover:text-[#2A579E] transition-colors">
          {item.title}
        </h3>
        <div
          className="text-gray-600 mb-2 grow whitespace-pre-line"
          style={
            !isExpanded
              ? {
                  display: "-webkit-box",
                  WebkitLineClamp: 5,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }
              : {}
          }
        >
          {item.description}
        </div>
        {isLongText && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[#2A579E] font-bold text-sm hover:underline mb-4 inline-block w-fit text-left cursor-pointer"
          >
            {isExpanded ? t("newsPage.readLess") : t("newsPage.readMore")}
          </button>
        )}
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
  );
};

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

  const getThumbnail = (item: NewsItem) => {
    if (
      !item.thumbnail ||
      item.thumbnail.trim() === "" ||
      item.thumbnail.includes("emoji")
    ) {
      // Deterministic selection based on link to keep it consistent across renders
      const sum = item.link
        .split("")
        .reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const index = sum % nuriaImages.length;
      return nuriaImages[index];
    }
    return item.thumbnail;
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
          <NewsCard
            key={item.link}
            item={item}
            t={t}
            getThumbnail={getThumbnail}
          />
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
