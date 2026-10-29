import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ArticleCard from "../../components/news/ArticleCard";
import { AnimateOnScroll } from "../../components/animation";
import { fetchNuriaNews, type LetArticle } from "../../data/letNews";

// Las 3 noticias más recientes del LET sobre Nuria
export default function LatestNews() {
  const { t } = useTranslation();
  const [articles, setArticles] = useState<LetArticle[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetchNuriaNews()
      .then((all) => !cancelled && setArticles(all.slice(0, 3)))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // Si la API del LET no responde, la sección no se muestra
  if (!articles.length) return null;

  return (
    <section className="bg-[#F8FAFD] py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <AnimateOnScroll
          as="header"
          y={24}
          x={0}
          scale={1}
          className="mb-10 flex flex-wrap items-end justify-between gap-4"
        >
          <h2 className="font-signature text-4xl text-[#2A579E] md:text-5xl">
            {t("latestNews.title")}
          </h2>
          <Link
            to="/news"
            className="group inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[#1B3A75] hover:text-[#2A579E]"
          >
            {t("latestNews.viewAll")}
            <svg
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
        </AnimateOnScroll>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article, index) => (
            <AnimateOnScroll
              key={article.id}
              as="div"
              y={50}
              x={0}
              scale={1}
              delay={index * 0.12}
              className={index === 2 ? "hidden lg:block" : ""}
            >
              <ArticleCard article={article} />
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
