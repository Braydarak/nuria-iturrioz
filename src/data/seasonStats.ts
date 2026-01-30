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

export function extractYearFromDate(date: string | null): string | null {
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

export function seasonKey(h: HighlightTournament): string {
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

export interface SeasonStatsData {
  highlights: HighlightTournament[];
  currentSeason: string | null;
  currentItems: HighlightTournament[];
}

export async function fetchSeasonStats(): Promise<SeasonStatsData> {
  const res = await fetch(PROFILE_URL, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = (await res.json()) as unknown;
  const hs = getCareerHighlights(json);
  const ts = getThisSeasonRecord(json);
  const ls = getLastSeasonHighlightsLatest(json);

  return {
    highlights: [...hs, ...ls.tournaments],
    currentSeason: ts.season,
    currentItems: ts.tournaments,
  };
}
