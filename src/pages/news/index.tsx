import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import ArticleCard from "../../components/news/ArticleCard";
import AnimatedLoader from "../../components/animatedLoader";
import {
  fetchMentions,
  fetchNuriaNews,
  type LetArticle,
} from "../../data/letNews";
import { DEFAULT_OG_IMAGE_URL, SITE_URL } from "../../utils/constants";

type Tab = "nuria" | "mentions";
const PAGE_SIZE = 9;

const NewsPage = () => {
  const { t } = useTranslation();
  const title = `${t("newsPage.title")} – Nuria Iturrioz`;
  const description = t("newsPage.description");
  const url = `${SITE_URL}/news`;

  const [tab, setTab] = useState<Tab>("nuria");
  const [nuria, setNuria] = useState<LetArticle[] | null>(null);
  const [visible, setVisible] = useState(PAGE_SIZE + 1);
  const [mentions, setMentions] = useState<LetArticle[]>([]);
  const [mentionsPage, setMentionsPage] = useState(0);
  const [mentionsTotalPages, setMentionsTotalPages] = useState(1);
  const [loadingMentions, setLoadingMentions] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchNuriaNews()
      .then((articles) => !cancelled && setNuria(articles))
      .catch(() => !cancelled && setError(true));
    return () => {
      cancelled = true;
    };
  }, []);

  const loadMentions = async () => {
    setLoadingMentions(true);
    try {
      const next = mentionsPage + 1;
      const { articles, totalPages } = await fetchMentions(next);
      setMentions((prev) => [...prev, ...articles]);
      setMentionsPage(next);
      setMentionsTotalPages(totalPages);
    } catch {
      setError(true);
    } finally {
      setLoadingMentions(false);
    }
  };

  const openTab = (next: Tab) => {
    setTab(next);
    if (next === "mentions" && mentionsPage === 0) loadMentions();
  };

  const tabClass = (active: boolean) =>
    `relative whitespace-nowrap pb-3 text-xs font-bold uppercase tracking-wider transition-colors sm:text-sm sm:tracking-widest ${
      active ? "text-[#2A579E]" : "text-neutral-500 hover:text-[#1B3A75]"
    }`;

  const [featured, ...rest] = nuria ?? [];

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

      <main className="min-h-screen bg-[#F8FAFD] pt-[68px] md:pt-[84px]">
        <div className="mx-auto max-w-6xl px-5 pb-16 pt-8 sm:px-6 md:pb-24 md:pt-12">
          <h1 className="font-signature text-5xl text-[#2A579E] md:text-7xl">
            {t("newsPage.title")}
          </h1>

          <div
            role="tablist"
            className="mt-8 flex gap-6 border-b border-neutral-200 sm:gap-8 md:mt-12"
          >
            {(["nuria", "mentions"] as const).map((key) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={tab === key}
                onClick={() => openTab(key)}
                className={tabClass(tab === key)}
              >
                {key === "nuria"
                  ? t("newsPage.aboutNuria")
                  : t("newsPage.mentions")}
                {key === "nuria" && nuria && (
                  <span className="ml-2 rounded-full bg-[#2A579E]/10 px-2 py-0.5 text-[11px] text-[#2A579E]">
                    {nuria.length}
                  </span>
                )}
                <span
                  className={`absolute -bottom-px left-0 h-0.5 w-full bg-[#2A579E] transition-transform duration-300 ${
                    tab === key ? "scale-x-100" : "scale-x-0"
                  }`}
                />
              </button>
            ))}
          </div>

          <div className="mt-8 md:mt-10">
            {error && (
              <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
                {t("newsPage.error")}
              </p>
            )}

            {tab === "nuria" && !error && (
              <>
                {!nuria ? (
                  <div className="flex justify-center py-16">
                    <AnimatedLoader />
                  </div>
                ) : (
                  <div className="space-y-8 md:space-y-10">
                    {featured && <ArticleCard article={featured} featured />}
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {rest.slice(0, visible - 1).map((article) => (
                        <ArticleCard key={article.id} article={article} />
                      ))}
                    </div>
                    {visible - 1 < rest.length && (
                      <LoadMore
                        label={t("newsPage.loadMore")}
                        onClick={() => setVisible((v) => v + PAGE_SIZE)}
                      />
                    )}
                  </div>
                )}
              </>
            )}

            {tab === "mentions" && !error && (
              <div className="space-y-8">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {mentions.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>
                {loadingMentions ? (
                  <div className="flex justify-center py-8">
                    <AnimatedLoader />
                  </div>
                ) : (
                  mentionsPage < mentionsTotalPages && (
                    <LoadMore
                      label={t("newsPage.loadMore")}
                      onClick={loadMentions}
                    />
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
};

function LoadMore({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <div className="flex justify-center">
      <button
        type="button"
        onClick={onClick}
        className="rounded-full border-2 border-[#1B3A75] px-8 py-3 text-xs font-bold uppercase tracking-widest text-[#1B3A75] transition-colors hover:bg-[#1B3A75] hover:text-white"
      >
        {label}
      </button>
    </div>
  );
}

export default NewsPage;
