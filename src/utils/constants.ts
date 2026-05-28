export const getLetApiUrl = (
  round: number,
  tournamentCode: string,
  scoresParam = "SRC",
) =>
  `https://api.euro.ocs-software.com/let/cache/let/2026/2026-${tournamentCode}-scores-P*${round}${scoresParam}0${round}.json?`;

export const LET_API_URL = getLetApiUrl(2, "2016"); // Default fallback

export const SITE_URL = "https://nuriaiturrioz.com";
export const DEFAULT_OG_IMAGE_URL = `${SITE_URL}/nuria-og.png`;
