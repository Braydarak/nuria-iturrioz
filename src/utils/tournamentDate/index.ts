export type Tournament = {
  id?: number;
  name?: string;
  date?: string;
  date_end?: string;
  location?: string;
  country?: string;
  type?: string;
  confirmed?: boolean;
  code?: string;
  scores_param?: string;
};

export type NextTournament = Tournament & {
  parsedDate: Date;
  parsedEndDate: Date;
  isCurrent: boolean;
};

type TournamentsPayload = {
  tournaments: Tournament[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseDate(dateStr: string): Date {
  const [day, month, year] = dateStr.split("/").map(Number);
  return new Date(2000 + year, month - 1, day);
}

export async function fetchTournamentsData(): Promise<TournamentsPayload> {
  const baseUrl = new URL(import.meta.env.BASE_URL, document.baseURI);
  const url = new URL("tournaments.json", baseUrl);
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok)
    throw new Error(`No se pudo cargar ${url.toString()} (HTTP ${res.status})`);

  const json = (await res.json()) as unknown;
  if (!isRecord(json) || !Array.isArray(json.tournaments))
    return { tournaments: [] };
  const tournaments = json.tournaments.filter(isRecord) as Tournament[];
  return { tournaments };
}

export function getNextTournamentFromData(
  payload: TournamentsPayload,
): NextTournament | null {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming = payload.tournaments
    .filter((t) => Boolean(t.confirmed) && typeof t.date === "string")
    .map((t) => {
      const start = parseDate(t.date!);
      const end =
        typeof t.date_end === "string"
          ? parseDate(t.date_end)
          : parseDate(t.date!);
      return {
        ...t,
        parsedDate: start,
        parsedEndDate: end,
      };
    })
    .filter((t) => t.parsedEndDate >= today)
    .sort((a, b) => a.parsedDate.getTime() - b.parsedDate.getTime());

  const tournament = upcoming[0];
  if (!tournament) return null;

  return {
    ...tournament,
    isCurrent: tournament.parsedDate <= today,
  };
}

export async function getNextTournament(): Promise<NextTournament | null> {
  try {
    const data = await fetchTournamentsData();
    return getNextTournamentFromData(data);
  } catch (err) {
    console.error(err);
    return null;
  }
}
