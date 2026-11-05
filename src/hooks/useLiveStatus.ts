import { useLive } from "../live/liveStore";

interface LiveStatus {
  isLive: boolean;
  loading: boolean;
  /** Posición lista para mostrar ("T12", "5", "MC"...) */
  position: string | null;
  tournamentName: string | null;
  tournamentCode: string | null;
  round: number | null;
  /** Hay resultados de Nuria en el torneo activo */
  hasData: boolean;
}

// Resumen del estado en vivo para el header, el hero y el popup. Los datos
// vienen de la fuente compartida (live/liveStore), que se actualiza sola.
export const useLiveStatus = (): LiveStatus => {
  const live = useLive();
  const snap = live.snapshot;
  return {
    isLive: live.isLive,
    loading: live.status === "loading",
    position: snap?.position?.label ?? null,
    tournamentName: snap?.tournamentName ?? live.tournament?.name ?? null,
    tournamentCode: live.tournament?.code ?? null,
    round: snap?.round ?? null,
    hasData: !!snap,
  };
};
