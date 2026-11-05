// Convierte el JSON de resultados del LET (OCS Software) en un resumen de la
// vuelta de Nuria. Es una función pura, sin red, así se puede testear con
// datos reales guardados (ver parse.test.ts).
//
// Lo que aprendimos de la API (no está documentada):
// - La jugadora no trae un campo "hoyo actual": se deduce de hole_scores_R{n}
//   (hoyos terminados) y de strokes_R{n} ("hoyo,golpes," mientras juega uno).
// - status_R{n} vale "C" cuando la tarjeta está completa (no significa "cut").
//   Por eso el estado se calcula contando hoyos, no con esos códigos.
// - Se puede salir por el hoyo 1 o por el 10 (tee_R{n}).
// - Los valores llegan como texto: "Par", "E", "" o números con signo.

export const NURIA_MEMBER_NO = "200899";
const NURIA_NAME = "nuria iturrioz";

/** Estados en los que la jugadora ya no sigue en el torneo */
const OUT_CODES = ["WD", "DQ", "RTD", "MC", "CUT", "DNS", "NS", "W/D"];

export type RoundState =
  | "not-started" // la vuelta existe pero todavía no salió
  | "on-course" // jugando ahora
  | "round-finished" // terminó la vuelta (puede haber otra después)
  | "tournament-finished" // terminó la última vuelta del torneo
  | "out"; // retirada, descalificada o no pasó el corte

export type HoleScore = { number: number; par: number; strokes: number | null };

export type RoundSummary = {
  id: number;
  date: string | null;
  strokes: number | null;
  toPar: number | null;
  state: "upcoming" | "in-progress" | "finished";
};

export type LiveSnapshot = {
  tournamentCode: string;
  tournamentName: string;
  location: string;
  dates: string;
  round: number;
  totalRounds: number;
  state: RoundState;
  outLabel: string | null;
  holes: HoleScore[];
  /** Orden en que se juegan los hoyos (empieza en el tee de salida) */
  playOrder: number[];
  startTee: number;
  holesPlayed: number;
  /** Hoyo que está jugando (o el próximo); null si no salió o terminó */
  currentHole: number | null;
  /** Golpes en el hoyo actual, si el LET los informa */
  currentHoleStrokes: number | null;
  coursePar: number;
  totalToPar: number | null;
  roundToPar: number | null;
  position: { label: string; pos: number | null } | null;
  /** Hora de salida de la vuelta, en hora local del torneo */
  teeTime: string | null;
  rounds: RoundSummary[];
  /** Cuándo actualizó el LET sus resultados por última vez */
  updatedAt: Date | null;
};

type Entry = Record<string, string | undefined>;
type LetData = Record<string, unknown> & {
  scores?: { scores_entry?: Entry[] };
};

/** "Par"/"E" → 0, "+3" → 3, "" o basura → null */
export const parseToPar = (value: string | undefined): number | null => {
  if (value == null) return null;
  const v = value.trim();
  if (v === "") return null;
  if (/^(par|e|even)$/i.test(v)) return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

const parsePositiveInt = (value: unknown): number | null => {
  if (typeof value !== "string" && typeof value !== "number") return null;
  const n = parseInt(String(value), 10);
  return Number.isFinite(n) && n > 0 ? n : null;
};

const splitList = (value: unknown): string[] =>
  typeof value === "string" ? value.split(",") : [];

/** ¿El JSON tiene la forma de un archivo de resultados válido? */
export const isValidLetData = (data: unknown): data is LetData => {
  if (typeof data !== "object" || data === null) return false;
  const d = data as LetData;
  return (
    typeof d.full_name === "string" &&
    d.full_name !== "" &&
    Array.isArray(d.scores?.scores_entry)
  );
};

export const findNuria = (entries: Entry[]): Entry | undefined =>
  entries.find((e) => e.member_no === NURIA_MEMBER_NO) ??
  entries.find(
    (e) => (e.playing_name ?? "").trim().toLowerCase() === NURIA_NAME,
  );

/** Orden de juego según el tee de salida: 1..18 o 10..18,1..9 */
export const playOrderFrom = (startTee: number, holeCount = 18): number[] => {
  const start = startTee >= 1 && startTee <= holeCount ? startTee : 1;
  return Array.from(
    { length: holeCount },
    (_, i) => ((start - 1 + i) % holeCount) + 1,
  );
};

const positionOf = (
  nuria: Entry,
  entries: Entry[],
): LiveSnapshot["position"] => {
  const raw = (nuria.pos ?? "").trim();
  if (raw === "") return null;
  const pos = parsePositiveInt(raw);
  if (pos === null) return { label: raw.toUpperCase(), pos: null };
  // Empate: el LET a veces marca "tied" y a veces solo repite la posición
  const tied =
    (nuria.tied ?? "").trim() !== "" ||
    entries.filter((e) => (e.pos ?? "").trim() === raw).length > 1;
  return { label: `${tied ? "T" : ""}${pos}`, pos };
};

const outLabelOf = (nuria: Entry, round: number): string | null => {
  const candidates = [nuria.pos, nuria[`status_R${round}`], nuria.status];
  for (const c of candidates) {
    const v = (c ?? "").trim().toUpperCase();
    if (OUT_CODES.includes(v)) return v;
  }
  return null;
};

/**
 * fileRound: vuelta del archivo pedido. Si es posterior a la última con
 * resultados y Nuria ya tiene hora de salida en ella, esa vuelta todavía no
 * empezó: se muestra como "no salió" con su hora de salida.
 */
export type ParseOptions = {
  /** Vuelta del archivo pedido a la API */
  fileRound?: number;
  /**
   * Vueltas que tiene el torneo (por los días que dura). El archivo de una
   * vuelta solo trae la fecha de la siguiente, así que no sirve para saberlo.
   */
  expectedRounds?: number;
};

export const parseLetData = (
  data: unknown,
  { fileRound, expectedRounds }: ParseOptions = {},
): LiveSnapshot | null => {
  if (!isValidLetData(data)) return null;
  const entries = data.scores!.scores_entry!;
  const nuria = findNuria(entries);
  if (!nuria) return null;

  const pars = splitList(data.course_par)
    .filter((p) => p.trim() !== "")
    .map(Number)
    .filter((n) => Number.isFinite(n) && n > 0);
  const holeCount = pars.length || 18;

  // Vueltas del torneo: las que tienen fecha (date_R1..date_R6)
  const roundIds: number[] = [];
  for (let i = 1; i <= 6; i++) if (data[`date_R${i}`]) roundIds.push(i);
  const totalRounds = Math.max(expectedRounds ?? 4, ...roundIds, 1);
  // Las vueltas futuras sin fecha todavía también se listan
  for (let i = 1; i <= totalRounds; i++) if (!roundIds.includes(i)) roundIds.push(i);
  roundIds.sort((a, b) => a - b);

  const scoredRound =
    parsePositiveInt(data.last_round_with_scores) ??
    parsePositiveInt(data.round) ??
    1;
  const drawnNext =
    fileRound !== undefined &&
    fileRound > scoredRound &&
    (nuria[`time_R${fileRound}`] ?? "").trim() !== "";
  const round = drawnNext ? fileRound! : scoredRound;

  const holeScores = splitList(nuria[`hole_scores_R${round}`]);
  const holes: HoleScore[] = Array.from({ length: holeCount }, (_, i) => ({
    number: i + 1,
    par: pars[i] ?? 4,
    strokes: parsePositiveInt(holeScores[i]),
  }));
  const holesPlayed = holes.filter((h) => h.strokes !== null).length;

  const startTee = parsePositiveInt(nuria[`tee_R${round}`]) ?? 1;
  const playOrder = playOrderFrom(startTee, holeCount);

  // "hoyo,golpes," mientras está en un hoyo; ",," si no
  const [liveHoleRaw, liveStrokesRaw] = splitList(nuria[`strokes_R${round}`]);
  const liveHole = parsePositiveInt(liveHoleRaw);
  const liveStrokes = parsePositiveInt(liveStrokesRaw);

  const outLabel = outLabelOf(nuria, round);

  let state: RoundState;
  if (outLabel) state = "out";
  else if (holesPlayed >= holeCount)
    state = round >= totalRounds ? "tournament-finished" : "round-finished";
  else if (holesPlayed > 0 || liveHole !== null) state = "on-course";
  else state = "not-started";

  let currentHole: number | null = null;
  if (state === "on-course") {
    currentHole =
      liveHole && liveHole <= holeCount
        ? liveHole
        : (playOrder.find((n) => holes[n - 1].strokes === null) ?? null);
  }

  const rounds: RoundSummary[] = roundIds.map((id) => {
    const strokes = parsePositiveInt(nuria[`score_R${id}`]);
    const inProgress = id === round && state === "on-course";
    return {
      id,
      date: (data[`date_R${id}`] as string) || null,
      strokes: inProgress ? null : strokes,
      toPar: parseToPar(nuria[`vspar_R${id}`]),
      state: inProgress ? "in-progress" : strokes ? "finished" : "upcoming",
    };
  });

  const updatedJulian = parsePositiveInt(data.last_scores_update_julian);

  return {
    tournamentCode: String(data.code ?? data.tournid ?? ""),
    tournamentName: String(data.full_name),
    location: String(data.course_name ?? ""),
    // tourn_dates trae solo las fechas; course_dates repite el nombre del campo
    dates: String(data.tourn_dates || data.course_dates || ""),
    round,
    totalRounds,
    state,
    outLabel,
    holes,
    playOrder,
    startTee: playOrder[0],
    holesPlayed,
    currentHole,
    currentHoleStrokes: state === "on-course" ? liveStrokes : null,
    coursePar: holes.reduce((sum, h) => sum + h.par, 0),
    totalToPar: parseToPar(nuria.vspar),
    roundToPar: parseToPar(nuria[`vspar_R${round}`]),
    position: positionOf(nuria, entries),
    teeTime: (nuria[`time_R${round}`] ?? "").trim() || null,
    rounds,
    // last_scores_update_julian es un timestamp Unix en segundos
    updatedAt: updatedJulian ? new Date(updatedJulian * 1000) : null,
  };
};
