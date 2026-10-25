"use client";

import { motion, useReducedMotion } from "motion/react";
import { DevyRive } from "~/components/devy";
import type { DerivedLesson } from "../api/paths-api";
import { LessonPedestalIcon } from "./lesson-pedestal-icon";

const STATE_LABELS = {
  completed: "Completed",
  current: "Current lesson",
  available: "Available",
  locked: "Locked",
} satisfies Record<DerivedLesson["derivedState"], string>;

// Lessons zig-zag down the route: left, right, centre.
const ALIGNMENT = ["justify-start", "justify-end", "justify-center"];

// The current tile is the one thing on the roadmap worth acting on next, so a
// soft halo breathes behind it and a spotlight from above lands on its platform.
function CurrentTileBeacon({ children }: { children: React.ReactNode }) {
  const reducedMotion = useReducedMotion();
  return (
    <span className="relative grid place-items-center">
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[30%] left-1/2 z-0 h-[132%] w-[122%] -translate-x-1/2 blur-[11px] [mask-image:linear-gradient(to_bottom,transparent_0%,black_62%)]"
        animate={reducedMotion ? undefined : { opacity: [0.88, 1, 0.88] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(96,124,235,0)_0%,rgba(96,124,235,0.15)_34%,rgba(96,124,235,0.105)_74%,rgba(96,124,235,0)_100%)] [clip-path:polygon(38%_0,62%_0,100%_100%,0_100%)] dark:bg-[linear-gradient(to_bottom,rgba(150,174,255,0)_0%,rgba(150,174,255,0.24)_34%,rgba(150,174,255,0.168)_74%,rgba(150,174,255,0)_100%)]" />
      </motion.span>
      {!reducedMotion && (
        <motion.span
          aria-hidden="true"
          className="absolute size-16 rounded-full bg-[#4169e1]/25 blur-md"
          animate={{ scale: [0.85, 1.2, 0.85], opacity: [0.3, 0.65, 0.3] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
      <span className="relative">{children}</span>
    </span>
  );
}

type LessonRowProps = {
  lesson: DerivedLesson;
  index: number;
  selected: boolean;
  // True while Devy is taking off from this tile.
  flying: boolean;
  onSelect: () => void;
  onStart: () => void;
};

export function LessonRow({ lesson, index, selected, flying, onSelect, onStart }: LessonRowProps) {
  const reducedMotion = useReducedMotion();
  const state = lesson.derivedState;
  const current = state === "current";
  const locked = state === "locked";
  const label = STATE_LABELS[state];
  const ariaLabel = `${lesson.title}, ${label}${lesson.checkpoint ? ", checkpoint" : ""}`;

  // The Rive state machine draws its own launchpad; the static pedestal stands
  // in under reduced motion because the Rive file starts on an empty frame.
  const icon =
    current && !reducedMotion ? (
      <DevyRive clip="complete-flow" flying={flying} className="h-[210px] w-[200px]" ariaLabel="" />
    ) : (
      <LessonPedestalIcon state={state} checkpoint={lesson.checkpoint} selected={selected} />
    );

  const text = (
    <span className={`grid min-w-0 gap-[5px] ${current ? "-ml-6" : ""}`}>
      <span className={`text-[10px] font-bold tracking-[.08em] uppercase ${current || selected ? "text-[#4169e1]" : "text-ink-soft dark:text-night-soft"}`}>
        {label}
      </span>
      <strong className="text-[15px] leading-[1.35] font-medium text-neutral-800 dark:text-night-ink">{lesson.title}</strong>
      {lesson.checkpoint && (
        <span className="text-[10px] font-bold tracking-[.08em] text-ink-soft uppercase dark:text-night-soft">Checkpoint</span>
      )}
    </span>
  );

  return (
    <div data-current-lesson={current || undefined} className={`relative z-1 flex min-h-[126px] w-full ${ALIGNMENT[index % 3]}`}>
      {current ? (
        <div className="flex min-h-[126px] w-[min(100%,278px)] items-center px-2">
          <button
            type="button"
            data-devy-start
            data-cuelume-press="pulse"
            data-cuelume-release="release"
            className="focus-ring relative flex-none rounded-[18px]"
            aria-label={`Start ${lesson.title}`}
            disabled={flying}
            onClick={onStart}
          >
            <CurrentTileBeacon>{icon}</CurrentTileBeacon>
          </button>
          <button
            type="button"
            data-cuelume-toggle
            className="focus-ring relative min-h-11 min-w-0 flex-1 rounded-lg text-left"
            aria-current="step"
            aria-pressed={selected}
            aria-label={ariaLabel}
            onClick={onSelect}
          >
            {text}
          </button>
        </div>
      ) : (
        <button
          type="button"
          data-cuelume-toggle
          className="focus-ring flex min-h-[126px] w-[min(100%,278px)] items-center rounded-[18px] px-2 text-left disabled:cursor-not-allowed"
          disabled={locked}
          aria-pressed={locked ? undefined : selected}
          aria-label={ariaLabel}
          onClick={onSelect}
        >
          {icon}
          {text}
        </button>
      )}
    </div>
  );
}
