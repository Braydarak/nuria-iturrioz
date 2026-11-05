// Acceso a la API pública de resultados del LET y elección del torneo activo.
import type { Tournament } from "../utils/tournamentDate";
import { isValidLetData } from "./parse";

const LET_BASE = "https://api.euro.ocs-software.com/let/cache/let";
const REQUEST_TIMEOUT_MS = 10_000;

// El parámetro de la URL cambia según el torneo ("SRC" o "ESC") y el que se
// carga a mano en la base de datos puede estar mal: se prueban todos y se
// recuerda el que funcionó.
const KNOWN_PARAMS = ["SRC", "ESC"];
const PARAM_STORAGE_PREFIX = "let-param:";

/** "05/11/26" → Date local a las 00:00 */
export const parseShortDate = (value: string | undefined): Date | null => {
  if (!value) return null;
  const [d, m, y] = value.split("/").map(Number);
  if (!d || !m || y === undefined || Number.isNaN(y)) return null;
  return new Date(y < 100 ? 2000 + y : y, m - 1, d);
};

/** Vueltas del torneo según los días que dura (jueves a domingo = 4) */
export const roundsOf = (tournament: Tournament): number => {
  const start = parseShortDate(tournament.date);
  const end = parseShortDate(tournament.date_end ?? tournament.date);
  if (!start || !end) return 4;
  const days = Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1;
  return Math.min(Math.max(days, 1), 6);
};

/** La temporada sale del año del torneo, no de un valor fijo */
export const seasonOf = (tournament: Tournament): number =>
  parseShortDate(tournament.date)?.getFullYear() ?? new Date().getFullYear();

export const letRoundUrl = (
  season: number,
  code: string,
  round: number,
  param: string,
) =>
  `${LET_BASE}/${season}/${season}-${code}-scores-P*${round}${param}0${round}.json`;

/**
 * Torneo que se está jugando ahora. La ventana tiene un día de margen a cada
 * lado: los torneos en Asia o América se juegan en otro huso horario y, desde
 * España, la primera vuelta puede empezar el día anterior a la fecha oficial.
 * Si en la ventana no hay datos todavía, la API simplemente no devuelve nada.
 */
export const findActiveTournament = (
  tournaments: Tournament[],
  now = new Date(),
): Tournament | null => {
  const DAY = 24 * 60 * 60 * 1000;
  const candidates = tournaments.filter((t) => {
    const start = parseShortDate(t.date);
    const end = parseShortDate(t.date_end ?? t.date);
    if (!t.code || !start || !end) return false;
    const from = start.getTime() - DAY;
    const to = end.getTime() + 2 * DAY; // fin del día siguiente al último
    return now.getTime() >= from && now.getTime() < to;
  });
  // Si se solapan, primero los confirmados / donde Nuria está inscripta
  const score = (t: Tournament) =>
    (t.confirmed ? 2 : 0) + (/entered/i.test(t.status ?? "") ? 1 : 0);
  return candidates.sort((a, b) => score(b) - score(a))[0] ?? null;
};

const fetchJson = async (url: string): Promise<unknown> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const requestUrl = new URL(url);
    // El archivo está detrás de una caché: se evita recibir una copia vieja
    requestUrl.searchParams.set("randomadd", Date.now().toString());
    const res = await fetch(requestUrl.toString(), {
      signal: controller.signal,
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
};

const storageKey = (season: number, code: string) =>
  `${PARAM_STORAGE_PREFIX}${season}-${code}`;

const rememberedParam = (season: number, code: string) => {
  try {
    return localStorage.getItem(storageKey(season, code));
  } catch {
    return null;
  }
};

const rememberParam = (season: number, code: string, param: string) => {
  try {
    localStorage.setItem(storageKey(season, code), param);
  } catch {
    // modo privado o sin almacenamiento: no pasa nada
  }
};

export type LetFetchResult = {
  data: Record<string, unknown>;
  round: number;
  param: string;
};

/**
 * Trae el archivo de la última vuelta con resultados. Pide las 4 vueltas en
 * paralelo con cada parámetro posible (empezando por el que funcionó antes) y
 * se queda con la vuelta más alta que tenga datos válidos de este torneo.
 * Devuelve null si el torneo todavía no tiene resultados.
 * Lanza error solo si todas las peticiones fallaron por red.
 */
export const fetchLatestRound = async (
  tournament: Tournament,
  maxRounds = Math.max(roundsOf(tournament), 4),
): Promise<LetFetchResult | null> => {
  const code = tournament.code!;
  const season = seasonOf(tournament);
  const params = [
    rememberedParam(season, code),
    tournament.scores_param,
    ...KNOWN_PARAMS,
  ].filter((p, i, all): p is string => !!p && all.indexOf(p) === i);

  let networkErrors = 0;
  let attempts = 0;

  for (const param of params) {
    const rounds = Array.from({ length: maxRounds }, (_, i) => i + 1);
    const results = await Promise.all(
      rounds.map(async (round) => {
        attempts++;
        try {
          const data = await fetchJson(letRoundUrl(season, code, round, param));
          // Válido y del torneo pedido (evita mostrar otro torneo)
          if (!isValidLetData(data)) return null;
          const dataCode = String(data.code ?? data.tournid ?? "");
          if (dataCode && dataCode !== String(code)) return null;
          return { data, round, param };
        } catch {
          networkErrors++;
          return null;
        }
      }),
    );
    const latest = results.filter((r) => r !== null).pop();
    if (latest) {
      rememberParam(season, code, param);
      return latest as LetFetchResult;
    }
  }

  if (attempts > 0 && networkErrors === attempts) {
    throw new Error("No se pudo conectar con los resultados del LET");
  }
  return null;
};
