import { useState, useEffect } from "react";
import nuriImg from "../../assets/nuria/Nuria9.jpg";
import { useTranslation } from "react-i18next";
import AnimatedLoader from "../../components/animatedLoader";
import { getLetApiUrl } from "../../utils/constants";
import tournamentsData from "../../data/tournaments.json";
import { useLiveStatus } from "../../hooks/useLiveStatus";

interface HoleData {
  number: number;
  par: number;
  strokes: number | null;
}

interface RoundHistory {
  id: number;
  name: string;
  strokes: number | null;
  par: number | null;
  isCurrent: boolean;
  date?: string;
}

interface LiveTournamentData {
  tournamentName: string;
  location: string;
  date: string;
  currentRound: number;
  currentHole: number;
  currentHoleStrokes?: number;
  status: string;
  scoreToPar: number;
  todayScore: number;
  rank: string;
  holes: HoleData[];
  rounds: RoundHistory[];
}

const LivePage = () => {
  const { t } = useTranslation("global");
  const { isLive } = useLiveStatus();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [liveData, setLiveData] = useState<LiveTournamentData | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [timeAgo, setTimeAgo] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Determine current tournament
        const now = new Date();
        const activeTournament = tournamentsData.tournaments.find((t) => {
          // Parse tournament dates (format: DD/MM/YY)
          const [startDay, startMonth, startYear] = t.date.split("/");
          const [endDay, endMonth, endYear] = t.date_end.split("/");

          const startDate = new Date(
            2000 + parseInt(startYear),
            parseInt(startMonth) - 1,
            parseInt(startDay),
          );
          const endDate = new Date(
            2000 + parseInt(endYear),
            parseInt(endMonth) - 1,
            parseInt(endDay),
          );

          // Set endDate to end of day
          endDate.setHours(23, 59, 59, 999);

          return now >= startDate && now <= endDate && t.code;
        });

        const tournamentCode = activeTournament
          ? activeTournament.code
          : "2016";

        // Strategy: Try to fetch data starting from round 4 down to 1
        // to ensure we get the latest tournament status
        let data = null;
        for (let r = 4; r >= 1; r--) {
          try {
            const url = getLetApiUrl(r, tournamentCode!);
            const response = await fetch(`${url}?randomadd=${Date.now()}`);
            if (response.ok) {
              const jsonData = await response.json();
              // Basic validation
              if (jsonData && jsonData.full_name) {
                data = jsonData;
                break; // Stop once we find the latest available data
              }
            }
          } catch (e) {
            // Continue to previous round if current fails
            console.warn(`Failed to fetch round ${r} data`, e);
          }
        }

        if (!data) throw new Error("Failed to fetch data");

        // Find Nuria Iturrioz
        const nuria = data.scores.scores_entry.find(
          (p: { playing_name: string }) => p.playing_name === "Nuria Iturrioz",
        );

        if (!nuria) {
          throw new Error("Nuria not found in tournament data");
        }

        // Parse tournament-wide data
        const pars = data.course_par
          .split(",")
          .filter((p: string) => p !== "")
          .map(Number);
        const lastRound = parseInt(data.last_round_with_scores) || 1;

        // Parse Nuria's current round data
        const currentRoundScores = nuria[`hole_scores_R${lastRound}`]
          ? nuria[`hole_scores_R${lastRound}`]
              .split(",")
              .map((s: string) => (s === "" ? null : parseInt(s)))
          : Array(18).fill(null);

        // Parse live hole status (e.g. "strokes_R2": "16,2,")
        let currentHole = parseInt(nuria.holes) || 0;
        let currentHoleStrokes = 0;
        const strokesKey = `strokes_R${lastRound}`;
        if (nuria[strokesKey]) {
          const parts = nuria[strokesKey].split(",");
          if (parts.length >= 2) {
            currentHole = parseInt(parts[0]) || currentHole;
            currentHoleStrokes = parseInt(parts[1]) || 0;
          }
        }

        const holes: HoleData[] = pars.map((par: number, index: number) => ({
          number: index + 1,
          par,
          strokes: currentRoundScores[index],
        }));

        // Parse rounds history
        const rounds: RoundHistory[] = [];
        for (let i = 1; i <= 4; i++) {
          const dateKey = `date_R${i}`;
          const roundDate = data[dateKey];
          // We check if the round date exists to include future rounds
          if (roundDate) {
            const score = nuria[`score_R${i}`];
            const vspar = nuria[`vspar_R${i}`];

            rounds.push({
              id: i,
              name: `Round ${i}`,
              strokes: score && parseInt(score) > 0 ? parseInt(score) : null,
              par: vspar ? (vspar === "Par" ? 0 : parseInt(vspar)) : null,
              isCurrent: i === lastRound,
              date: roundDate,
            });
          }
        }

        setLiveData({
          tournamentName: data.full_name,
          location: data.course_name,
          date: data.course_dates,
          currentRound: lastRound,
          currentHole: currentHole,
          currentHoleStrokes: currentHoleStrokes,
          status:
            nuria[`status_R${lastRound}`] === "S" ? "ON COURSE" : "FINISHED",
          scoreToPar: nuria.vspar === "Par" ? 0 : parseInt(nuria.vspar),
          todayScore:
            nuria[`vspar_R${lastRound}`] === "Par"
              ? 0
              : parseInt(nuria[`vspar_R${lastRound}`]),
          rank: nuria.pos,
          holes,
          rounds,
        });
        setLastUpdated(new Date());
        setLoading(false);
      } catch (err: unknown) {
        console.error("Error fetching live data:", err);
        setError(
          err instanceof Error ? err.message : "An unknown error occurred",
        );
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000); // Update every 1 minute
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const updateTimeAgo = () => {
      const now = new Date();
      const diffInSeconds = Math.floor(
        (now.getTime() - lastUpdated.getTime()) / 1000,
      );

      if (diffInSeconds < 60) {
        setTimeAgo("hace unos segundos");
      } else {
        const minutes = Math.floor(diffInSeconds / 60);
        setTimeAgo(`hace ${minutes} ${minutes === 1 ? "minuto" : "minutos"}`);
      }
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 10000); // Update time ago text every 10 seconds
    return () => clearInterval(interval);
  }, [lastUpdated]);

  const getScoreColor = (score: number) => {
    if (score < 0) return "text-red-500";
    if (score > 0) return "text-blue-900";
    return "text-gray-700";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <AnimatedLoader />
      </div>
    );
  }

  if (error || !liveData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops!</h2>
          <p className="text-gray-600 mb-4">
            {error || "Could not load live data"}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition-colors"
          >
            {t("livePage.refreshData")}
          </button>
        </div>
      </div>
    );
  }

  const frontNine = liveData.holes.slice(0, 9);
  const backNine = liveData.holes.slice(9, 18);

  const renderHoleSet = (holes: typeof liveData.holes) => (
    <div className="mb-8 last:mb-0">
      {/* Holes Row */}
      <div className="grid grid-cols-[repeat(9,minmax(0,1fr))_72px] sm:grid-cols-[repeat(9,minmax(0,1fr))_80px] gap-1 sm:gap-2 mb-2">
        {holes.map((hole) => (
          <div
            key={hole.number}
            className={`h-8 sm:h-10 flex items-center justify-center rounded-lg text-xs sm:text-sm font-bold text-gray-400 bg-gray-50 ${hole.number === liveData.currentHole ? "bg-yellow-100 text-yellow-800" : ""}`}
          >
            {hole.number}
          </div>
        ))}
        <div className="flex items-center text-[9px] sm:text-xs font-bold text-gray-400 uppercase tracking-tight sm:tracking-wider pl-1 sm:pl-2">
          {t("livePage.hole")}
        </div>
      </div>

      {/* Par Row */}
      <div className="grid grid-cols-[repeat(9,minmax(0,1fr))_72px] sm:grid-cols-[repeat(9,minmax(0,1fr))_80px] gap-1 sm:gap-2 mb-2">
        {holes.map((hole) => (
          <div
            key={hole.number}
            className={`h-8 sm:h-10 flex items-center justify-center rounded-lg text-xs sm:text-sm font-medium text-gray-500 bg-gray-50 ${hole.number === liveData.currentHole ? "ring-2 ring-yellow-100 bg-yellow-50" : ""}`}
          >
            {hole.par}
          </div>
        ))}
        <div className="flex items-center text-[9px] sm:text-xs font-bold text-gray-400 uppercase tracking-tight sm:tracking-wider pl-1 sm:pl-2">
          {t("livePage.par")}
        </div>
      </div>

      {/* Score Row */}
      <div className="grid grid-cols-[repeat(9,minmax(0,1fr))_72px] sm:grid-cols-[repeat(9,minmax(0,1fr))_80px] gap-1 sm:gap-2">
        {holes.map((hole) => {
          const isCompleted = hole.strokes !== null;
          const scoreDiff = isCompleted ? hole.strokes! - hole.par : 0;
          let bgClass = "bg-gray-100";
          let textClass = "text-gray-800";

          let displayScore = "-";
          if (isCompleted) {
            if (scoreDiff < 0) {
              bgClass = "bg-blue-600";
              textClass = "text-white";
              displayScore = `${scoreDiff}`;
            } else if (scoreDiff > 0) {
              bgClass = "bg-red-500";
              textClass = "text-white";
              displayScore = `+${scoreDiff}`;
            } else {
              displayScore = `${hole.par}`;
            }
          } else if (hole.number === liveData.currentHole) {
            bgClass = "bg-yellow-100";
            textClass =
              "text-yellow-800 italic font-bold border-2 border-yellow-400";
            if (liveData.currentHoleStrokes) {
              displayScore = `${liveData.currentHoleStrokes}`;
            }
          }

          return (
            <div
              key={hole.number}
              className={`h-10 sm:h-12 flex items-center justify-center rounded-lg text-sm sm:text-xl font-black ${bgClass} ${textClass}`}
            >
              {displayScore}
            </div>
          );
        })}
        <div className="flex items-center text-[9px] sm:text-xs font-black text-gray-900 uppercase tracking-tight sm:tracking-wider pl-1 sm:pl-2">
          {t("livePage.score")}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-50 pt-40 pb-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto">
        {/* Tournament Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="text-center md:text-left mb-4 md:mb-0">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 font-header tracking-tight">
              {liveData.tournamentName}
            </h1>
            <p className="mt-1 text-gray-500 font-light flex items-center justify-center md:justify-start">
              <span className="mr-2">📍</span> {liveData.location}
            </p>
          </div>
          <div className="flex flex-col items-center md:items-end">
            {isLive && (
              <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-red-50 text-red-600 text-sm font-bold tracking-wider animate-pulse border border-red-100 mb-2">
                <span className="w-2 h-2 mr-2 bg-red-500 rounded-full"></span>
                {t("livePage.live")}
              </div>
            )}
            <div className="text-sm text-gray-400 font-medium">
              {liveData.date}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Player & Main Stats (Rank is now prominent) */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            {/* Player Card with Integrated Stats */}
            <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-gray-100 relative group">
              {/* Cover */}
              <div className="relative h-32 bg-linear-to-br from-blue-900 to-blue-700">
                <div className="absolute top-0 right-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
              </div>

              {/* Profile Image - Centered and overlapping */}
              <div className="relative -mt-16 text-center">
                <div className="inline-block relative">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl mx-auto bg-gray-200">
                    <img
                      src={nuriImg}
                      alt="Nuria Iturrioz"
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                </div>
              </div>

              {/* Info & Stats */}
              <div className="pt-4 px-6 pb-8 text-center">
                <h2 className="text-2xl mb-10 font-bold text-gray-900 font-header">
                  Nuria Iturrioz
                </h2>

                {/* KEY STATS: POSITION & SCORE */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {/* Position - Highlighted */}
                  <div className="bg-yellow-50 p-4 rounded-2xl border border-yellow-100 flex flex-col items-center justify-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-2 -mr-2 w-10 h-10 bg-yellow-200 rounded-full opacity-50 blur-xl"></div>
                    <div className="text-[10px] text-yellow-800 uppercase font-bold tracking-widest mb-1 z-10">
                      {t("livePage.position")}
                    </div>
                    <div className="text-4xl font-black text-yellow-900 z-10">
                      {liveData.rank}
                    </div>
                  </div>

                  {/* Total Score */}
                  <div className="bg-blue-900 p-4 rounded-2xl border border-blue-800 flex flex-col items-center justify-center text-white relative overflow-hidden">
                    <div className="absolute bottom-0 left-0 -mb-2 -ml-2 w-10 h-10 bg-cyan-500 rounded-full opacity-30 blur-xl"></div>
                    <div className="text-[10px] text-blue-200 uppercase font-bold tracking-widest mb-1 z-10">
                      {t("livePage.total")}
                    </div>
                    <div className="text-4xl font-black text-white z-10">
                      {liveData.scoreToPar > 0
                        ? `+${liveData.scoreToPar}`
                        : liveData.scoreToPar}
                    </div>
                  </div>
                </div>

                {/* Secondary Info: Today & Hole */}
                <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-6">
                  <div>
                    <div className="text-xs text-gray-400 uppercase font-bold mb-1">
                      {t("livePage.today")}
                    </div>
                    <div
                      className={`text-xl font-bold ${liveData.todayScore < 0 ? "text-green-600" : "text-gray-800"}`}
                    >
                      {liveData.todayScore > 0
                        ? `+${liveData.todayScore}`
                        : liveData.todayScore}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 uppercase font-bold mb-1">
                      {t("livePage.hole")}
                    </div>
                    <div className="text-xl font-bold text-gray-800 flex items-center justify-center gap-2">
                      {liveData.status === "FINISHED" ? (
                        <span>F</span>
                      ) : (
                        <>
                          <span>{liveData.currentHole}</span>
                          {liveData.currentHoleStrokes ? (
                            <span className="text-sm font-bold italic text-yellow-700 bg-yellow-50 border border-yellow-200 px-2 py-0.5 rounded-md">
                              {liveData.currentHoleStrokes}{" "}
                              {liveData.currentHoleStrokes === 1
                                ? "golpe"
                                : "golpes"}
                            </span>
                          ) : null}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Scorecard & Compact Rounds */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* 18 Holes Scorecard */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
              <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                  <span className="w-1.5 h-6 bg-blue-600 rounded-full mr-3"></span>
                  {t("livePage.scorecard")}
                </h3>

                {/* Compact Legend */}
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

              {/* Scorecard Grid - Stacked Vertically */}
              <div className="flex flex-col">
                {/* Front 9 */}
                <div>
                  <div className="text-xs text-gray-400 uppercase font-bold mb-3 tracking-widest pl-1">
                    {t("livePage.frontNine")}
                  </div>
                  {renderHoleSet(frontNine)}
                </div>

                {/* Back 9 */}
                <div className="mt-15">
                  <div className="text-xs text-gray-400 uppercase font-bold mb-3 tracking-widest pl-1">
                    {t("livePage.backNine")}
                  </div>
                  {renderHoleSet(backNine)}
                </div>
              </div>
            </div>

            {/* Compact Rounds History */}
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">
                {t("livePage.roundsHistory")}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {liveData.rounds.map((round) => (
                  <div
                    key={round.id}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                      round.isCurrent
                        ? "bg-white border-blue-200 shadow-sm ring-1 ring-blue-50"
                        : "bg-white/60 border-gray-100 text-gray-400"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${round.isCurrent ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-400"}`}
                      >
                        {t("livePage.roundAbbr")}
                        {round.id}
                      </div>
                      <div className="flex flex-col">
                        <div className="text-sm font-semibold">
                          {round.isCurrent
                            ? t("livePage.status.inProgress")
                            : round.strokes
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

                    <div
                      className={`font-bold text-lg ${round.par ? getScoreColor(round.par) : "text-gray-300"}`}
                    >
                      {round.par
                        ? round.par > 0
                          ? `+${round.par}`
                          : round.par
                        : "--"}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* LET External Link */}
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
            {t("livePage.autoUpdate")} ({timeAgo}) •{" "}
            <span
              onClick={() => window.location.reload()}
              className="underline cursor-pointer hover:text-gray-600"
            >
              {t("livePage.refreshData")}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LivePage;
