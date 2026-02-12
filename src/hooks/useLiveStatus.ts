import { useState, useEffect } from "react";
import { LET_API_URL } from "../utils/constants";

interface LiveStatus {
  isLive: boolean;
  loading: boolean;
  position: string | null;
  tournamentName: string | null;
}

export const useLiveStatus = (): LiveStatus => {
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [position, setPosition] = useState<string | null>(null);
  const [tournamentName, setTournamentName] = useState<string | null>(null);

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

          if (nuria && nuria.holes !== "F") {
            setIsLive(true);
            setPosition(nuria.pos || null);
          } else {
            setIsLive(false);
            setPosition(null);
          }
          setLoading(false);
        }
      } catch {
        if (isMounted) {
          setIsLive(false);
          setLoading(false);
          setPosition(null);
          setTournamentName(null);
        }
      }
    };

    checkStatus();

    return () => {
      isMounted = false;
    };
  }, []);

  return { isLive, loading, position, tournamentName };
};
