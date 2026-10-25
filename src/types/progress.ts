// What the app shell shows in the header: the learner's XP and streak.
export type ProgressSummary = {
  xp: number;
  dailyXp: number;
  xpGoal: number;
  streakDays: number;
  // A streak that is alive but has not been extended yet today.
  streakAtRisk: boolean;
  longestStreak: number;
  lastActiveDate: string | null;
  streakActivityDates: string[];
  streakRestoreCredits: number;
  earnedStreakMilestones: number[];
  lastStreakProtection: "shield" | "restore" | null;
};
