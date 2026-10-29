import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import AnimatedLoader from "../animatedLoader";
import {
  fetchSeasonStats,
  seasonKey,
  extractYearFromDate,
  type HighlightTournament,
} from "../../data/seasonStats";

export default function SeasonStats() {
  const { t } = useTranslation();
  const [highlights, setHighlights] = useState<HighlightTournament[]>([]);
  const [currentSeason, setCurrentSeason] = useState<string | null>(null);
  const [currentItems, setCurrentItems] = useState<HighlightTournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchSeasonStats();
        if (!cancelled) {
          setHighlights(data.highlights);
          setCurrentSeason(data.currentSeason);
          setCurrentItems(data.currentItems);
        }
      } catch (e) {
        const msg =
          e instanceof Error ? e.message : t("seasonStats.errorUnknown");
        if (!cancelled) setError(msg);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [t]);

  const seasons = useMemo(() => {
    const all = Array.from(new Set(highlights.map(seasonKey)));
    const filtered = currentSeason
      ? all.filter((s) => s !== currentSeason)
      : all;
    filtered.sort((a, b) => {
      const na = Number(a);
      const nb = Number(b);
      const va = Number.isFinite(na) ? na : -Infinity;
      const vb = Number.isFinite(nb) ? nb : -Infinity;
      return vb - va;
    });
    return filtered;
  }, [highlights, currentSeason]);

  useEffect(() => {
    if (selectedSeason === null) {
      if (currentSeason && currentItems.length > 0) {
        setSelectedSeason("__CURRENT__");
      } else if (seasons.length) {
        setSelectedSeason(seasons[0]);
      }
    }
  }, [seasons, selectedSeason, currentSeason, currentItems]);

  const bySeason = useMemo(() => {
    const map = new Map<string, HighlightTournament[]>();
    for (const it of highlights) {
      const key = seasonKey(it);
      if (currentSeason && key === currentSeason) continue;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(it);
    }
    for (const [, arr] of map.entries()) {
      arr.sort((a, b) => {
        const da = `${extractYearFromDate(a.date) ?? ""}-${a.date ?? ""}`;
        const db = `${extractYearFromDate(b.date) ?? ""}-${b.date ?? ""}`;
        return db.localeCompare(da);
      });
    }
    return map;
  }, [highlights, currentSeason]);

  const listForSelected = useMemo(() => {
    const sortDesc = (x: HighlightTournament, y: HighlightTournament) => {
      const ya = extractYearFromDate(x.date) ?? x.season ?? "";
      const yb = extractYearFromDate(y.date) ?? y.season ?? "";
      const na = Number(ya);
      const nb = Number(yb);
      if (Number.isFinite(na) && Number.isFinite(nb) && na !== nb)
        return nb - na;
      const da = x.date ?? "";
      const db = y.date ?? "";
      return db.localeCompare(da);
    };
    if (selectedSeason === "__CURRENT__") {
      return [...currentItems].sort(sortDesc);
    }
    const arr = selectedSeason ? (bySeason.get(selectedSeason) ?? []) : [];
    return [...arr].sort(sortDesc);
  }, [selectedSeason, currentItems, bySeason]);

  useEffect(() => {
    setShowAll(false);
  }, [selectedSeason]);

  const hasAnyData = currentItems.length > 0 || highlights.length > 0;
  const visible = showAll ? listForSelected : listForSelected.slice(0, 6);

  const seasonButtonClass = (active: boolean) =>
    `shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
      active
        ? "border-[#2A579E] bg-[#2A579E] text-white"
        : "border-neutral-200 bg-white text-neutral-700 hover:border-[#2A579E]/40 hover:text-[#2A579E]"
    }`;

  return (
    <div>
      {loading && (
        <div className="flex w-full items-center justify-center rounded-2xl border border-neutral-200 p-6">
          <AnimatedLoader />
        </div>
      )}

      {!loading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && hasAnyData && (
        <div className="space-y-6">
          {/* Selector de temporada (scroll horizontal en móvil) */}
          <div className="-mx-6 flex items-center gap-2 overflow-x-auto px-6 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
            {currentSeason && currentItems.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={() => setSelectedSeason("__CURRENT__")}
                  className={seasonButtonClass(
                    selectedSeason === "__CURRENT__",
                  )}
                >
                  {t("seasonStats.currentSeason")}
                </button>
                {seasons.length > 0 && (
                  <span
                    aria-hidden="true"
                    className="mx-1 h-6 w-px shrink-0 bg-neutral-300"
                  />
                )}
              </>
            )}
            {seasons.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSelectedSeason(s)}
                className={seasonButtonClass(s === selectedSeason)}
              >
                {s}
              </button>
            ))}
          </div>

          {selectedSeason && (
            <ul className="divide-y divide-neutral-100 overflow-hidden rounded-2xl border border-neutral-200 bg-white">
              {visible.map((item, idx) => {
                const pos = item.position
                  ? item.position.replace("=", "")
                  : null;
                const posNum = pos ? Number(pos) : NaN;
                const isWin = posNum === 1;
                const isTop10 = posNum > 1 && posNum <= 10;
                const tied = item.position?.includes("=");
                return (
                  <li
                    key={`${item.date}-${idx}`}
                    className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-3 px-4 py-4 sm:grid-cols-[auto_1fr_auto] sm:px-6"
                  >
                    {/* Posición */}
                    <div
                      className={`flex h-12 w-12 flex-col items-center justify-center rounded-full text-center leading-none ${
                        isWin
                          ? "bg-[#C9A24A] text-white"
                          : isTop10
                            ? "bg-[#2A579E] text-white"
                            : "bg-neutral-100 text-neutral-700"
                      }`}
                      title={`${t("seasonStats.position")} ${item.position ?? "—"}`}
                    >
                      <span className="text-[9px] font-bold uppercase opacity-80">
                        {tied ? "T" : "Pos"}
                      </span>
                      <span className="text-base font-bold">{pos ?? "—"}</span>
                    </div>

                    {/* Torneo */}
                    <div className="min-w-0">
                      <div className="truncate font-semibold text-neutral-900">
                        {item.name ?? "—"}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-neutral-500">
                        <span>{item.date ?? "—"}</span>
                        {item.rounds && (
                          <span className="flex flex-wrap gap-1">
                            {item.rounds.split(/\s+/).map((r, i) => (
                              <span
                                key={i}
                                className="rounded-md bg-neutral-100 px-1.5 py-0.5 text-xs font-medium text-neutral-700 tabular-nums"
                              >
                                {r}
                              </span>
                            ))}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Resultado */}
                    <div className="col-span-2 flex gap-6 border-t border-neutral-100 pt-3 text-sm sm:col-span-1 sm:border-0 sm:pt-0 sm:text-right">
                      <div>
                        <div className="text-xs uppercase tracking-wider text-neutral-500">
                          {t("seasonStats.score").replace(":", "")}
                        </div>
                        <div className="text-lg font-semibold text-neutral-900 tabular-nums">
                          {item.score ?? "—"}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs uppercase tracking-wider text-neutral-500">
                          {t("seasonStats.vsPar").replace(":", "")}
                        </div>
                        <div className="text-lg font-semibold text-neutral-900 tabular-nums">
                          {item.vspar ?? "—"}
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {listForSelected.length > 6 && (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => setShowAll((v) => !v)}
                className="rounded-full border-2 border-[#1B3A75] px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-[#1B3A75] transition-colors hover:bg-[#1B3A75] hover:text-white"
              >
                {showAll ? t("seasonStats.showLess") : t("seasonStats.showAll")}
              </button>
            </div>
          )}
        </div>
      )}

      {!loading && !error && !hasAnyData && (
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-yellow-800">
          {t("seasonStats.noData")}
        </div>
      )}
    </div>
  );
}
