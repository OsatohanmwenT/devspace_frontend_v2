import { getMockLesson } from "~/mocks/lessons/get-lesson";
import { getMockProfile } from "~/mocks/profile";
import { dailyXpGoal, recordMockLessonCompletion } from "~/mocks/progress";
import { buildQuests } from "~/mocks/quests";
import type { Lesson, LessonReward } from "~/types/lesson";

// Mock-backed for now. When the backend exists, only these bodies change.

// Resolves to null for a lesson that has not been written yet.
export async function getLesson(lessonId: string): Promise<Lesson | null> {
  return getMockLesson(lessonId);
}

// Records a finished lesson and returns what it paid. A first completion earns
// XP and season coins; a replay, or a run that leaned on Devy before trying
// ("assisted"), earns neither. Call once per finish.
export async function completeLesson(lessonId: string, assisted: boolean): Promise<LessonReward> {
  const today = new Date().toDateString();
  const { xpEarned, before, after } = recordMockLessonCompletion(lessonId, assisted, today);
  const xpGoal = dailyXpGoal(getMockProfile()?.dailyMinutes);
  const questsBefore = buildQuests(before, xpGoal, today);
  const questsAfter = buildQuests(after, xpGoal, today);

  return {
    xpEarned,
    streak: before.lastActiveDate === today ? null : { before: before.streakDays, after: after.streakDays, dates: after.streakActivityDates },
    quests: questsAfter.some((quest, index) => quest.current > questsBefore[index].current) ? { before: questsBefore, after: questsAfter } : null,
  };
}
