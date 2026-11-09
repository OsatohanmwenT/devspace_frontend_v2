"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { DevyRive } from "~/components/devy";
import type { DerivedLesson } from "../api/paths-api";
import type { LaunchFlight } from "../hooks/use-lesson-launch";
import { DevyFlyer } from "./devy-flyer";
import { LessonPedestalIcon } from "./lesson-pedestal-icon";

const STATE_LABELS = {
  completed: "Completed",
  current: "Current lesson",
  available: "Available",
  locked: "Locked",
} satisfies Record<DerivedLesson["derivedState"], string>;

// Lessons wind down the route in a gentle S, close together, so the road is
// the path the tiles take rather than a line drawn behind them. Phones swing
// less, being narrower. The offset is `left`, not a transform: a transformed
// ancestor would become the containing block of Devy's fixed-position flight
// and throw his launch box off the tile.
const WIND = [
  "",
  "relative left-24 max-tab:left-3",
  "relative left-[168px] max-tab:left-5",
  "relative left-24 max-tab:left-3",
  "",
  "relative -left-24 max-tab:-left-3",
  "relative -left-[168px] max-tab:-left-5",
  "relative -left-24 max-tab:-left-3",
];

// How long Devy's rise onto his pad takes after the animation starts. The page
// lands on this tile, so the rise is kept out of sight and he appears standing.
const INTRO_MS = 3200;

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
  // Set while Devy is flying out from this tile to the lesson.
  flight: LaunchFlight | null;
  onSelect: () => void;
  onStart: () => void;
};

export function LessonRow({ lesson, index, selected, flight, onSelect, onStart }: LessonRowProps) {
  const reducedMotion = useReducedMotion();
  const [riveReady, setRiveReady] = useState(false);
  const [introDone, setIntroDone] = useState(false);
  const state = lesson.derivedState;
  const current = state === "current";
  const locked = state === "locked";
  const label = STATE_LABELS[state];
  const flying = flight !== null;

  useEffect(() => {
    if (!riveReady) return;
    const timer = window.setTimeout(() => setIntroDone(true), INTRO_MS);
    return () => window.clearTimeout(timer);
  }, [riveReady]);
  const ariaLabel = `${lesson.title}, ${label}${lesson.checkpoint ? ", checkpoint" : ""}`;

  // The Rive state machine draws its own launchpad; the static pedestal stands
  // in under reduced motion because the Rive file starts on an empty frame.
  const icon =
    current && !reducedMotion ? (
      <DevyFlyer flight={flight}>
        <DevyRive
          clip="complete-flow"
          flying={flying}
          // The rig's "particles" state is the airborne loop.
          onStateChange={(states) => states.includes("particles") && flight?.onAirborne()}
          onReady={() => setRiveReady(true)}
          className={`size-full transition-opacity duration-500 ${introDone || flying ? "opacity-100" : "opacity-0"}`}
          ariaLabel=""
        />
      </DevyFlyer>
    ) : (
      <LessonPedestalIcon state={state} checkpoint={lesson.checkpoint} selected={selected} />
    );

  // Off the current tile, the platform sits low in its box (a flag stands above
  // it), so the name is nudged down to the platform's own centre.
  const text = (
    <span className={`grid min-w-0 gap-[5px] ${current ? "-ml-6" : "mt-[58px]"}`}>
      <strong className={`leading-[1.3] font-medium text-balance text-neutral-800 dark:text-night-ink ${current ? "text-[17px]" : "text-[15px]"}`}>{lesson.shortTitle ?? lesson.title}</strong>
    </span>
  );

  return (
    <div
      data-lesson-id={lesson.id}
      data-current-lesson={current || undefined}
      // While Devy is in flight the row stops being its own layer, so the launch scene covers the tile's
      // label and glow and only the flying canvas (see DevyFlyer) stays above it.
      className={`relative flex min-h-[148px] w-full ${flying ? "" : "z-1"} justify-center`}
    >
      {current ? (
        <div className={`flex min-h-[148px] w-[min(100%,320px)] items-center px-2 ${WIND[index % WIND.length]}`}>
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
          className={`focus-ring group flex min-h-[148px] w-[min(100%,278px)] items-center rounded-[18px] px-2 text-left disabled:cursor-not-allowed ${WIND[index % WIND.length]}`}
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
