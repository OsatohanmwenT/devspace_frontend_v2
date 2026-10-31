"use client";

import { useReducedMotion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useToast } from "~/providers/toast-provider";
import { startPath } from "../api/paths-api";
import type { SpotlightOrigin } from "../components/launch-spotlight";

// Devy takes off, then the spotlight finishes filling the screen before the
// roadmap gives way to the lesson.
const FLY_OPEN_MS = 2400;

// Starting a lesson is the one way to choose a path: if it is not the active
// path it becomes it, and a toast offers an Undo in case the learner was only
// trying it out.
export function useLessonLaunch(pathId: string, pathTitle: string, initialActivePathId: string, currentLessonId: string | null) {
  const router = useRouter();
  const toast = useToast();
  const reducedMotion = useReducedMotion();
  const [activePathId, setActivePathId] = useState(initialActivePathId);
  const [startedIds, setStartedIds] = useState<string[]>([]);
  const [flying, setFlying] = useState(false);
  const [origin, setOrigin] = useState<SpotlightOrigin | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const launching = useRef(false);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  // The spotlight stays up until the lesson's own loader takes over.
  const open = (lessonId: string) => router.push(`/lesson/${lessonId}`);

  const start = async (lessonId: string) => {
    if (launching.current) return;
    launching.current = true;
    setStartedIds((ids) => (ids.includes(lessonId) ? ids : [...ids, lessonId]));

    if (pathId !== activePathId) {
      const previous = await startPath(pathId);
      setActivePathId(pathId);
      toast(
        `Now learning ${pathTitle}`,
        previous
          ? {
              label: "Undo",
              onClick: () => {
                startPath(previous);
                setActivePathId(previous);
              },
            }
          : undefined,
      );
    }

    const tile = document.querySelector("[data-current-lesson]")?.getBoundingClientRect();
    const mascot = document.querySelector("[data-devy-start]")?.getBoundingClientRect();
    const onScreen = tile && tile.bottom > 0 && tile.top < window.innerHeight;
    if (reducedMotion || !onScreen || !mascot || lessonId !== currentLessonId) return open(lessonId);

    setOrigin({ x: mascot.left + mascot.width / 2, y: mascot.top + mascot.height / 2 });
    setFlying(true);
    timer.current = window.setTimeout(() => open(lessonId), FLY_OPEN_MS);
  };

  return { activePathId, startedIds, flying, origin, start };
}
