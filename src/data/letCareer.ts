import { useEffect, useState } from "react";
import { fetchLetProfile } from "./letProfile";

// Datos de carrera de Nuria en el LET para la página de estadísticas.
// Solo se usa el tour principal (LET), no el LET Access Series.

export type CareerStat = {
  code: string;
  description: string;
  value: number | null;
  /** Valor tal cual viene de la API ("+0.31", "1,396") */
  raw: string;
  notes: string;
  tournaments: number | null;
  seasons: number | null;
};

export type CareerRecordNote = {
  date: string;
  event: string;
  round: number | null;
  hole: number | null;
};

export type LetCareer = {
  stats: Map<string, CareerStat>;
};

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null;

const asList = (v: unknown): unknown[] =>
  Array.isArray(v) ? v : isRecord(v) ? [v] : [];

const str = (v: unknown) =>
  v === undefined || v === null ? "" : String(v).trim();

const num = (v: unknown): number | null => {
  const cleaned = str(v).replace(/,/g, "");
  if (!cleaned) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
};

export function parseLetCareer(json: unknown): LetCareer {
  const stats = new Map<string, CareerStat>();
  const statistics = isRecord(json) ? json["STATISTICS"] : undefined;
  const statList = asList(
    isRecord(statistics) ? statistics["STATISTIC"] : statistics,
  );
  for (const item of statList) {
    if (!isRecord(item) || str(item["TOUR"]) !== "LET") continue;
    const code = str(item["CODE"]);
    if (!code || stats.has(code)) continue;
    stats.set(code, {
      code,
      description: str(item["DESCRIPTION"]),
      value: num(item["VALUE"]),
      raw: str(item["VALUE"]),
      notes: str(item["NOTES"]),
      tournaments: num(item["TOURNAMENTS"]),
      seasons: num(item["SEASONS"]),
    });
  }

  return { stats };
}

/**
 * Las notas de la API vienen como
 * "20/03/25 - Ford Women's NSW Open (Round 3)" o
 * "09/02/17 - Oates Vic Open (Round 02, Hole 17)".
 */
export function parseRecordNote(notes: string): CareerRecordNote | null {
  const match = notes.match(
    /^(\d{2}\/\d{2}\/\d{2})\s*-\s*(.+?)(?:\s*\(([^)]*)\))?$/,
  );
  if (!match) return null;
  const detail = match[3] ?? "";
  const round = detail.match(/Round\s*0*(\d+)/i);
  const hole = detail.match(/Hole\s*0*(\d+)/i);
  return {
    date: match[1],
    event: match[2].trim(),
    round: round ? Number(round[1]) : null,
    hole: hole ? Number(hole[1]) : null,
  };
}

export function useLetCareer() {
  const [career, setCareer] = useState<LetCareer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchLetProfile()
      .then((json) => {
        if (!cancelled) setCareer(parseLetCareer(json));
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { career, loading, error };
}
