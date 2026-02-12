import { useState, useEffect } from "react";
import { LET_API_URL } from "../utils/constants";

export const useLiveStatus = () => {
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const checkStatus = async () => {
      try {
        const response = await fetch(`${LET_API_URL}?randomadd=${Date.now()}`);
        if (!response.ok) throw new Error("Failed to fetch");

        const data = await response.json();
        const nuria = data.scores.scores_entry.find(
          (p: { playing_name: string; holes: string }) =>
            p.playing_name === "Nuria Iturrioz",
        );

        if (isMounted) {
          if (nuria && nuria.holes !== "F") {
            setIsLive(true);
          } else {
            setIsLive(false);
          }
          setLoading(false);
        }
      } catch {
        if (isMounted) {
          setIsLive(false);
          setLoading(false);
        }
      }
    };

    checkStatus();

    return () => {
      isMounted = false;
    };
  }, []);

  return { isLive, loading };
};
