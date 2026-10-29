import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { LetArticle } from "../../data/letNews";
import { useArticleDate } from "../../hooks/useArticleDate";

function Meta({ article }: { article: LetArticle }) {
  const { t } = useTranslation();
  const formatDate = useArticleDate();
  return (
    <p className="flex flex-wrap items-center gap-x-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">
      <time dateTime={article.date}>{formatDate(article.date)}</time>
      {article.readingMinutes && (
        <>
          <span aria-hidden="true">·</span>
          <span>
            {t("newsPage.minRead", { count: article.readingMinutes })}
          </span>
        </>
      )}
    </p>
  );
}

function Category({ name }: { name?: string }) {
  if (!name) return null;
  return (
    <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#1B3A75] shadow-sm">
      {name}
    </span>
  );
}

const Arrow = () => (
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
);

export default function ArticleCard({
  article,
  featured = false,
}: {
  article: LetArticle;
  featured?: boolean;
}) {
  const { t } = useTranslation();

  if (featured) {
    return (
      <Link
        to={`/news/${article.slug}`}
        className="group grid overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-neutral-200 transition-shadow hover:shadow-xl md:grid-cols-[1.35fr_1fr]"
      >
        <div className="relative aspect-16/10 overflow-hidden bg-neutral-100 md:aspect-auto md:min-h-96">
          {article.imageLarge && (
            <img
              src={article.imageLarge}
              alt=""
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          )}
          <Category name={article.categories[0]} />
        </div>
        <div className="flex flex-col justify-center gap-4 p-6 md:p-10">
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#2A579E]">
            {t("newsPage.featured")}
          </span>
          <h2 className="text-2xl font-bold leading-tight text-neutral-900 transition-colors group-hover:text-[#2A579E] md:text-3xl">
            {article.title}
          </h2>
          <Meta article={article} />
          <p className="line-clamp-4 text-neutral-600">{article.excerpt}</p>
          <span className="mt-2 inline-flex items-center gap-2 font-bold text-[#2A579E]">
            {t("newsPage.readArticle")}
            <Arrow />
          </span>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/news/${article.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-neutral-200 transition-shadow hover:shadow-lg"
    >
      <div className="relative aspect-16/10 overflow-hidden bg-neutral-100">
        {article.image && (
          <img
            src={article.image}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        )}
        <Category name={article.categories[0]} />
      </div>
      <div className="flex grow flex-col gap-3 p-5 md:p-6">
        <Meta article={article} />
        <h3 className="text-lg font-bold leading-snug text-neutral-900 transition-colors group-hover:text-[#2A579E]">
          {article.title}
        </h3>
        <p className="line-clamp-3 text-sm text-neutral-600">
          {article.excerpt}
        </p>
        <span className="mt-auto inline-flex items-center gap-2 pt-2 text-sm font-bold text-[#2A579E]">
          {t("newsPage.readArticle")}
          <Arrow />
        </span>
      </div>
    </Link>
  );
}
