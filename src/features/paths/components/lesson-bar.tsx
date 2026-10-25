"use client";

import { motion, useReducedMotion } from "motion/react";
import { Button } from "~/components/ui/button";
import type { DerivedLesson } from "../api/paths-api";

type BarState = "open" | "done" | "closed";

const LABELS: Record<BarState, string> = { open: "Current lesson", done: "Completed", closed: "Up next" };

const LABEL_COLORS: Record<BarState, string> = {
  open: "text-[#2563eb] dark:text-[#88bdf2]",
  done: "text-[#065f6b] dark:text-[#04adc0]",
  closed: "text-ink-soft dark:text-night-soft",
};

// Open: a bright rim sweeps around the card, as if the current tile is live and
// tappable. Done: a calm teal edge. Closed: flat, dimmed and dashed, so it
// reads as "not yet".
const SURFACES: Record<BarState, string> = {
  open: "border-transparent bg-white shadow-[0_0_22px_-2px_rgb(65_105_225/0.65),0_0_64px_-6px_rgb(65_105_225/0.55)] dark:bg-night-card",
  done: "border-[rgb(4_173_192/0.5)] bg-white shadow-[0_0_22px_-4px_rgb(4_173_192/0.35)] dark:bg-night-card",
  closed:
    "border-dashed border-[#d4d4d0] bg-[#f6f6f3] shadow-[0_0_20px_-4px_rgb(20_20_30/0.12)] dark:border-[#5a5a60] dark:bg-[#19191b] dark:shadow-[0_0_20px_-4px_rgb(154_154_168/0.3),0_0_48px_-10px_rgb(154_154_168/0.22)]",
};

type LessonBarProps = {
  lesson: DerivedLesson;
  started: boolean;
  flying: boolean;
  onStart: () => void;
  onDetails: () => void;
  onListen?: () => void;
};

export function LessonBar({ lesson, started, flying, onStart, onDetails, onListen }: LessonBarProps) {
  const reducedMotion = useReducedMotion();
  const canStart = lesson.derivedState === "current";
  const state: BarState = canStart ? "open" : lesson.derivedState === "completed" ? "done" : "closed";

  return (
    <motion.aside
      aria-label="Selected lesson"
      data-lesson-bar
      className={`sticky bottom-[18px] z-5 isolate mx-4 flex min-h-[84px] items-center justify-between gap-[18px] overflow-hidden rounded-[20px] border-[1.5px] px-[18px] py-4 max-tab:mx-0 max-tab:min-h-0 max-tab:gap-3 max-tab:rounded-2xl max-tab:p-3 max-tab:pl-4 max-tab:shadow-[0_18px_40px_-20px_rgba(0,0,0,.7)] ${SURFACES[state]}`}
    >
      {state === "open" && (
        <>
          <motion.span
            aria-hidden="true"
            className="pointer-events-none absolute -inset-[300%] z-0 bg-[conic-gradient(from_0deg,rgba(65,105,225,0.12)_0%,#4169e1_18%,#a9c1ff_28%,rgba(65,105,225,0.12)_45%,rgba(65,105,225,0.12)_100%)]"
            animate={reducedMotion ? undefined : { rotate: 360 }}
            transition={{ duration: 3.4, ease: "linear", repeat: Infinity }}
          />
          <span aria-hidden="true" className="pointer-events-none absolute inset-[1.5px] z-0 rounded-[18px] bg-white dark:bg-night-card" />
        </>
      )}
      <div className="relative z-1 min-w-0 max-tab:flex-1">
        <span className={`text-[10px] font-bold tracking-[.08em] uppercase ${LABEL_COLORS[state]}`}>{LABELS[state]}</span>
        <h2 className={`mt-[5px] truncate text-lg font-medium text-neutral-800 max-tab:mt-0.5 max-tab:text-[15px] dark:text-night-ink ${state === "closed" ? "opacity-75" : ""}`}>
          {lesson.title}
        </h2>
        {state === "closed" && <p className="mt-1.5 text-xs text-ink-soft max-tab:mt-0.5 dark:text-night-soft">Opens after your current lesson</p>}
      </div>

      <div className="relative z-1 flex flex-none items-center gap-3.5 max-tab:gap-2">
      {canStart && (
        <Button className="min-h-11 px-7 whitespace-nowrap max-tab:px-5" disabled={flying} onClick={onStart}>
          {started ? (
            "Continue"
          ) : (
            <>
              <span className="max-tab:hidden">Start lesson</span>
              <span className="hidden max-tab:inline">Start</span>
            </>
          )}
        </Button>
      )}
      {!canStart && lesson.derivedState === "available" && (
        <Button variant="neutral" className="min-h-11 px-5 whitespace-nowrap" onClick={onDetails}>
          Lesson details
        </Button>
      )}
      {onListen && (
        <button
          type="button"
          onClick={onListen}
          aria-label={`Listen to ${lesson.title}`}
          className="focus-ring grid size-11 flex-none place-items-center rounded-full border border-[#d4d4d4] text-ink-soft transition-colors hover:border-[#6699ec] hover:text-ink dark:border-night-line dark:text-night-soft dark:hover:text-night-ink"
        >
          <svg className="size-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M4 13v-1a8 8 0 0 1 16 0v1M4 13h2a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3a2 2 0 0 1 1-2Zm16 0h-2a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-1-2Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
      </div>
    </motion.aside>
  );
}
