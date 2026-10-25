"use client";

import { animate } from "motion";
import { useLayoutEffect, type RefObject } from "react";
import { usePrefersReducedMotion } from "~/hooks/use-prefers-reduced-motion";
import { BUILD_IN, CASCADE } from "../lib/motion-presets";

type BuildMode = "pop" | "scale" | "bounce" | "cascade";

const KEYFRAMES = {
  pop: { opacity: [0, 1], y: [BUILD_IN.pop.y, 0], scale: [BUILD_IN.pop.scale, 1] },
  scale: { opacity: [0, 1], scale: [BUILD_IN.scale.scale, 1] },
  bounce: { opacity: [0, 1], scale: [BUILD_IN.bounce.scale, 1] },
  cascade: { opacity: [0, 1], y: [BUILD_IN.cascade.y, 0] },
} as const;

const ANIMATED_PROPERTIES = ["opacity", "transform", "translate", "scale"];

// Builds in every `[data-build]` element inside `rootRef`. In `cascade` mode
// they arrive in DOM order unless `data-build-order` says otherwise, and items
// past `CASCADE.maxIndividual` land together so a long list doesn't keep the
// learner waiting. Re-runs when `triggerKey` changes; does nothing under
// reduced motion.
export function useBuildIn(
  rootRef: RefObject<HTMLElement | null>,
  triggerKey: string,
  { delay = 0, mode = "pop" }: { delay?: number; mode?: BuildMode } = {},
) {
  const reducedMotion = usePrefersReducedMotion();

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || reducedMotion) return;

    const targets = Array.from(root.querySelectorAll<HTMLElement>("[data-build]")).sort(
      (a, b) => Number(a.dataset.buildOrder ?? 0) - Number(b.dataset.buildOrder ?? 0),
    );
    if (targets.length === 0) return;

    const { duration, ease } = BUILD_IN[mode];
    const controls = animate(targets, KEYFRAMES[mode], {
      duration,
      ease,
      delay:
        mode === "cascade"
          ? (index: number) => delay + Math.min(index, CASCADE.maxIndividual) * CASCADE.stagger
          : delay,
    });

    // Hand styling back to the classes once built in, so hover and
    // press states on these elements are not pinned by inline styles.
    controls.then(() => {
      for (const target of targets) {
        for (const property of ANIMATED_PROPERTIES) target.style.removeProperty(property);
      }
    });

    return () => controls.stop();
  }, [rootRef, triggerKey, delay, mode, reducedMotion]);
}
