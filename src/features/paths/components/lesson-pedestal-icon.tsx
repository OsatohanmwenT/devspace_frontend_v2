"use client";

import { motion, useReducedMotion } from "motion/react";
import type { DerivedLesson } from "../api/paths-api";

type LessonState = DerivedLesson["derivedState"];

const PALETTES = {
  available: { base: "#35363b", rim: "#62636a", ring: "#c9c9cd", center: "#ececef", symbol: "#9db5d7" },
  // Devy's own navy: current and completed share it, so the road matches the pad he stands on.
  current: { base: "#28346f", rim: "#3f51ad", ring: "#364a9e", center: "#5266c9", symbol: "#fff" },
  completed: { base: "#28346f", rim: "#3f51ad", ring: "#364a9e", center: "#5266c9", symbol: "#fff" },
  locked: { base: "#292a2e", rim: "#4c4d52", ring: "#74757b", center: "#a4a5aa", symbol: "#4b4c51" },
} satisfies Record<LessonState, Record<string, string>>;

// A checkpoint is the one tile on the road that is a milestone rather than a
// lesson, so it is gold instead of blue (or grey, while locked, with a dim flag).
const CHECKPOINT = { base: "#92400e", rim: "#f5b638", ring: "#b45309", center: "#fcd34d", symbol: "#fff" };
const CHECKPOINT_FLAG = { open: "#fbbf24", locked: "#8a6a2b" };

// The platform a lesson stands on. Colours are animated rather than swapped, so
// a lesson moving from available to current to completed morphs through its
// palette instead of snapping.
export function LessonPedestalIcon({
  state,
  checkpoint = false,
  selected = false,
}: {
  state: LessonState;
  checkpoint?: boolean;
  selected?: boolean;
}) {
  const reducedMotion = useReducedMotion();
  const palette = { ...PALETTES[state], ...(checkpoint && state !== "locked" ? CHECKPOINT : {}) };
  if (state === "available" && selected) {
    palette.center = "#9db5d7";
    palette.symbol = "#fff";
  }
  const morph = { duration: reducedMotion ? 0 : 0.35 };

  return (
    <svg className="h-[168px] w-40 shrink-0 transition-transform duration-150" viewBox="0 0 128 134" fill="none" aria-hidden="true">
      <ellipse cx="64" cy="121" rx="46" ry="9" fill="#09090b" opacity=".72" />
      <motion.path animate={{ fill: palette.base }} transition={morph} d="M22 90c0-9 19-17 42-17s42 8 42 17v16c0 9-19 16-42 16s-42-7-42-16V90Z" />
      <motion.ellipse animate={{ fill: palette.rim }} transition={morph} cx="64" cy="90" rx="42" ry="17" />
      <motion.ellipse animate={{ fill: palette.ring }} transition={morph} cx="64" cy="89" rx="31" ry="12" />
      <motion.ellipse animate={{ fill: palette.center }} transition={morph} cx="64" cy="88" rx="21" ry="8" />

      {/* A quiet pulse for "available": present and tappable, but nowhere near
          as loud as the current tile's beacon. */}
      {state === "available" && !reducedMotion && (
        <motion.ellipse
          cx="64"
          cy="89"
          rx="31"
          ry="12"
          fill="none"
          stroke={palette.ring}
          strokeWidth="1.5"
          animate={{ opacity: [0.25, 0.6, 0.25] }}
          transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {checkpoint && (
        <g fill={state === "locked" ? CHECKPOINT_FLAG.locked : CHECKPOINT_FLAG.open}>
          <path d="M64 64V34" stroke={state === "locked" ? CHECKPOINT_FLAG.locked : CHECKPOINT_FLAG.open} strokeWidth="5" strokeLinecap="round" />
          <path d="M67 35h24l-7 8 7 8H67V35Z" />
        </g>
      )}

      {/* The mark lies on the disc, so it is squashed to the disc's own slope, and rises a
          hair when the tile is hovered (the row is the `group`) so it parallaxes off the base. */}
      <g transform="translate(64 88) scale(1 .68) translate(-64 -88)">
        <g className="transition-transform duration-200 group-hover:-translate-y-[2px] motion-reduce:transition-none">
          {/* Mounts the moment a lesson is completed, so the check draws in and settles. */}
          {state === "completed" && (
            <motion.g
              style={{ transformOrigin: "64px 88px" }}
              initial={reducedMotion ? false : { scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 380, damping: 14 }}
            >
              {/* The check stands up off the disc: a darker copy of it, nudged down, is its thickness. */}
              <path d="m60 87.5 3.2 3.2 6.8-7.7" transform="translate(0 2)" stroke={palette.base} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              <motion.path
                d="m60 87.5 3.2 3.2 6.8-7.7"
                stroke={palette.symbol}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={reducedMotion ? false : { pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
              />
            </motion.g>
          )}
          {state === "locked" && (
            <g transform="translate(64 88) scale(.8) translate(-64 -88)">
              <path d="M60.5 85.5v-2.5a3.5 3.5 0 0 1 7 0v2.5" stroke={palette.symbol} strokeWidth="2.4" strokeLinecap="round" fill="none" />
              <rect x="58" y="85" width="12" height="9" rx="2.2" fill={palette.symbol} />
              <circle cx="64" cy="88.6" r="1.3" fill={palette.center} />
            </g>
          )}
          {(state === "current" || state === "available") && <circle cx="64" cy="88" r={state === "current" ? 6 : 4} fill={palette.symbol} />}
        </g>
      </g>
    </svg>
  );
}
