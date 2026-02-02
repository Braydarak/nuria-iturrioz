import nuriImg from "../../assets/nuri.png";

const LivePage = () => {
  // Mock data - easy to update or replace with API later
  const liveData = {
    tournamentName: "Aramco Team Series - Tampa",
    location: "Feather Sound Country Club",
    date: "March 8 - 10, 2024",
    currentRound: 2,
    currentHole: 14,
    status: "ON COURSE", // PLAYING, FINISHED, TEE TIME
    scoreToPar: -5, // The big number
    todayScore: -2, // Score for the current day
    rank: "T3",
    holes: [
      { number: 1, par: 4, strokes: 4 },
      { number: 2, par: 3, strokes: 2 }, // Birdie
      { number: 3, par: 4, strokes: 4 },
      { number: 4, par: 5, strokes: 4 }, // Birdie
      { number: 5, par: 4, strokes: 5 }, // Bogey
      { number: 6, par: 3, strokes: 3 },
      { number: 7, par: 5, strokes: 5 },
      { number: 8, par: 4, strokes: 4 },
      { number: 9, par: 4, strokes: 3 }, // Birdie
      { number: 10, par: 4, strokes: 4 },
      { number: 11, par: 3, strokes: 3 },
      { number: 12, par: 5, strokes: 4 }, // Birdie
      { number: 13, par: 4, strokes: 4 },
      { number: 14, par: 4, strokes: null }, // Current
      { number: 15, par: 3, strokes: null },
      { number: 16, par: 5, strokes: null },
      { number: 17, par: 4, strokes: null },
      { number: 18, par: 5, strokes: null },
    ],
    rounds: [
      { id: 1, name: "Round 1", strokes: 69, par: -3, date: "Fri, Mar 8" },
      {
        id: 2,
        name: "Round 2",
        strokes: null,
        par: -2,
        date: "Sat, Mar 9",
        isCurrent: true,
      },
      { id: 3, name: "Round 3", strokes: null, par: null, date: "Sun, Mar 10" },
    ],
  };

  const getScoreColor = (score: number) => {
    if (score < 0) return "text-red-500";
    if (score > 0) return "text-blue-900";
    return "text-gray-700";
  };

  const frontNine = liveData.holes.slice(0, 9);
  const backNine = liveData.holes.slice(9, 18);

  const renderHoleSet = (holes: typeof liveData.holes) => (
    <div className="mb-8 last:mb-0">
      {/* Holes Row */}
      <div className="grid grid-cols-[repeat(9,minmax(0,1fr))_60px] sm:grid-cols-[repeat(9,minmax(0,1fr))_80px] gap-1 sm:gap-2 mb-2">
        {holes.map((hole) => (
          <div
            key={hole.number}
            className={`h-8 sm:h-10 flex items-center justify-center rounded-lg text-xs sm:text-sm font-bold text-gray-400 bg-gray-50 ${hole.number === liveData.currentHole ? "bg-yellow-100 text-yellow-800" : ""}`}
          >
            {hole.number}
          </div>
        ))}
        <div className="flex items-center text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider pl-2">
          Hole
        </div>
      </div>

      {/* Par Row */}
      <div className="grid grid-cols-[repeat(9,minmax(0,1fr))_60px] sm:grid-cols-[repeat(9,minmax(0,1fr))_80px] gap-1 sm:gap-2 mb-2">
        {holes.map((hole) => (
          <div
            key={hole.number}
            className={`h-8 sm:h-10 flex items-center justify-center rounded-lg text-xs sm:text-sm font-medium text-gray-500 bg-gray-50 ${hole.number === liveData.currentHole ? "ring-2 ring-yellow-100 bg-yellow-50" : ""}`}
          >
            {hole.par}
          </div>
        ))}
        <div className="flex items-center text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider pl-2">
          Par
        </div>
      </div>

      {/* Score Row */}
      <div className="grid grid-cols-[repeat(9,minmax(0,1fr))_60px] sm:grid-cols-[repeat(9,minmax(0,1fr))_80px] gap-1 sm:gap-2">
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
            bgClass = "bg-yellow-400";
            textClass = "text-yellow-900";
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
        <div className="flex items-center text-[10px] sm:text-xs font-black text-gray-900 uppercase tracking-wider pl-2">
          Score
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
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-red-50 text-red-600 text-sm font-bold tracking-wider animate-pulse border border-red-100 mb-2">
              <span className="w-2 h-2 mr-2 bg-red-500 rounded-full"></span>
              LIVE
            </div>
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
                <h2 className="text-2xl font-bold text-gray-900 font-header">
                  Nuria Iturrioz
                </h2>
                <p className="text-sm text-gray-500 font-medium uppercase tracking-wide mb-8">
                  Spain
                </p>

                {/* KEY STATS: POSITION & SCORE */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {/* Position - Highlighted */}
                  <div className="bg-yellow-50 p-4 rounded-2xl border border-yellow-100 flex flex-col items-center justify-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-2 -mr-2 w-10 h-10 bg-yellow-200 rounded-full opacity-50 blur-xl"></div>
                    <div className="text-[10px] text-yellow-800 uppercase font-bold tracking-widest mb-1 z-10">
                      Position
                    </div>
                    <div className="text-4xl font-black text-yellow-900 z-10">
                      {liveData.rank}
                    </div>
                  </div>

                  {/* Total Score */}
                  <div className="bg-blue-900 p-4 rounded-2xl border border-blue-800 flex flex-col items-center justify-center text-white relative overflow-hidden">
                    <div className="absolute bottom-0 left-0 -mb-2 -ml-2 w-10 h-10 bg-cyan-500 rounded-full opacity-30 blur-xl"></div>
                    <div className="text-[10px] text-blue-200 uppercase font-bold tracking-widest mb-1 z-10">
                      Total
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
                      Today
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
                      Hole
                    </div>
                    <div className="text-xl font-bold text-gray-800">
                      {liveData.currentHole}
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
                  Live Scorecard
                </h3>

                {/* Compact Legend */}
                <div className="flex gap-3 text-[10px] sm:text-xs font-medium text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full">
                  <div className="flex items-center">
                    <span className="w-2 h-2 rounded-full bg-blue-500 mr-1.5"></span>
                    Birdie
                  </div>
                  <div className="flex items-center">
                    <span className="w-2 h-2 rounded-full bg-gray-300 mr-1.5"></span>
                    Par
                  </div>
                  <div className="flex items-center">
                    <span className="w-2 h-2 rounded-full bg-red-500 mr-1.5"></span>
                    Bogey
                  </div>
                </div>
              </div>

              {/* Scorecard Grid - Stacked Vertically */}
              <div className="flex flex-col">
                {/* Front 9 */}
                <div>
                  <div className="text-xs text-gray-400 uppercase font-bold mb-3 tracking-widest pl-1">
                    Front 9
                  </div>
                  {renderHoleSet(frontNine)}
                </div>

                {/* Back 9 */}
                <div>
                  <div className="text-xs text-gray-400 uppercase font-bold mb-3 tracking-widest pl-1">
                    Back 9
                  </div>
                  {renderHoleSet(backNine)}
                </div>
              </div>
            </div>

            {/* Compact Rounds History */}
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">
                Rounds History
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
                        R{round.id}
                      </div>
                      <div className="text-sm font-semibold">
                        {round.isCurrent
                          ? "Current"
                          : round.strokes
                            ? "Finished"
                            : "Upcoming"}
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
                Ver estadísticas completas en LET
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
            Data is simulated for demonstration •{" "}
            <span className="underline cursor-pointer hover:text-gray-600">
              Refresh Data
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LivePage;
