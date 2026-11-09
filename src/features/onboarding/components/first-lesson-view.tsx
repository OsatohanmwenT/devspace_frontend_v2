"use client";

import { MotionConfig } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { getPaths } from "~/features/paths";
import { useLoad } from "~/hooks/use-load";
import { FirstLessonWelcome } from "./first-lesson-welcome";

// Where onboarding lands: the learner's new path and the lesson it starts
// with. A visitor with no profile has nothing to start, so they go back to
// onboarding.
export function FirstLessonView() {
  const router = useRouter();
  const paths = useLoad(getPaths);
  const data = paths.status === "ready" ? paths.data : null;
  const needsOnboarding = paths.status === "ready" && !paths.data;

  useEffect(() => {
    if (needsOnboarding) router.replace("/onboarding");
  }, [needsOnboarding, router]);

  if (!data) return null;

  const lesson = data.progress.currentLesson;

  return (
    <MotionConfig reducedMotion="user">
      <FirstLessonWelcome
        pathTitle={data.path.title}
        lessonTitle={lesson?.title ?? "your first lesson"}
        onBegin={() => router.push(lesson ? `/lesson/${lesson.id}` : "/home")}
      />
    </MotionConfig>
  );
}
