"use client";

import { animate } from "motion";
import { useEffect, useState } from "react";
import { usePrefersReducedMotion } from "~/hooks/use-prefers-reduced-motion";

// Counts from 0 up to `target`, so a score ticks up rather than just appearing.
export function useCountUp(target: number, duration = 0.6) {
  const reducedMotion = usePrefersReducedMotion();
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (reducedMotion) return;
    const controls = animate(0, target, {
      duration,
      ease: "easeOut",
      onUpdate: (value) => setShown(Math.round(value)),
    });
    return () => controls.stop();
  }, [target, duration, reducedMotion]);

  return reducedMotion ? target : shown;
}
