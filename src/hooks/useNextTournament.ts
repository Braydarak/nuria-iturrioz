import { useEffect, useState } from "react";
import { getNextTournament, type NextTournament } from "../utils/tournamentDate";
import { useLive } from "../live/liveStore";

const DAY_MS = 1000 * 60 * 60 * 24;
// Se anuncia el próximo torneo cuando falta una semana o menos
const ANNOUNCE_DAYS_BEFORE = 7;

export const useNextTournament = () => {
  const [loaded, setNextTournament] = useState<NextTournament | null>(null);
  const live = useLive();

  // Por huso horario, un torneo en Asia puede estar jugándose cuando en
  // España todavía es el día anterior: si ya hay resultados en vivo de ese
  // torneo, cuenta como actual aunque la fecha local diga que no empezó.
  const nextTournament: NextTournament | null =
    loaded &&
    !loaded.isCurrent &&
    !!live.snapshot &&
    live.tournament?.code === loaded.code
      ? { ...loaded, isCurrent: true }
      : loaded;

  useEffect(() => {
    let cancelled = false;
    getNextTournament()
      .then((tournament) => {
        if (!cancelled) setNextTournament(tournament);
      })
      .catch(() => {
        if (!cancelled) setNextTournament(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysUntilStart = nextTournament
    ? Math.ceil((nextTournament.parsedDate.getTime() - today.getTime()) / DAY_MS)
    : null;
  const showNextTournament =
    !!nextTournament &&
    (nextTournament.isCurrent ||
      (daysUntilStart !== null &&
        daysUntilStart >= 0 &&
        daysUntilStart <= ANNOUNCE_DAYS_BEFORE));

  return { nextTournament, showNextTournament };
};
