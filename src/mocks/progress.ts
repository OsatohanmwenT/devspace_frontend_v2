import type { ProgressSummary } from "~/types/progress";
import type { Profile } from "~/types/profile";
import { STREAK_MILESTONES } from "~/config/streak-milestones";
import { readDb, writeDb } from "./mock-db";
import { getPath } from "./paths/get-path";

type Completed = Record<string, { completedAt: string }>;

// The mock learner's saved progress. A real backend owns this and decides
// every award; nothing here is app logic.
export type MockProgress = {
  xp: number;
  dailyXp: number;
  dailyXpDate: string | null;
  seasonCoins: number;
  streakDays: number;
  lastActiveDate: string | null;
  longestStreak: number;
  earnedStreakMilestones: number[];
  streakRestoreCredits: number;
  streakActivityDates: string[];
  lastStreakProtection: "shield" | "restore" | null;
  completedLessons: Completed;
  completedSessions: Completed;
};

const defaultProgress: MockProgress = {
  xp: 0,
  dailyXp: 0,
  dailyXpDate: null,
  seasonCoins: 0,
  streakDays: 0,
  lastActiveDate: null,
  longestStreak: 0,
  earnedStreakMilestones: [],
  streakRestoreCredits: 0,
  streakActivityDates: [],
  lastStreakProtection: null,
  completedLessons: {},
  completedSessions: {},
};

const DAY_MS = 24 * 60 * 60 * 1000;
const startOfDay = (dateString: string) => new Date(new Date(dateString).toDateString()).getTime();

// A streak survives today and yesterday; any longer gap ends it.
function resolveStreak(streakDays: number, lastActiveDate: string | null, today: string) {
  if (!lastActiveDate || streakDays === 0 || lastActiveDate === today) return streakDays;
  const daysSince = Math.round((startOfDay(today) - startOfDay(lastActiveDate)) / DAY_MS);
  return daysSince <= 1 ? streakDays : 0;
}

// Minutes a day at roughly one lesson per five minutes.
export const dailyXpGoal = (minutes = 10) => Math.max(25, Math.round((minutes / 5) * 25));

export function getMockProgress(today = new Date().toDateString()): MockProgress {
  const db = readDb();
  // Populate the frontend preview until lesson awards are connected. Saved
  // progress takes precedence; the sample is never written into the database.
  const completed = db.profile
    ? getPath(db.profile.pathId).cards.flatMap((region) => region.lessons).filter((lesson) => lesson.state === "completed").slice(-1)
    : [];
  const sample: Partial<MockProgress> = {
    xp: 25,
    dailyXp: 25,
    dailyXpDate: today,
    seasonCoins: 5,
    streakDays: 1,
    lastActiveDate: today,
    longestStreak: 1,
    earnedStreakMilestones: [],
    streakActivityDates: [today],
    completedLessons: Object.fromEntries(completed.map((lesson) => [lesson.id, { completedAt: today }])),
  };
  const stored = { ...defaultProgress, ...(db.progress ?? (db.profile ? sample : {})) };
  return {
    ...stored,
    streakDays: resolveStreak(stored.streakDays, stored.lastActiveDate, today),
    dailyXp: stored.dailyXpDate === today ? stored.dailyXp : 0,
  };
}

export function getMockProgressSummary(
  profile: Profile | null,
  today = new Date().toDateString(),
): ProgressSummary {
  const progress = getMockProgress(today);
  return {
    xp: progress.xp,
    dailyXp: progress.dailyXp,
    xpGoal: dailyXpGoal(profile?.dailyMinutes),
    streakDays: progress.streakDays,
    streakAtRisk: progress.streakDays > 0 && progress.lastActiveDate !== today,
    longestStreak: progress.longestStreak,
    lastActiveDate: progress.lastActiveDate,
    streakActivityDates: progress.streakActivityDates,
    streakRestoreCredits: progress.streakRestoreCredits,
    earnedStreakMilestones: progress.earnedStreakMilestones,
    lastStreakProtection: progress.lastStreakProtection,
  };
}

// What a first, unassisted lesson completion pays. The backend decides awards;
// these are placeholders for its rules.
const LESSON_XP = 25;
const LESSON_COINS = 5;
const STREAK_DATES_KEPT = 30;

export type LessonCompletion = { xpEarned: number; before: MockProgress; after: MockProgress };

// Records a finished lesson: a first completion earns XP and season coins,
// a replay earns neither, and either keeps the day's streak going.
export function recordMockLessonCompletion(lessonId: string, today = new Date().toDateString()): LessonCompletion {
  const before = getMockProgress(today);
  const firstCompletion = !before.completedLessons[lessonId];
  const xpEarned = firstCompletion ? LESSON_XP : 0;
  const isNewDay = before.lastActiveDate !== today;
  const streakDays = isNewDay ? before.streakDays + 1 : before.streakDays;
  const reached = STREAK_MILESTONES.filter((milestone) => milestone.days <= streakDays && !before.earnedStreakMilestones.includes(milestone.days));

  const after: MockProgress = {
    ...before,
    xp: before.xp + xpEarned,
    dailyXp: before.dailyXp + xpEarned,
    dailyXpDate: today,
    seasonCoins: before.seasonCoins + (firstCompletion ? LESSON_COINS : 0),
    streakDays,
    lastActiveDate: today,
    longestStreak: Math.max(before.longestStreak, streakDays),
    earnedStreakMilestones: [...before.earnedStreakMilestones, ...reached.map((milestone) => milestone.days)],
    streakRestoreCredits: before.streakRestoreCredits + reached.reduce((sum, milestone) => sum + milestone.restores, 0),
    streakActivityDates: before.streakActivityDates.includes(today) ? before.streakActivityDates : [...before.streakActivityDates, today].slice(-STREAK_DATES_KEPT),
    completedLessons: { ...before.completedLessons, [lessonId]: { completedAt: today } },
  };

  writeDb({ ...readDb(), progress: after });
  return { xpEarned, before, after };
}
