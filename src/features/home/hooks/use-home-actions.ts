"use client";

import { useRouter } from "next/navigation";
import type { HomeData } from "~/types/home";

// Where each Home action leads. Routes for pages that are not built yet simply
// do not resolve until their phase.
export function useHomeActions(data: HomeData) {
  const router = useRouter();
  const course = data.courses[0];

  const openPaths = () => router.push("/paths");

  return {
    // A path with no lessons left sends the learner to pick the next one.
    continueLesson: () =>
      course?.nextLessonId ? router.push(`/lesson/${course.nextLessonId}`) : openPaths(),
    openPaths,
    openLeaderboard: () => router.push("/leaderboard"),
    openProfile: () => router.push("/profile"),
    startPractice: () => router.push("/practice"),
  };
}
