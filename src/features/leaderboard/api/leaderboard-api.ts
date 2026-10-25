import { getDemoteCount, getLeague, getPromoteCount, LEAGUES } from "~/config/leagues";
import { getAllTimeStandings, getRivalProfile, getStandings } from "~/mocks/leaderboard/league-sim";
import { getSeasonIndex } from "~/mocks/leaderboard/season";
import { readDb, writeDb } from "~/mocks/mock-db";
import { getPath } from "~/mocks/paths/get-path";
import { getMockProfile } from "~/mocks/profile";
import { getMockProgress } from "~/mocks/progress";
import type { LeaderboardEntry, LeaderboardLeague, RivalProfile } from "~/types/leaderboard";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const WEEK_ANCHOR = new Date(2024, 0, 7, 23).getTime();
const DEFAULT_RIVAL_ID = "priya-s";

const currentWeek = () => Math.floor((Date.now() - WEEK_ANCHOR) / WEEK_MS);

export type LeaderboardLadderTier = { id: string; name: string; color: string };

export type LeaderboardData = {
  seasonCoins: number;
  seasonIndex: number;
  pathId: string;
  pathTitle: string;
  league: LeaderboardLeague;
  // Every league, and the index of the learner's own.
  ladder: LeaderboardLadderTier[];
  leagueIndex: number;
  // This season's cohort, ranked.
  standings: LeaderboardEntry[];
  // Lifetime standings, behind Pro.
  allTime: LeaderboardEntry[];
  seen: Record<string, boolean>;
  h2hRivalId: string;
  h2hLocked: boolean;
  h2hTimeLeft: string;
};

export async function getLeaderboard(now: number): Promise<LeaderboardData | null> {
  const profile = getMockProfile();
  if (!profile) return null;

  const progress = getMockProgress();
  const db = readDb();
  const path = getPath(profile.pathId);
  const leagueIndex = 0;
  const league = getLeague(leagueIndex);
  const seasonIndex = getSeasonIndex(now);
  const role = `${path.title} path`;
  const rivalLocked = db.h2hRivalWeek === currentWeek();
  const weekEndsAt = WEEK_ANCHOR + (Math.floor((now - WEEK_ANCHOR) / WEEK_MS) + 1) * WEEK_MS;
  const hoursLeft = Math.max(0, Math.floor((weekEndsAt - now) / 3_600_000));

  return {
    seasonCoins: progress.seasonCoins,
    seasonIndex,
    pathId: profile.pathId,
    pathTitle: path.title,
    league: {
      name: league.name,
      color: league.color,
      promoteCount: getPromoteCount(league),
      demoteCount: getDemoteCount(league),
    },
    ladder: LEAGUES.map(({ id, name, color }) => ({ id, name, color })),
    leagueIndex,
    standings: getStandings(seasonIndex, leagueIndex, progress.seasonCoins, now, role),
    allTime: getAllTimeStandings(progress.xp, role),
    seen: db.seenPageIntroductions ?? {},
    h2hRivalId: rivalLocked ? (db.h2hRivalId ?? DEFAULT_RIVAL_ID) : DEFAULT_RIVAL_ID,
    h2hLocked: rivalLocked,
    h2hTimeLeft: `${Math.floor(hoursLeft / 24)}d ${hoursLeft % 24}h left`,
  };
}

export async function getCompetitorProfile(rivalId: string, seasonIndex: number): Promise<RivalProfile> {
  return getRivalProfile(rivalId, seasonIndex);
}

export function markLeaderboardIntroSeen(id: string) {
  const db = readDb();
  writeDb({ ...db, seenPageIntroductions: { ...db.seenPageIntroductions, [id]: true } });
}

export function saveH2hRival(id: string) {
  writeDb({ ...readDb(), h2hRivalId: id, h2hRivalWeek: currentWeek() });
}
