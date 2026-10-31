import type { Quest } from "~/types/home";
import type { MockProgress } from "./progress";

const doneOn = (record: MockProgress["completedLessons"], today: string) =>
  Object.values(record).some((entry) => entry.completedAt === today);

// Today's three quests, derived from what the learner has done today.
export function buildQuests(progress: MockProgress, xpGoal: number, today: string): Quest[] {
  return [
    { id: "xp" as const, label: `Earn ${xpGoal} XP`, current: Math.min(progress.dailyXp, xpGoal), target: xpGoal },
    { id: "lesson" as const, label: "Finish a lesson", current: doneOn(progress.completedLessons, today) ? 1 : 0, target: 1 },
    { id: "practice" as const, label: "Warm up or practice", current: doneOn(progress.completedSessions, today) ? 1 : 0, target: 1 },
  ].map((quest) => ({ ...quest, done: quest.current >= quest.target }));
}
