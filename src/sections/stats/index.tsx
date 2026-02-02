import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useLetStatistics, type StatEntry } from "../../data/useLetStatistics";

export default function StatsSection() {
  const { t } = useTranslation();
  const { data, entries, loading, error, hasData } = useLetStatistics();
  const [showAll, setShowAll] = useState(false);

  const getStatLabel = (description: string) => {
    const map: Record<string, string> = {
      "biggest comeback margin": "statsMetrics.biggestComebackMargin",
      "total number of birdies": "statsMetrics.totalNumberOfBirdies",
      "scoring average": "statsMetrics.scoringAverage",
      "greens in regulation": "statsMetrics.greensInRegulation",
      "putts per round": "statsMetrics.puttsPerRound",
      "sand saves": "statsMetrics.sandSaves",
      "driving accuracy": "statsMetrics.drivingAccuracy",
      "rounds under par": "statsMetrics.roundsUnderPar",
      "stroke average": "statsMetrics.strokeAverage",
      "scrambling %": "statsMetrics.scramblingPercentage",
      "bounce back %": "statsMetrics.bounceBackPercentage",
      "putting average (per hole)": "statsMetrics.puttingAveragePerHole",
      "putting average (per round)": "statsMetrics.puttingAveragePerRound",
      "sand saves percentage": "statsMetrics.sandSavesPercentage",
      "greens in regulation percent":
        "statsMetrics.greensInRegulationPercentage",
      "driving accuracy percentage": "statsMetrics.drivingAccuracyPercentage",
      "total holes in one": "statsMetrics.totalHolesInOne",
      "average pars per round": "statsMetrics.averageParsPerRound",
      "total number of pars": "statsMetrics.totalNumberOfPars",
      "average birdies per round": "statsMetrics.averageBirdiesPerRound",
      "average eagles per round": "statsMetrics.averageEaglesPerRound",
      "total number of eagles": "statsMetrics.totalNumberOfEagles",
      "total number of albatrosses": "statsMetrics.totalNumberOfAlbatrosses",
      "average against par": "statsMetrics.averageAgainstPar",
      "low round score": "statsMetrics.lowRoundScore",
    };
    const key = map[description.toLowerCase()];
    return key ? t(key) : description;
  };

  const featured = [
    {
      label: t("statsComponent.tournamentWins"),
      value: data?.tournamentWins ?? null,
    },
    {
      label: t("statsComponent.topTen"),
      value: data?.tournamentTopTenFinishes ?? null,
    },
    {
      label: t("statsComponent.drivingDistance"),
      value: data?.drivingDistance ?? null,
    },
  ];

  const filteredEntries = useMemo(() => {
    const featuredLabels = new Set(
      [
        "Tournament Wins",
        "Tournament Top Ten Finishes",
        "Driving Distance",
      ].map((l) => l.toLowerCase()),
    );
    const featuredCodes = new Set<string>();
    // Mapear codes de las métricas destacadas por descripción
    for (const e of entries) {
      const desc = e.description?.toLowerCase?.() ?? "";
      if (featuredLabels.has(desc) && e.code) featuredCodes.add(e.code);
    }
    // Asegurar code S155 (Driving Distance)
    featuredCodes.add("S155");

    return entries.filter((e: StatEntry) => {
      const desc = e.description.toLowerCase();
      const code = e.code;
      if (desc.includes("overall money")) return false;
      if (featuredLabels.has(desc)) return false;
      if (code && featuredCodes.has(code)) return false;
      return true;
    });
  }, [entries]);

  return (
    <section id="stats" className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white drop-shadow">
          {t("statsComponent.title")}
        </h2>
        <p className="mt-2 text-sm text-white/80">
          {t("statsComponent.description")}
        </p>
      </header>

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="rounded-2xl bg-white/60 backdrop-blur-sm shadow-sm border border-white/50 p-5 animate-pulse"
            >
              <div className="h-4 w-24 bg-white/60 rounded mb-3" />
              <div className="h-6 w-16 bg-white/60 rounded" />
            </div>
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 p-4">
          {t("statsComponent.error", { error })}
        </div>
      )}

      {!loading && !error && hasData && (
        <div className="space-y-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featured.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl bg-white/60 backdrop-blur-sm shadow-sm border border-white/50 p-5"
              >
                <div className="text-sm text-neutral-500">{item.label}</div>
                <div className="mt-1 text-2xl font-semibold text-neutral-900">
                  {item.value ?? "—"}
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl bg-white/40 backdrop-blur-sm border border-white/50 p-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-neutral-900">
                {t("statsComponent.otherStats")}
              </h3>
              <button
                type="button"
                onClick={() => setShowAll((v) => !v)}
                className="text-sm font-medium text-[#2A579E] hover:text-[#1f4a8f]"
              >
                {showAll
                  ? t("statsComponent.hideAll")
                  : t("statsComponent.showAll")}
              </button>
            </div>

            {showAll &&
              (filteredEntries.length === 0 ? (
                <div className="text-sm text-neutral-600">
                  {t("statsComponent.noMoreStats")}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredEntries.map((e: StatEntry) => (
                    <div
                      key={`${e.code ?? e.description}`}
                      className="rounded-xl bg-white/60 backdrop-blur-sm shadow-sm border border-white/50 p-4"
                    >
                      <div className="text-xs text-neutral-500">
                        {getStatLabel(e.description)}
                      </div>
                      <div className="mt-1 text-xl font-semibold text-neutral-900">
                        {e.value ?? e.played ?? "—"}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
          </div>
        </div>
      )}

      {!loading && !error && !hasData && (
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 text-yellow-800 p-4">
          {t("statsComponent.noData")}
        </div>
      )}
    </section>
  );
}
