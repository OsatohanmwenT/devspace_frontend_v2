"use client";

import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";
import { SWAP } from "../lib/motion-presets";

// Step swap. The outgoing screen dims and shrinks in place, then the incoming
// screen mounts and runs its own build-in. `direction` flips the incoming
// scale so going back feels like stepping out rather than pressing further in.
//
// The exiting screen keeps the props it last rendered with, so its layout
// classes stay put until it has left. Reduced motion is handled by the
// surrounding MotionConfig.
export function StepFrame({
  stepKey,
  direction = 1,
  className = "",
  onExitComplete,
  children,
}: {
  stepKey: string;
  direction?: 1 | -1;
  className?: string;
  onExitComplete?: () => void;
  children: ReactNode;
}) {
  const edgeScale = direction < 0 ? SWAP.scaleBackIn : SWAP.scaleOut;

  return (
    <AnimatePresence mode="wait" initial={false} onExitComplete={onExitComplete}>
      <motion.div
        key={stepKey}
        className={className}
        initial={{ opacity: 0, scale: edgeScale }}
        animate={{ opacity: 1, scale: 1, transition: { duration: SWAP.in, ease: SWAP.ease } }}
        exit={{
          opacity: 0.08,
          scale: edgeScale,
          transition: { duration: SWAP.out, ease: "easeIn" },
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
