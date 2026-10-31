"use client";

import { animate } from "motion";
import { useEffect, useState } from "react";
import { usePrefersReducedMotion } from "~/hooks/use-prefers-reduced-motion";

type Options = { from?: number; delay?: number; duration?: number };

// Counts from `from` up to `target`, so a score or reward ticks into place
// rather than just appearing. Reduced motion shows the target straight away.
export function useCountUp(target: number, { from = 0, delay = 0, duration = 0.6 }: Options = {}) {
  const reducedMotion = usePrefersReducedMotion();
  const [shown, setShown] = useState(from);

  useEffect(() => {
    if (reducedMotion) return;
    const controls = animate(from, target, {
      duration,
      delay,
      ease: "easeOut",
      onUpdate: (value) => setShown(Math.round(value)),
    });
    return () => controls.stop();
  }, [target, from, delay, duration, reducedMotion]);

  return reducedMotion ? target : shown;
}
