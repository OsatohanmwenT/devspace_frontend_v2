export type LeaderboardEntry = {
  id: string;
  name: string;
  role: string;
  tag: "PRO" | null;
  score: number;
  rank: number;
  isCurrentUser: boolean;
  // Places climbed since yesterday; null when there is no yesterday to compare to.
  delta: number | null;
};

export type LeaderboardLeague = {
  name: string;
  color: string;
  promoteCount: number;
  demoteCount: number;
};

// A rival as the competitor drawer shows them.
export type RivalProfile = {
  streakDays: number;
  conceptsMastered: number;
  reinforcementChecks: number;
  projectMilestones: number;
  recentProof: string;
};
