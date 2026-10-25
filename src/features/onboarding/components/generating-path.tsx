"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useEffectEvent, useState } from "react";
import { DevyLottie } from "~/components/devy";
import { WORD } from "../lib/motion-presets";

const LINES = [
  "Mapping what you already know…",
  "Ordering the concepts…",
  "Finding where practice fits…",
  "Preparing your starting point…",
];

const LINE_INTERVAL_MS = 780;
const DURATION_MS = 3200;
const DOT_DELAYS_MS = [0, 120, 240];

export function GeneratingPath({ onDone }: { onDone: () => void }) {
  const [lineIndex, setLineIndex] = useState(0);
  const finish = useEffectEvent(onDone);

  useEffect(() => {
    const lineTimer = window.setInterval(() => {
      setLineIndex((current) => Math.min(current + 1, LINES.length - 1));
    }, LINE_INTERVAL_MS);
    const doneTimer = window.setTimeout(() => {
      window.clearInterval(lineTimer);
      finish();
    }, DURATION_MS);

    return () => {
      window.clearInterval(lineTimer);
      window.clearTimeout(doneTimer);
    };
  }, []);

  return (
    <div
      className="grid w-full max-w-[420px] justify-items-center gap-1 text-center"
      role="status"
      aria-live="polite"
    >
      <DevyLottie clip="thinking" className="h-[104px] w-[104px] motion-safe:animate-devy-breathe" />
      <h1 className="m-0 mt-4 font-display text-2xl font-medium">Building your route</h1>
      {/* Each status line rises in and the previous one lifts away. */}
      <div className="relative mt-3 min-h-[22px] w-full">
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={lineIndex}
            className="text-muted m-0 text-[15px]"
            initial={{ opacity: 0, y: WORD.y }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -WORD.y }}
            transition={{ duration: 0.3, ease: [0.22, 0.61, 0.36, 1] }}
          >
            {LINES[lineIndex]}
          </motion.p>
        </AnimatePresence>
      </div>
      {/* The dots rise in a wave: each starts a beat after the last. The delay
          is inline because the animation utility sets the `animation`
          shorthand, which would reset a delay set by a class. */}
      <span className="mt-2 flex items-center gap-1.5 text-blue-600 dark:text-blue-400" aria-hidden="true">
        {DOT_DELAYS_MS.map((delay) => (
          <i
            key={delay}
            className="size-1.5 rounded-full bg-current motion-safe:animate-thinking-dot"
            style={{ animationDelay: `${delay}ms` }}
          />
        ))}
      </span>
    </div>
  );
}
