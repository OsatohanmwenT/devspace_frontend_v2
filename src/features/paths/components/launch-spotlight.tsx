"use client";

import { motion } from "motion/react";
import type { CSSProperties } from "react";

export type SpotlightOrigin = { x: number; y: number };

// Devy's take-off fills the screen from the launchpad outward, into the same
// blue scene the lesson loader uses.
export function LaunchSpotlight({ origin }: { origin: SpotlightOrigin }) {
  const centre = `${origin.x}px ${origin.y}px`;
  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[100] bg-[linear-gradient(to_bottom,#fafaf8_0%,#fafaf8_42%,#e4effd_100%)] dark:bg-[linear-gradient(to_bottom,#121214_0%,#121214_42%,#1d2a43_100%)]"
      style={{ "--spot-x": `${origin.x}px`, "--spot-y": `${origin.y}px` } as CSSProperties}
      initial={{ clipPath: `circle(0px at ${centre})` }}
      animate={{ clipPath: `circle(150vmax at ${centre})` }}
      exit={{ opacity: 0 }}
      transition={{ clipPath: { duration: 1.3, delay: 1.1, ease: [0.22, 0.61, 0.36, 1] }, opacity: { duration: 0.25 } }}
    >
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(circle_at_var(--spot-x)_var(--spot-y),rgb(65_105_225/0.5),transparent_45%)]"
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 1.3, delay: 1.1, ease: "easeOut" }}
      />
    </motion.div>
  );
}
