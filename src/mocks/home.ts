import { getRoleLabelByValue } from "~/features/onboarding";
import { STREAK_MILESTONES } from "~/config/streak-milestones";
import type { Badge, HomeCourse, HomeData, HomeUpdate } from "~/types/home";
import type { Profile } from "~/types/profile";
import { getLeague, getPromoteCount } from "~/config/leagues";
import { getStandings } from "./leaderboard/league-sim";
import { getSeasonIndex } from "./leaderboard/season";
import { formatSeasonTimeLeft } from "./leagues";
import { derivePathProgress, type DerivedPath } from "./paths/derive-path-progress";
import { getPath } from "./paths/get-path";
import { dailyXpGoal, getMockProgress, type MockProgress } from "./progress";
import { buildQuests } from "./quests";

const doneOn = (record: MockProgress["completedLessons"], today: string) =>
  Object.values(record).some((entry) => entry.completedAt === today);

function buildCourse(profile: Profile, derived: DerivedPath): HomeCourse {
  const path = getPath(profile.pathId);
  const region = derived.currentRegion;
  const lessons = region?.lessons ?? [];
  const index = lessons.findIndex((lesson) => lesson.id === derived.currentLesson?.id);

  return {
    id: path.id,
    title: path.title,
    isPrimary: true,
    regionTitle: region?.title ?? null,
    regionImage: region?.image ?? path.emblem ?? null,
    emblem: path.emblem ?? null,
    percent: derived.percent,
    regionPercent: region?.percent ?? 0,
    regionLessonsCompleted: region?.lessonsCompleted ?? 0,
    regionLessonsTotal: region?.lessonsTotal ?? 0,
    nextLessonId: derived.currentLesson?.id ?? null,
    nextLessonTitle: derived.currentLesson?.title ?? null,
    upNextTitle: index === -1 ? null : (lessons[index + 1]?.title ?? null),
  };
}

function buildBadges(progress: MockProgress): Badge[] {
  const earned = STREAK_MILESTONES.filter((tier) => progress.earnedStreakMilestones.includes(tier.days));
  const unearned = STREAK_MILESTONES.filter((tier) => !progress.earnedStreakMilestones.includes(tier.days));
  // Two slots: the latest earned, then the next to aim for.
  const shownEarned = earned.slice(-(unearned.length ? 1 : 2));
  return [
    ...shownEarned.map((tier) => ({ ...tier, state: "earned" as const, progress: 1 })),
    ...unearned.slice(0, 2 - shownEarned.length).map((tier, index) => ({
      ...tier,
      state: index === 0 ? ("next" as const) : ("locked" as const),
      progress: Math.min(1, progress.streakDays / tier.days),
    })),
  ];
}

function buildUpdate(
  pathTitle: string,
  derived: DerivedPath,
  streakDays: number,
  streakAtRisk: boolean,
  seasonCoins: number,
): HomeUpdate {
  if (derived.isComplete) {
    return {
      kind: "path-complete",
      title: `You've finished ${pathTitle}`,
      body: "Explore Paths to pick what's next.",
      cta: "See what’s next",
    };
  }
  if (streakAtRisk) {
    return {
      kind: "streak-risk",
      title: `${streakDays}-day streak`,
      body: "One more lesson today keeps it alive.",
      cta: "Keep it going",
    };
  }
  if (derived.nextCheckpoint && derived.nextCheckpoint.lessonsUntil <= 2) {
    return {
      kind: "checkpoint",
      title: "Checkpoint coming up",
      body: derived.nextCheckpoint.title,
      cta: "Continue lesson",
    };
  }
  if (streakDays > 0) {
    return {
      kind: "streak",
      title: `${streakDays}-day streak`,
      body: "Keep it going with today’s lesson.",
      cta: "Continue lesson",
    };
  }
  return {
    kind: "welcome",
    title: "Welcome back",
    body: derived.currentLesson
      ? `Next up on ${pathTitle} is ${derived.currentLesson.title}. ${seasonCoins > 0 ? "You’re already on the board this season — keep the streak going." : "A single lesson is enough to join this season’s league."}`
      : `You’re set up on ${pathTitle}. Open Paths to pick where to go next.`,
    cta: "Explore Paths",
  };
}

export function buildMockHome(profile: Profile, today = new Date().toDateString()): HomeData {
  const progress = getMockProgress(today);
  const path = getPath(profile.pathId);
  const derived = derivePathProgress(path, progress.completedLessons);
  const xpGoal = dailyXpGoal(profile.dailyMinutes);
  const streakAtRisk = progress.streakDays > 0 && progress.lastActiveDate !== today;
  const completedLessonsCount = Object.keys(progress.completedLessons).length;
  const lessonDoneToday = doneOn(progress.completedLessons, today);
  const practiceDoneToday = doneOn(progress.completedSessions, today);

  const quests = buildQuests(progress, xpGoal, today);

  const timestamp = Date.now();
  const league = getLeague(0);
  const standings = getStandings(getSeasonIndex(timestamp), 0, progress.seasonCoins, timestamp, `${path.title} path`);
  const userIndex = standings.findIndex((entry) => entry.isCurrentUser);
  const promoteCount = getPromoteCount(league);
  const inPromotionZone = userIndex < promoteCount;

  return {
    learner: {
      name: "",
      headline: getRoleLabelByValue(profile.role),
      avatarUrl: "avatars/you.svg",
    },
    stats: {
      xp: progress.xp,
      dailyXp: progress.dailyXp,
      xpGoal,
      streakDays: progress.streakDays,
      streakAtRisk,
      longestStreak: progress.longestStreak,
      lastActiveDate: progress.lastActiveDate,
      streakActivityDates: progress.streakActivityDates,
      streakRestoreCredits: progress.streakRestoreCredits,
      earnedStreakMilestones: progress.earnedStreakMilestones,
      lastStreakProtection: progress.lastStreakProtection,
      completedLessonsCount,
    },
    quests,
    badges: buildBadges(progress),
    courses: [buildCourse(profile, derived)],
    league: {
      name: league.name,
      color: league.color,
      unlocked: progress.seasonCoins > 0,
      rank: standings[userIndex].rank,
      seasonCoins: progress.seasonCoins,
      promoteCount,
      inPromotionZone,
      coinsToPromotion: inPromotionZone
        ? 0
        : standings[promoteCount - 1].score - standings[userIndex].score,
      seasonTimeLeft: formatSeasonTimeLeft(),
      neighbors: standings.slice(Math.max(0, userIndex - 1), userIndex + 2),
      neighborsWide: standings.slice(Math.max(0, userIndex - 2), userIndex + 2),
      rankDelta: null,
    },
    update: buildUpdate(path.title, derived, progress.streakDays, streakAtRisk, progress.seasonCoins),
    lessonDoneToday,
    practiceDoneToday,
  };
}
