import { useEffect, useMemo, useState } from "react";
import AnimatedLoader from "../animatedLoader";

// Usamos el mismo endpoint del perfil
const PROFILE_URL =
  "https://api.euro.ocs-software.com/let/cache/let/profiles/200899?randomadd=1769433522174";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function toStr(v: unknown): string | null {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  return s.length ? s : null;
}

function extractYearFromDate(date: string | null): string | null {
  if (!date) return null;
  const segments = date.split(/[^0-9]+/).filter(Boolean);
  const last = segments[segments.length - 1];
  if (!last) return null;
  if (last.length === 4) return last;
  if (last.length === 2) return `20${last}`;
  return null;
}

export type HighlightTournament = {
  date: string | null;
  name: string | null;
  season: string | null;
  position: string | null;
  rounds: string | null;
  score: string | null;
  vspar: string | null;
};

function getCareerHighlights(obj: unknown): HighlightTournament[] {
  if (!isRecord(obj)) return [];
  const ch = (obj["CAREER_HIGHLIGHTS"] ??
    obj["Career_Highlights"] ??
    obj["career_highlights"]) as unknown;
  const tournaments = isRecord(ch)
    ? ((ch["TOURNAMENT"] ?? ch["Tournament"] ?? ch["tournament"]) as unknown)
    : undefined;
  const arr = Array.isArray(tournaments)
    ? tournaments
    : isRecord(tournaments)
    ? [tournaments]
    : [];
  const out: HighlightTournament[] = [];
  for (const item of arr) {
    if (!isRecord(item)) continue;
    const date = toStr(item["DATE"]);
    const seasonFromField = toStr(item["SEASON"]);
    const seasonFromDate = extractYearFromDate(date);
    out.push({
      date,
      name: toStr(item["NAME"]),
      season: seasonFromField ?? seasonFromDate,
      position: toStr(item["POSITION"]),
      rounds: toStr(item["ROUNDS"]),
      score: toStr(item["SCORE"]),
      vspar: toStr(item["VSPAR"]),
    });
  }
  return out;
}

function getThisSeasonRecord(obj: unknown): {
  season: string | null;
  tournaments: HighlightTournament[];
} {
  if (!isRecord(obj)) return { season: null, tournaments: [] };
  const tsr = (obj["THIS_SEASON_RECORD"] ??
    obj["This_Season_Record"] ??
    obj["this_season_record"]) as unknown;
  if (!isRecord(tsr)) return { season: null, tournaments: [] };
  const season = toStr(tsr["SEASON"]);
  const tournamentsRaw = (tsr["TOURNAMENT"] ??
    tsr["Tournament"] ??
    tsr["tournament"]) as unknown;
  const arr = Array.isArray(tournamentsRaw)
    ? tournamentsRaw
    : isRecord(tournamentsRaw)
    ? [tournamentsRaw]
    : [];
  const tournaments: HighlightTournament[] = [];
  for (const item of arr) {
    if (!isRecord(item)) continue;
    tournaments.push({
      date: toStr(item["DATE"]),
      name: toStr(item["NAME"]),
      season: season ?? toStr(item["SEASON"]) ?? null,
      position: toStr(item["POSITION"]),
      rounds: toStr(item["ROUNDS"]),
      score: toStr(item["SCORE"]),
      vspar: toStr(item["VSPAR"]),
    });
  }
  return { season, tournaments };
}

function seasonKey(h: HighlightTournament): string {
  const y = extractYearFromDate(h.date);
  return y ?? h.season ?? "Desconocido";
}

function getLastSeasonHighlightsLatest(obj: unknown): {
  season: string | null;
  tournaments: HighlightTournament[];
} {
  if (!isRecord(obj)) return { season: null, tournaments: [] };
  const lsh = (obj["LAST_SEASON_HIGHLIGHTS"] ??
    obj["Last_Season_Highlights"] ??
    obj["last_season_highlights"]) as unknown;
  if (!isRecord(lsh)) return { season: null, tournaments: [] };
  const tournamentsRaw = (lsh["TOURNAMENT"] ??
    lsh["Tournament"] ??
    lsh["tournament"]) as unknown;
  const arr = Array.isArray(tournamentsRaw)
    ? tournamentsRaw
    : isRecord(tournamentsRaw)
    ? [tournamentsRaw]
    : [];
  const parsed: HighlightTournament[] = [];
  for (const item of arr) {
    if (!isRecord(item)) continue;
    const date = toStr(item["DATE"]);
    const seasonField = toStr(item["SEASON"]);
    const seasonFromDate = extractYearFromDate(date);
    parsed.push({
      date,
      name: toStr(item["NAME"]),
      season: seasonField ?? seasonFromDate,
      position: toStr(item["POSITION"]),
      rounds: toStr(item["ROUNDS"]),
      score: toStr(item["SCORE"]),
      vspar: toStr(item["VSPAR"]),
    });
  }
  // Elegimos el año más nuevo (numérico) entre los torneos
  const years = parsed
    .map((t) => extractYearFromDate(t.date) ?? t.season)
    .filter(Boolean) as string[];
  const numericYears = years
    .map((y) => Number(y))
    .filter((n) => Number.isFinite(n)) as number[];
  const latest = numericYears.length ? String(Math.max(...numericYears)) : null;
  const latestTournaments = latest
    ? parsed.filter((t) => (extractYearFromDate(t.date) ?? t.season) === latest)
    : [];
  return { season: latest, tournaments: latestTournaments };
}

export default function SeasonStats() {
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
        const res = await fetch(PROFILE_URL, {
          headers: { Accept: "application/json" },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as unknown;
        const hs = getCareerHighlights(json);
        const ts = getThisSeasonRecord(json);
        const ls = getLastSeasonHighlightsLatest(json);
        if (!cancelled) {
          setHighlights([...hs, ...ls.tournaments]);
          setCurrentSeason(ts.season);
          setCurrentItems(ts.tournaments);
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Error desconocido";
        if (!cancelled) setError(msg);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, []);

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
    const arr = selectedSeason ? bySeason.get(selectedSeason) ?? [] : [];
    return [...arr].sort(sortDesc);
  }, [selectedSeason, currentItems, bySeason]);

  useEffect(() => {
    setShowAll(false);
  }, [selectedSeason]);

  const hasAnyData = currentItems.length > 0 || highlights.length > 0;

  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
      <header className="mb-6">
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-900">
          Resultados por temporada
        </h2>
        <p className="mt-1 text-sm text-neutral-600">
          Explora los torneos de cada año y de la temporada actual.
        </p>
      </header>

      {loading && (
        <div className="rounded-xl border flex justify-center items-center w-full border-white/50 bg-white/40 p-4 animate-pulse">
          <AnimatedLoader />
        </div>
      )}

      {!loading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 p-4">
          {error}
        </div>
      )}

      {!loading && !error && hasAnyData && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            {currentSeason && currentItems.length > 0 && (
              <>
                <button
                  key="__CURRENT__"
                  type="button"
                  onClick={() => setSelectedSeason("__CURRENT__")}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
                    selectedSeason === "__CURRENT__"
                      ? "bg-[#2A579E] text-white border-[#2A579E]"
                      : "bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50"
                  }`}
                >
                  Temporada actual
                </button>
                {seasons.length > 0 && (
                  <span
                    aria-hidden="true"
                    className="mx-1 w-px h-6 bg-neutral-300"
                  />
                )}
              </>
            )}
            {seasons.map((s) => {
              const active = s === selectedSeason;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSelectedSeason(s)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
                    active
                      ? "bg-[#2A579E] text-white border-[#2A579E]"
                      : "bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50"
                  }`}
                >
                  {s}
                </button>
              );
            })}
          </div>

          <div className="rounded-2xl bg-white/60 backdrop-blur-sm border border-white/50">
            {selectedSeason && (
              <>
                <div className="px-4 sm:px-6 py-3 border-b border-neutral-200 bg-white/70">
                  {selectedSeason === "__CURRENT__" ? (
                    <span className="inline-flex items-center gap-2 text-sm text-neutral-700">
                      <span className="px-2 py-1 rounded-full bg-[#2A579E]/10 text-[#2A579E] font-medium">
                        Temporada actual
                      </span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2 text-sm text-neutral-700">
                      <span className="px-2 py-1 rounded-full bg-neutral-800/10 text-neutral-800 font-medium">
                        Temporada {selectedSeason}
                      </span>
                      
                    </span>
                  )}
                </div>

                <ul className="divide-y divide-neutral-200">
                  {(showAll
                    ? listForSelected
                    : listForSelected.slice(0, 4)
                  ).map((t, idx) => (
                    <li
                      key={idx}
                      className="px-4 sm:px-6 py-4 grid grid-cols-1 sm:grid-cols-5 gap-2 sm:gap-4 items-center"
                    >
                      <div className="text-neutral-600">
                        <div className="text-sm">{t.date ?? "—"}</div>
                        <div className="text-xs">
                          Posición: {t.position ?? "—"}
                        </div>
                      </div>
                      <div className="sm:col-span-2">
                        <div className="text-neutral-900 font-semibold">
                          {t.name ?? "—"}
                        </div>
                        <div className="text-xs text-neutral-500">
                          Rondas: {t.rounds ?? "—"}
                        </div>
                      </div>
                      <div className="text-neutral-900">
                        <div className="text-sm">Score: {t.score ?? "—"}</div>
                      </div>
                      <div className="text-neutral-900">
                        <div className="text-sm">Vs Par: {t.vspar ?? "—"}</div>
                      </div>
                    </li>
                  ))}
                </ul>

                {listForSelected.length > 4 && (
                  <div className="px-4 sm:px-6 py-3">
                    <button
                      type="button"
                      onClick={() => setShowAll((v) => !v)}
                      className="text-sm font-medium text-[#2A579E] hover:underline"
                    >
                      {showAll ? "Ver menos" : "Ver todos"}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {!loading && !error && !hasAnyData && (
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 text-yellow-800 p-4">
          No hay datos de torneos destacados por ahora.
        </div>
      )}
    </section>
  );
}
