import { useState, useEffect } from "react";
import { LET_API_URL } from "../utils/constants";

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
        const response = await fetch(`${LET_API_URL}?randomadd=${Date.now()}`);
        if (!response.ok) throw new Error("Failed to fetch");

        const data = await response.json();

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
