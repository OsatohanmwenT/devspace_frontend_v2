"use client";

import { motion } from "motion/react";

// Both icons draw their outline in, then fade the fill on. Once drawn, a small
// breathing pulse repeats, spaced out so it reads as "alive" rather than
// distracting in a chip that is always on screen.
const DRAW = { pathLength: { duration: 0.55, ease: "easeInOut" }, fillOpacity: { duration: 0.3, delay: 0.4 } } as const;
const PULSE = { scale: [1, 1.14, 1] };
const PULSE_TIMING = { duration: 1.3, delay: 0.9, repeat: Infinity, repeatDelay: 4.5, ease: "easeInOut" } as const;

function DrawnIcon({ className, path }: { className?: string; path: string }) {
  return (
    <motion.svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      animate={PULSE}
      transition={PULSE_TIMING}
    >
      <motion.path
        d={path}
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        initial={{ pathLength: 0, fillOpacity: 0 }}
        animate={{ pathLength: 1, fillOpacity: 1 }}
        transition={DRAW}
      />
    </motion.svg>
  );
}

export const AnimatedBoltIcon = ({ className }: { className?: string }) => (
  <DrawnIcon className={className} path="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />
);

export const AnimatedGemIcon = ({ className }: { className?: string }) => (
  <DrawnIcon className={className} path="M6 3h12l3 5-9 13L3 8l3-5Z" />
);
