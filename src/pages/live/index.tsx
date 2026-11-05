import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import nuriImg from "../../assets/nuria/Nuria9.jpg";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import AnimatedLoader from "../../components/animatedLoader";
import { DEFAULT_OG_IMAGE_URL, SITE_URL } from "../../utils/constants";
import { refresh, useLive } from "../../live/liveStore";
import type { HoleScore, LiveSnapshot } from "../../live/parse";

const formatToPar = (value: number | null) =>
  value === null ? "–" : value === 0 ? "E" : value > 0 ? `+${value}` : `${value}`;

// "hace 2 minutos" en el idioma de la web
const useTimeAgo = (date: Date | null, lang: string) => {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 15_000);
    return () => clearInterval(id);
  }, []);
  if (!date) return "";
  const seconds = Math.round((date.getTime() - now) / 1000);
  const rtf = new Intl.RelativeTimeFormat(lang, { numeric: "auto" });
  if (Math.abs(seconds) < 60) return rtf.format(Math.min(seconds, 0), "second");
  const minutes = Math.round(seconds / 60);
  if (Math.abs(minutes) < 60) return rtf.format(minutes, "minute");
  return rtf.format(Math.round(minutes / 60), "hour");
};

const LivePage = () => {
  const { t, i18n } = useTranslation("global");
  const lang = (i18n.resolvedLanguage || i18n.language || "es").split("-")[0];
  const live = useLive();
  const snap = live.snapshot;
  const [refreshing, setRefreshing] = useState(false);
  const updatedAgo = useTimeAgo(snap?.updatedAt ?? live.lastFetchedAt, lang);

  const title = "En vivo – Nuria Iturrioz";
  const description =
    "Seguimiento en vivo de torneos y estado competitivo de Nuria Iturrioz cuando haya información disponible.";
  const url = `${SITE_URL}/live`;

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const seo = (
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
  );

  if (live.status === "loading" && !snap) {
    return (
      <>
        {seo}
        <div className="min-h-screen flex items-center justify-center bg-neutral-50">
          <AnimatedLoader />
        </div>
      </>
    );
  }

  // Sin datos de Nuria: no hay torneo, todavía no hay resultados, no está en
  // el campo, o falló la conexión sin datos previos
  if (!snap) {
    const failed = !!live.error && !live.tournament;
    const tournamentName = live.tournament?.name;
    return (
      <>
        {seo}
        <div className="min-h-screen bg-neutral-50 pt-30 pb-12 px-4 sm:px-6 lg:px-8 font-sans">
          <div className="max-w-2xl mx-auto flex flex-col items-center text-center">
            <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-100">
              <img
                src={nuriImg}
                alt="Nuria Iturrioz"
                className="w-full h-full object-cover object-top"
              />
            </div>

            <h2 className="mt-8 text-3xl md:text-4xl font-bold text-gray-900 font-header tracking-tight">
              {failed
                ? t("livePage.noLive.errorTitle")
                : t("livePage.noLive.title")}
            </h2>
            <p className="mt-3 text-gray-600">
              {failed
                ? t("livePage.noLive.errorSubtitle")
                : live.notInField
                  ? t("livePage.noLive.notInField")
                  : t("livePage.noLive.subtitle")}
            </p>

            {!failed && (
              <p className="mt-5 text-sm text-gray-400">
                {tournamentName
                  ? t("livePage.noLive.tournamentDetected", {
                      name: tournamentName,
                    })
                  : t("livePage.noLive.noTournament")}
              </p>
            )}

            <div className="mt-8 w-full max-w-md flex flex-col gap-3">
              <button
                onClick={onRefresh}
                disabled={refreshing}
                className="w-full px-6 py-2.5 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition-colors disabled:opacity-60"
              >
                {t("livePage.refreshData")}
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Link
                  to="/stats"
                  className="w-full text-center px-4 py-2.5 rounded-full font-semibold border border-[#E6E6E6] text-gray-900 hover:bg-[#F8F8F8] transition-colors"
                >
                  {t("livePage.noLive.ctaStats")}
                </Link>
                <Link
                  to="/news"
                  className="w-full text-center px-4 py-2.5 rounded-full font-semibold border border-[#E6E6E6] text-gray-900 hover:bg-[#F8F8F8] transition-colors"
                >
                  {t("livePage.noLive.ctaNews")}
                </Link>
              </div>

              <Link
                to="/"
                className="w-full text-center px-4 py-2.5 rounded-full font-semibold text-[#2A579E] hover:bg-blue-50 transition-colors"
              >
                {t("livePage.noLive.ctaHome")}
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {seo}
      <div className="min-h-screen bg-neutral-50 pt-30 pb-12 px-4 sm:px-6 lg:px-8 font-sans">
        <div className="max-w-5xl mx-auto">
          {live.error && (
            <div
              role="status"
              className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3 text-sm text-amber-900"
            >
              <span>{t("livePage.staleWarning")}</span>
              <button
                onClick={onRefresh}
                disabled={refreshing}
                className="self-start sm:self-auto font-bold underline disabled:opacity-60"
              >
                {t("livePage.refreshData")}
              </button>
            </div>
          )}

          <TournamentHeader snap={snap} />
          <StatusBanner snap={snap} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 flex flex-col gap-6">
              <PlayerCard snap={snap} />
            </div>

            <div className="lg:col-span-2 flex flex-col gap-6">
              <Scorecard snap={snap} />
              <RoundsHistory snap={snap} />

              <a
                href="https://ladieseuropeantour.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-full p-4 bg-gray-900 text-white rounded-2xl shadow-lg hover:bg-gray-800 transition-all group"
              >
                <span className="font-bold mr-2">
                  {t("livePage.viewFullStats")}
                </span>
                <svg
                  className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-400 text-sm">
              {t("livePage.autoUpdate")}
              {updatedAgo && ` · ${t("livePage.updatedAgo", { ago: updatedAgo })}`}{" "}
              •{" "}
              <button
                onClick={onRefresh}
                disabled={refreshing}
                className="underline hover:text-gray-600 disabled:opacity-60"
              >
                {t("livePage.refreshData")}
              </button>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

const TournamentHeader = ({ snap }: { snap: LiveSnapshot }) => {
  const { t } = useTranslation("global");
  return (
    <div className="flex flex-col md:flex-row justify-between items-center mb-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div className="text-center md:text-left mb-4 md:mb-0">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 font-header tracking-tight">
          {snap.tournamentName}
        </h1>
        <p className="mt-1 text-gray-500 font-light flex items-center justify-center md:justify-start">
          <svg
            className="w-4 h-4 mr-2 text-gray-500"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            focusable="false"
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          {snap.location}
        </p>
      </div>
      <div className="flex flex-col items-center md:items-end">
        {snap.state === "on-course" && (
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-red-50 text-red-600 text-sm font-bold tracking-wider animate-pulse border border-red-100 mb-2">
            <span className="w-2 h-2 mr-2 bg-red-500 rounded-full"></span>
            {t("livePage.live")}
          </div>
        )}
        <div className="text-sm text-gray-400 font-medium">{snap.dates}</div>
      </div>
    </div>
  );
};

// Qué está pasando ahora, en una línea
const StatusBanner = ({ snap }: { snap: LiveSnapshot }) => {
  const { t } = useTranslation("global");
  let text: string | null = null;
  if (snap.state === "not-started") {
    text = snap.teeTime
      ? t("livePage.state.teeTime", {
          round: snap.round,
          time: snap.teeTime,
          tee: snap.startTee,
        })
      : t("livePage.state.notStarted", { round: snap.round });
  } else if (snap.state === "on-course") {
    text = t("livePage.state.onCourse", {
      round: snap.round,
      count: snap.holesPlayed,
    });
  } else if (snap.state === "round-finished") {
    text = t("livePage.state.roundFinished", { round: snap.round });
  } else if (snap.state === "tournament-finished") {
    text = t("livePage.state.tournamentFinished");
  } else if (snap.state === "out") {
    text = t("livePage.state.out", { label: snap.outLabel });
  }
  if (!text) return null;
  return (
    <p className="mb-6 rounded-2xl bg-[#2A579E]/5 border border-[#2A579E]/15 px-5 py-3 text-center md:text-left text-sm font-semibold text-[#2A579E]">
      {text}
    </p>
  );
};

const PlayerCard = ({ snap }: { snap: LiveSnapshot }) => {
  const { t } = useTranslation("global");
  return (
    <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-gray-100 relative group">
      <div className="relative h-32 bg-linear-to-br from-blue-900 to-blue-700" />

      <div className="relative -mt-16 text-center">
        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl mx-auto bg-gray-200">
          <img
            src={nuriImg}
            alt="Nuria Iturrioz"
            className="w-full h-full object-cover object-top"
          />
        </div>
      </div>

      <div className="pt-4 px-6 pb-8 text-center">
        <h2 className="text-2xl mb-10 font-bold text-gray-900 font-header">
          Nuria Iturrioz
        </h2>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-yellow-50 p-4 rounded-2xl border border-yellow-100 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="text-[10px] text-yellow-800 uppercase font-bold tracking-widest mb-1">
              {t("livePage.position")}
            </div>
            <div className="text-4xl font-black text-yellow-900">
              {snap.position?.label ?? "–"}
            </div>
          </div>

          <div className="bg-blue-900 p-4 rounded-2xl border border-blue-800 flex flex-col items-center justify-center text-white relative overflow-hidden">
            <div className="text-[10px] text-blue-200 uppercase font-bold tracking-widest mb-1">
              {t("livePage.total")}
            </div>
            <div className="text-4xl font-black text-white">
              {formatToPar(snap.totalToPar)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-6">
          <div>
            <div className="text-xs text-gray-400 uppercase font-bold mb-1">
              {t("livePage.today")}
            </div>
            <div
              className={`text-xl font-bold ${
                (snap.roundToPar ?? 0) < 0 ? "text-green-600" : "text-gray-800"
              }`}
            >
              {snap.state === "not-started" ? "–" : formatToPar(snap.roundToPar)}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-400 uppercase font-bold mb-1">
              {snap.state === "on-course"
                ? t("livePage.thru")
                : t("livePage.hole")}
            </div>
            <div className="text-xl font-bold text-gray-800 flex items-center justify-center gap-2">
              {snap.state === "on-course" ? (
                <>
                  <span>{snap.holesPlayed}</span>
                  {snap.currentHoleStrokes ? (
                    <span className="text-sm font-bold italic text-yellow-700 bg-yellow-50 border border-yellow-200 px-2 py-0.5 rounded-md">
                      {t("livePage.holeShort")}
                      {snap.currentHole} · {snap.currentHoleStrokes}{" "}
                      {t("livePage.stroke", { count: snap.currentHoleStrokes })}
                    </span>
                  ) : null}
                </>
              ) : snap.state === "not-started" ? (
                <span>{snap.startTee}</span>
              ) : (
                <span>F</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Scorecard = ({ snap }: { snap: LiveSnapshot }) => {
  const { t } = useTranslation("global");
  const front = snap.holes.slice(0, 9);
  const back = snap.holes.slice(9, 18);

  const renderHoleSet = (holes: HoleScore[]) => (
    <div className="mb-8 last:mb-0">
      <div className="grid grid-cols-[repeat(9,minmax(0,1fr))_72px] sm:grid-cols-[repeat(9,minmax(0,1fr))_80px] gap-1 sm:gap-2 mb-2">
        {holes.map((hole) => (
          <div
            key={hole.number}
            className={`h-8 sm:h-10 flex items-center justify-center rounded-lg text-xs sm:text-sm font-bold ${
              hole.number === snap.currentHole
                ? "bg-yellow-100 text-yellow-800"
                : "text-gray-400 bg-gray-50"
            }`}
          >
            {hole.number}
          </div>
        ))}
        <div className="flex items-center text-[9px] sm:text-xs font-bold text-gray-400 uppercase tracking-tight sm:tracking-wider pl-1 sm:pl-2">
          {t("livePage.hole")}
        </div>
      </div>

      <div className="grid grid-cols-[repeat(9,minmax(0,1fr))_72px] sm:grid-cols-[repeat(9,minmax(0,1fr))_80px] gap-1 sm:gap-2 mb-2">
        {holes.map((hole) => (
          <div
            key={hole.number}
            className={`h-8 sm:h-10 flex items-center justify-center rounded-lg text-xs sm:text-sm font-medium text-gray-500 ${
              hole.number === snap.currentHole
                ? "ring-2 ring-yellow-100 bg-yellow-50"
                : "bg-gray-50"
            }`}
          >
            {hole.par}
          </div>
        ))}
        <div className="flex items-center text-[9px] sm:text-xs font-bold text-gray-400 uppercase tracking-tight sm:tracking-wider pl-1 sm:pl-2">
          {t("livePage.par")}
        </div>
      </div>

      <div className="grid grid-cols-[repeat(9,minmax(0,1fr))_72px] sm:grid-cols-[repeat(9,minmax(0,1fr))_80px] gap-1 sm:gap-2">
        {holes.map((hole) => {
          let bgClass = "bg-gray-100";
          let textClass = "text-gray-800";
          let display = "-";
          if (hole.strokes !== null) {
            const diff = hole.strokes - hole.par;
            display = `${hole.strokes}`;
            if (diff < 0) {
              bgClass = "bg-blue-600";
              textClass = "text-white";
            } else if (diff > 0) {
              bgClass = "bg-red-500";
              textClass = "text-white";
            }
          } else if (hole.number === snap.currentHole) {
            bgClass = "bg-yellow-100";
            textClass =
              "text-yellow-800 italic font-bold border-2 border-yellow-400";
            if (snap.currentHoleStrokes) display = `${snap.currentHoleStrokes}`;
          }
          return (
            <div
              key={hole.number}
              className={`h-10 sm:h-12 flex items-center justify-center rounded-lg text-sm sm:text-xl font-black ${bgClass} ${textClass}`}
            >
              {display}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
      <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
        <h3 className="text-lg font-bold text-gray-900 flex items-center">
          <span className="w-1.5 h-6 bg-blue-600 rounded-full mr-3"></span>
          {t("livePage.scorecard")} · {t("livePage.roundAbbr")}
          {snap.round}
        </h3>

        <div className="flex gap-3 text-[10px] sm:text-xs font-medium text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full">
          <div className="flex items-center">
            <span className="w-2 h-2 rounded-full bg-blue-500 mr-1.5"></span>
            {t("livePage.birdie")}
          </div>
          <div className="flex items-center">
            <span className="w-2 h-2 rounded-full bg-gray-300 mr-1.5"></span>
            {t("livePage.par")}
          </div>
          <div className="flex items-center">
            <span className="w-2 h-2 rounded-full bg-red-500 mr-1.5"></span>
            {t("livePage.bogey")}
          </div>
        </div>
      </div>

      {snap.startTee !== 1 && (
        <p className="-mt-2 mb-5 text-xs font-semibold text-gray-500">
          {t("livePage.startTee", { tee: snap.startTee })}
        </p>
      )}

      <div className="flex flex-col">
        <div>
          <div className="text-xs text-gray-400 uppercase font-bold mb-3 tracking-widest pl-1">
            {t("livePage.frontNine")}
          </div>
          {renderHoleSet(front)}
        </div>
        {back.length > 0 && (
          <div className="mt-15">
            <div className="text-xs text-gray-400 uppercase font-bold mb-3 tracking-widest pl-1">
              {t("livePage.backNine")}
            </div>
            {renderHoleSet(back)}
          </div>
        )}
      </div>
    </div>
  );
};

const RoundsHistory = ({ snap }: { snap: LiveSnapshot }) => {
  const { t } = useTranslation("global");
  return (
    <div>
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">
        {t("livePage.roundsHistory")}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {snap.rounds.map((round) => {
          const current = round.id === snap.round;
          return (
            <div
              key={round.id}
              className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                current
                  ? "bg-white border-blue-200 shadow-sm ring-1 ring-blue-50"
                  : "bg-white/60 border-gray-100 text-gray-400"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                    current
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {t("livePage.roundAbbr")}
                  {round.id}
                </div>
                <div className="flex flex-col">
                  <div className="text-sm font-semibold">
                    {round.state === "in-progress"
                      ? t("livePage.status.inProgress")
                      : round.state === "finished"
                        ? t("livePage.status.finished")
                        : t("livePage.status.upcoming")}
                  </div>
                  {round.date && (
                    <div className="text-[10px] sm:text-xs font-medium text-gray-400 mt-0.5">
                      {round.date}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end">
                <div
                  className={`font-bold text-lg ${round.strokes ? "text-gray-900" : "text-gray-300"}`}
                >
                  {round.strokes ?? "--"}
                </div>
                <div className="text-[10px] text-gray-400 font-medium">
                  {round.state === "finished"
                    ? formatToPar(round.toPar)
                    : `Par ${snap.coursePar}`}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LivePage;
