import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import ArticleCard from "../../components/news/ArticleCard";
import AnimatedLoader from "../../components/animatedLoader";
import {
  fetchArticle,
  fetchNuriaNews,
  type LetArticle,
} from "../../data/letNews";
import { useArticleDate } from "../../hooks/useArticleDate";
import { SITE_URL } from "../../utils/constants";
import letLogo from "../../assets/LET-LOGO.webp";

export default function ArticlePage() {
  const { slug = "" } = useParams();
  const { t } = useTranslation();
  const formatDate = useArticleDate();
  // Se guarda junto al slug: al cambiar de noticia vuelve a "cargando"
  const [loaded, setLoaded] = useState<{
    slug: string;
    article: LetArticle | null;
  } | null>(null);
  const article = loaded?.slug === slug ? loaded.article : undefined;
  const [related, setRelated] = useState<LetArticle[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetchArticle(slug)
      .then((a) => !cancelled && setLoaded({ slug, article: a }))
      .catch(() => !cancelled && setLoaded({ slug, article: null }));
    fetchNuriaNews()
      .then(
        (all) =>
          !cancelled &&
          setRelated(all.filter((a) => a.slug !== slug).slice(0, 3)),
      )
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return (
    <>
      {article && (
        <Helmet>
          <title>{`${article.title} – Nuria Iturrioz`}</title>
          <meta name="description" content={article.excerpt} />
          <link rel="canonical" href={`${SITE_URL}/news/${article.slug}`} />
          <meta property="og:type" content="article" />
          <meta property="og:title" content={article.title} />
          <meta property="og:description" content={article.excerpt} />
          {article.imageLarge && (
            <meta property="og:image" content={article.imageLarge} />
          )}
        </Helmet>
      )}

      <style>{`
        .article-body { color: #333b48; font-size: 1.125rem; line-height: 1.8; }
        .article-body > * + * { margin-top: 1.4em; }
        .article-body a { color: #2A579E; font-weight: 600; text-decoration: underline; text-underline-offset: 3px; text-decoration-thickness: 1px; }
        .article-body a:hover { color: #1B3A75; }
        .article-body em { color: #1f2937; }
        .article-body h2, .article-body h3, .article-body h4 { color: #1B3A75; font-weight: 700; line-height: 1.3; margin-top: 2em; }
        .article-body h4 { font-size: 1.25rem; }
        .article-body figure { margin: 2em 0; }
        .article-body img { width: 100%; height: auto; border-radius: 1rem; }
        .article-body figcaption { margin-top: .6em; font-size: .875rem; color: #6b7280; text-align: center; }
        .article-body blockquote { border-left: 4px solid #2A579E; padding: .25em 0 .25em 1.25em; color: #1f2937; font-style: italic; }
        .article-body ul { list-style: disc; padding-left: 1.4em; }
        .article-body ol { list-style: decimal; padding-left: 1.4em; }
        .article-body li + li { margin-top: .4em; }
        @media (max-width: 640px) { .article-body { font-size: 1.0625rem; line-height: 1.75; } }
      `}</style>

      <main className="min-h-screen bg-white pt-[68px] md:pt-[84px]">
        <div className="mx-auto max-w-3xl px-5 pb-16 pt-8 sm:px-6 md:pt-12">
          <Link
            to="/news"
            className="group inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[#2A579E]"
          >
            <svg
              className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M19 12H5M11 18l-6-6 6-6" />
            </svg>
            {t("newsPage.back")}
          </Link>

          {article === undefined && (
            <div className="flex justify-center py-24">
              <AnimatedLoader />
            </div>
          )}

          {article === null && (
            <p className="mt-10 rounded-xl border border-neutral-200 bg-neutral-50 p-6 text-neutral-700">
              {t("newsPage.notFound")}
            </p>
          )}

          {article && (
            <article className="mt-8">
              <header>
                {article.categories[0] && (
                  <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#2A579E]">
                    {article.categories[0]}
                  </span>
                )}
                <h1 className="mt-3 text-3xl font-bold leading-tight text-neutral-900 md:text-5xl">
                  {article.title}
                </h1>
                <p className="mt-5 flex flex-wrap items-center gap-x-2 text-sm font-semibold uppercase tracking-wider text-neutral-500">
                  <time dateTime={article.date}>
                    {formatDate(article.date)}
                  </time>
                  {article.readingMinutes && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span>
                        {t("newsPage.minRead", {
                          count: article.readingMinutes,
                        })}
                      </span>
                    </>
                  )}
                </p>
              </header>

              {article.imageLarge && (
                <img
                  src={article.imageLarge}
                  alt=""
                  className="mt-8 aspect-16/10 w-full rounded-2xl object-cover shadow-lg md:-mx-12 md:w-[calc(100%+6rem)] md:max-w-none"
                />
              )}

              <div
                className="article-body mt-10"
                // Contenido sanitizado con DOMPurify en data/letNews
                dangerouslySetInnerHTML={{ __html: article.contentHtml ?? "" }}
              />

              <footer className="mt-12 flex flex-col items-start gap-4 rounded-2xl bg-[#F8FAFD] p-6 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-neutral-600">
                  {t("newsPage.source")}
                </p>
                <a
                  href={article.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex shrink-0 items-center gap-3 rounded-full bg-[#1B3A75] py-2 pl-5 pr-3 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-[#2A579E]"
                >
                  {t("newsPage.viewOnLet")}
                  <img
                    src={letLogo}
                    alt="LET"
                    className="h-7 w-auto brightness-0 invert"
                  />
                </a>
              </footer>
            </article>
          )}
        </div>

        {article && related.length > 0 && (
          <section className="bg-[#F8FAFD] py-14 md:py-20">
            <div className="mx-auto max-w-6xl px-5 sm:px-6">
              <h2 className="mb-8 font-signature text-3xl text-[#2A579E] md:text-5xl">
                {t("newsPage.related")}
              </h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((a) => (
                  <ArticleCard key={a.id} article={a} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </>
  );
}
