// Fuente única del seguimiento en vivo. El header, el hero, el popup y la
// página /live leen todos de acá: una sola consulta compartida en vez de una
// por componente.
//
// - Mientras Nuria juega (o está por salir) se actualiza cada minuto; si no,
//   cada 5 minutos, y sin torneo activo revisa el calendario cada 30 minutos.
// - Si una actualización falla se conservan los últimos datos buenos y se
//   reintenta antes, con espera creciente.
// - Con la pestaña oculta no consulta; al volver, actualiza si hace falta.
import { useSyncExternalStore } from "react";
import { fetchTournamentsData, type Tournament } from "../utils/tournamentDate";
import { fetchLatestRound, findActiveTournament, roundsOf } from "./letApi";
import { parseLetData, type LiveSnapshot } from "./parse";

export type LiveStoreState = {
  /** loading: primera carga · idle: sin torneo activo · ready: hay respuesta */
  status: "loading" | "idle" | "ready";
  tournament: Tournament | null;
  /** null si el torneo todavía no tiene resultados o Nuria no está en el campo */
  snapshot: LiveSnapshot | null;
  /** El torneo tiene resultados pero Nuria no figura */
  notInField: boolean;
  /** Último error; los datos anteriores se mantienen */
  error: string | null;
  lastFetchedAt: Date | null;
  isLive: boolean;
};

const MINUTE = 60_000;
const LIVE_INTERVAL = MINUTE;
const ACTIVE_INTERVAL = 5 * MINUTE;
const IDLE_INTERVAL = 30 * MINUTE;
const TOURNAMENTS_TTL = 30 * MINUTE;
const RETRY_STEPS = [15_000, 30_000, MINUTE, 2 * MINUTE, 5 * MINUTE];

let state: LiveStoreState = {
  status: "loading",
  tournament: null,
  snapshot: null,
  notInField: false,
  error: null,
  lastFetchedAt: null,
  isLive: false,
};

const listeners = new Set<() => void>();
let timer: ReturnType<typeof setTimeout> | undefined;
let inFlight: Promise<void> | null = null;
let failures = 0;
let tournamentsCache: { at: number; list: Tournament[] } | null = null;

const setState = (patch: Partial<LiveStoreState>) => {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
};

const loadTournaments = async (): Promise<Tournament[]> => {
  if (tournamentsCache && Date.now() - tournamentsCache.at < TOURNAMENTS_TTL) {
    return tournamentsCache.list;
  }
  const { tournaments } = await fetchTournamentsData();
  tournamentsCache = { at: Date.now(), list: tournaments };
  return tournaments;
};

const nextDelay = (): number => {
  if (state.error) {
    return RETRY_STEPS[Math.min(failures - 1, RETRY_STEPS.length - 1)];
  }
  if (!state.tournament) return IDLE_INTERVAL;
  const s = state.snapshot?.state;
  if (s === "on-course" || s === "not-started") return LIVE_INTERVAL;
  // Torneo activo sin datos aún (por ej. antes de la primera vuelta)
  if (!state.snapshot) return LIVE_INTERVAL * 2;
  return ACTIVE_INTERVAL;
};

const schedule = () => {
  clearTimeout(timer);
  if (listeners.size === 0) return;
  if (typeof document !== "undefined" && document.hidden) return;
  timer = setTimeout(() => void refresh(), nextDelay());
};

const update = async () => {
  try {
    const tournament = findActiveTournament(await loadTournaments());
    if (!tournament) {
      failures = 0;
      setState({
        status: "idle",
        tournament: null,
        snapshot: null,
        notInField: false,
        error: null,
        lastFetchedAt: new Date(),
        isLive: false,
      });
      return;
    }

    const result = await fetchLatestRound(tournament);
    const snapshot = result
      ? parseLetData(result.data, {
          fileRound: result.round,
          expectedRounds: roundsOf(tournament),
        })
      : null;
    failures = 0;
    setState({
      status: "ready",
      tournament,
      snapshot,
      notInField: !!result && !snapshot,
      error: null,
      lastFetchedAt: new Date(),
      isLive: snapshot?.state === "on-course",
    });
  } catch (err) {
    failures++;
    console.warn("[live] no se pudo actualizar", err);
    // Se mantienen tournament/snapshot anteriores
    setState({
      status: state.status === "loading" ? "idle" : state.status,
      error: err instanceof Error ? err.message : String(err),
    });
  }
};

/** Pide datos nuevos ya (los pedidos simultáneos se unifican) */
export const refresh = (): Promise<void> => {
  if (!inFlight) {
    clearTimeout(timer);
    inFlight = update().finally(() => {
      inFlight = null;
      schedule();
    });
  }
  return inFlight;
};

const onVisibility = () => {
  if (document.hidden) {
    clearTimeout(timer);
    return;
  }
  const age = state.lastFetchedAt
    ? Date.now() - state.lastFetchedAt.getTime()
    : Infinity;
  if (age >= Math.min(nextDelay(), LIVE_INTERVAL)) void refresh();
  else schedule();
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  if (listeners.size === 1) {
    document.addEventListener("visibilitychange", onVisibility);
    if (!state.lastFetchedAt) void refresh();
    else onVisibility();
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    }
  };
};

const getSnapshot = () => state;

export const useLive = (): LiveStoreState =>
  useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
