import tournamentsData from "../../data/tournaments.json";

export const getNextTournament = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const parseDate = (dateStr: string) => {
    const [day, month, year] = dateStr.split("/").map(Number);
    return new Date(2000 + year, month - 1, day);
  };

  const upcoming = tournamentsData.tournaments
    .filter((t) => t.confirmed)
    .map((t) => ({
      ...t,
      parsedDate: parseDate(t.date),
      parsedEndDate: t.date_end ? parseDate(t.date_end) : parseDate(t.date),
    }))
    .filter((t) => t.parsedEndDate >= today)
    .sort((a, b) => a.parsedDate.getTime() - b.parsedDate.getTime());

  const tournament = upcoming[0];
  if (!tournament) return null;

  return {
    ...tournament,
    isCurrent: tournament.parsedDate <= today,
  };
};
