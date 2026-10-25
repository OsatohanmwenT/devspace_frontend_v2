import { COHORT_SIZE, getLeague } from "~/config/leagues";
import type { LeaderboardEntry, RivalProfile } from "~/types/leaderboard";
import { hashString, seededRandom } from "~/lib/rng";
import { rivals, type Rival } from "./rivals";
import { getSeasonProgress, SEASON_LENGTH_DAYS } from "./season";

// Stands in for the backend that owns standings: every rival's total is a pure
// function of who they are, which season it is and how far through it we are,
// so no rival state is ever stored. Deleted along with mocks/ when the real
// backend lands.

export const USER_ID = "you";
const DAY_FRACTION = 1 / SEASON_LENGTH_DAYS;

type Scored = Omit<LeaderboardEntry, "rank" | "delta">;

// Each season draws a fresh field, but always the same one for a given
// (season, league) pair: the cohort is never re-rolled on reload.
function buildCohort(seasonIndex: number, leagueIndex: number) {
  const random = seededRandom("cohort", seasonIndex, leagueIndex);
  const pool = [...rivals];
  for (let index = pool.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    [pool[index], pool[swap]] = [pool[swap], pool[index]];
  }
  return pool.slice(0, COHORT_SIZE - 1);
}

// The per-day series is the source of truth and the total is its sum. Days that
// have not started are 0; the current day accrues proportionally.
export function rivalDailyCoins(rival: Rival, seasonIndex: number, leagueIndex: number, progress: number) {
  const random = seededRandom("coins", rival.id, seasonIndex, leagueIndex);
  const paceScale = getLeague(leagueIndex).pace;
  const days: number[] = [];

  for (let day = 0; day < SEASON_LENGTH_DAYS; day += 1) {
    const isActiveDay = random() < rival.consistency;
    const earned = isActiveDay ? Math.round(rival.pace * paceScale * (0.55 + random() * 0.9)) : 0;
    const dayStart = day * DAY_FRACTION;
    if (progress >= dayStart + DAY_FRACTION) days.push(earned);
    else if (progress > dayStart) days.push(Math.round(earned * ((progress - dayStart) / DAY_FRACTION)));
    else days.push(0);
  }
  return days;
}

function rivalSeasonCoins(rival: Rival, seasonIndex: number, leagueIndex: number, progress: number) {
  return rivalDailyCoins(rival, seasonIndex, leagueIndex, progress).reduce((total, coins) => total + coins, 0);
}

// Ties break on a stable hash rather than array order, so equal scores never
// make rows swap places between renders.
function rankEntries(entries: Scored[]) {
  return [...entries]
    .sort((a, b) => b.score - a.score || hashString(a.id) - hashString(b.id))
    .map((entry, index) => ({ ...entry, rank: index + 1 }));
}

function buildEntries(seasonIndex: number, leagueIndex: number, userCoins: number, progress: number, userRole: string): Scored[] {
  const entries: Scored[] = buildCohort(seasonIndex, leagueIndex).map((rival) => ({
    id: rival.id,
    name: rival.name,
    role: rival.role,
    tag: rival.tag,
    score: rivalSeasonCoins(rival, seasonIndex, leagueIndex, progress),
    isCurrentUser: false,
  }));
  entries.push({ id: USER_ID, name: "You", role: userRole, tag: null, score: userCoins, isCurrentUser: true });
  return entries;
}

export function getStandings(
  seasonIndex: number,
  leagueIndex: number,
  userCoins: number,
  timestamp: number,
  userRole: string,
): LeaderboardEntry[] {
  const progress = getSeasonProgress(timestamp);
  const current = rankEntries(buildEntries(seasonIndex, leagueIndex, userCoins, progress, userRole));

  // Movement is measured against where everyone stood a day ago. Within the
  // first day there is no yesterday, so it is null rather than 0: "not
  // measurable yet" is different from "has not moved".
  const dayAgo = progress - DAY_FRACTION;
  if (dayAgo <= 0) return current.map((entry) => ({ ...entry, delta: null }));

  const previous = new Map(
    rankEntries(buildEntries(seasonIndex, leagueIndex, userCoins, dayAgo, userRole)).map((entry) => [entry.id, entry.rank]),
  );
  return current.map((entry) => ({ ...entry, delta: (previous.get(entry.id) ?? entry.rank) - entry.rank }));
}

// Lifetime totals are invented once per rival and never move.
export function getAllTimeStandings(userXp: number, userRole: string): LeaderboardEntry[] {
  const entries: Scored[] = rivals.map((rival) => {
    const random = seededRandom("lifetime", rival.id);
    const seasonsActive = 1 + Math.floor(random() * 8);
    return {
      id: rival.id,
      name: rival.name,
      role: rival.role,
      tag: rival.tag,
      score: Math.round(rival.pace * rival.consistency * SEASON_LENGTH_DAYS * seasonsActive * (0.8 + random() * 0.4)),
      isCurrentUser: false,
    };
  });
  entries.push({ id: USER_ID, name: "You", role: userRole, tag: null, score: userXp, isCurrentUser: true });
  return rankEntries(entries).map((entry) => ({ ...entry, delta: 0 }));
}

const PROOF_LINES = [
  "Shipped a portfolio project this week",
  "Finished a checkpoint on the first attempt",
  "Posted a write-up of a recent build",
  "Cleared a reinforcement check after a rough first pass",
  "Started a new module ahead of schedule",
];

// The stats the competitor drawer shows, invented per (rival, season) so they
// are stable across reloads.
export function getRivalProfile(rivalId: string, seasonIndex: number): RivalProfile {
  const random = seededRandom("rival-profile", rivalId, seasonIndex);
  return {
    streakDays: 1 + Math.floor(random() * 45),
    conceptsMastered: 3 + Math.floor(random() * 40),
    reinforcementChecks: Math.floor(random() * 12),
    projectMilestones: Math.floor(random() * 6),
    recentProof: PROOF_LINES[Math.floor(random() * PROOF_LINES.length)],
  };
}
