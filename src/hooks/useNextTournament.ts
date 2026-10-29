import { useEffect, useState } from "react";
import { getNextTournament, type NextTournament } from "../utils/tournamentDate";

const DAY_MS = 1000 * 60 * 60 * 24;
// Se anuncia el próximo torneo cuando falta una semana o menos
const ANNOUNCE_DAYS_BEFORE = 7;

export const useNextTournament = () => {
  const [nextTournament, setNextTournament] = useState<NextTournament | null>(
    null,
  );

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
