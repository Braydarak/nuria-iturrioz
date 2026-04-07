import { useState, useEffect } from "react";
import { getLetApiUrl } from "../utils/constants";
import { fetchTournamentsData } from "../utils/tournamentDate";

interface LiveStatus {
  isLive: boolean;
  loading: boolean;
  position: string | null;
  tournamentName: string | null;
  round: number | null;
  hasData: boolean;
}

export const useLiveStatus = (): LiveStatus => {
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [position, setPosition] = useState<string | null>(null);
  const [tournamentName, setTournamentName] = useState<string | null>(null);
  const [round, setRound] = useState<number | null>(null);
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const checkStatus = async () => {
      try {
        // Determine current tournament
        const now = new Date();
        const { tournaments } = await fetchTournamentsData();
        const activeTournament = tournaments.find((t) => {
          if (!t.date || !t.date_end) return false;
          // Parse tournament dates (format: DD/MM/YY)
          const [startDay, startMonth, startYear] = t.date.split("/");
          const [endDay, endMonth, endYear] = t.date_end.split("/");

          const startDate = new Date(
            2000 + parseInt(startYear),
            parseInt(startMonth) - 1,
            parseInt(startDay),
          );
          const endDate = new Date(
            2000 + parseInt(endYear),
            parseInt(endMonth) - 1,
            parseInt(endDay),
          );

          // Set endDate to end of day
          endDate.setHours(23, 59, 59, 999);

          return now >= startDate && now <= endDate && t.code;
        });

        // Use active tournament code or default to latest if none active (or specific fallback)
        // If no active tournament, we might not want to show live status or show the last one?
        // For now, let's use the active one if found, otherwise maybe the first one or null
        const fallbackTournament = tournaments.find((t) => t.code === "2016");
        const tournamentCode =
          activeTournament?.code ?? fallbackTournament?.code ?? "2016";
        const scoresParam =
          activeTournament?.scores_param ??
          fallbackTournament?.scores_param ??
          "SRC";

        let data = null;
        for (let r = 4; r >= 1; r--) {
          try {
            const url = getLetApiUrl(r, tournamentCode, scoresParam);
            const requestUrl = new URL(url);
            requestUrl.searchParams.set("randomadd", Date.now().toString());
            const response = await fetch(requestUrl.toString());
            if (response.ok) {
              const jsonData = await response.json();
              if (jsonData && jsonData.full_name) {
                data = jsonData;
                break;
              }
            }
          } catch {
            // ignore
          }
        }

        if (!data) throw new Error("No data available");

        if (isMounted) {
          setTournamentName(data.full_name || data.short_name || "Tournament");

          const nuria = data.scores.scores_entry.find(
            (p: { playing_name: string; holes: string }) =>
              p.playing_name === "Nuria Iturrioz",
          );

          if (nuria) {
            setHasData(true);
            setPosition(nuria.pos || null);
            const currentRound = parseInt(data.last_round_with_scores) || 1;
            setRound(currentRound);

            // Verificamos si Nuria ha terminado la ronda
            // Si holes es "F" (Finished) O si el status de la ronda actual es "F"
            // También podemos verificar status_RX donde X es la ronda actual
            // En algunos casos holes está vacío "" cuando ha terminado, así que verificamos también eso si status_RX es "F" o "RTD" (Retirado) o "C" (Cut)
            const statusKey = `status_R${currentRound}`;
            const roundStatus = nuria[statusKey];

            // Si status es 'F' (Finished) o holes es 'F' o holes está vacío pero tenemos status de finalización
            const isFinished =
              nuria.holes === "F" ||
              ["F", "RTD", "C", "WD", "DQ"].includes(roundStatus);

            if (!isFinished) {
              setIsLive(true);
            } else {
              setIsLive(false);
            }
          } else {
            setHasData(false);
            setIsLive(false);
            setPosition(null);
            setRound(null);
          }
          setLoading(false);
        }
      } catch {
        if (isMounted) {
          setIsLive(false);
          setLoading(false);
          setPosition(null);
          setTournamentName(null);
          setRound(null);
          setHasData(false);
        }
      }
    };

    checkStatus();

    return () => {
      isMounted = false;
    };
  }, []);

  return { isLive, loading, position, tournamentName, round, hasData };
};
