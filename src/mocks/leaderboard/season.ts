const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

// A season is 28 days and rolls over on a Sunday at 23:00.
export const SEASON_LENGTH_DAYS = 28;
const SEASON_MS = SEASON_LENGTH_DAYS * DAY_MS;
const ANCHOR = new Date(2024, 0, 7, 23, 0, 0, 0).getTime();

function getSeasonStart(timestamp: number) {
  return ANCHOR + Math.floor((timestamp - ANCHOR) / SEASON_MS) * SEASON_MS;
}

// Rounding absorbs the one-hour drift a DST change introduces between boundaries.
export function getSeasonIndex(timestamp: number) {
  return Math.round((getSeasonStart(timestamp) - ANCHOR) / SEASON_MS);
}

function getSeasonEnd(timestamp: number) {
  return getSeasonStart(ANCHOR + (getSeasonIndex(timestamp) + 1) * SEASON_MS + DAY_MS);
}

// How far through the season we are: 0 at the boundary, 1 at the next one.
export function getSeasonProgress(timestamp: number) {
  const start = getSeasonStart(timestamp);
  return Math.min(1, Math.max(0, (timestamp - start) / (getSeasonEnd(timestamp) - start)));
}

export const getTimeRemaining = (timestamp: number) => Math.max(0, getSeasonEnd(timestamp) - timestamp);
