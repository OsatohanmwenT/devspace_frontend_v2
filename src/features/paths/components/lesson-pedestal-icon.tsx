"use client";

import { motion, useReducedMotion } from "motion/react";
import type { DerivedLesson } from "../api/paths-api";

type LessonState = DerivedLesson["derivedState"];

const PALETTES = {
  available: { base: "#35363b", rim: "#62636a", ring: "#c9c9cd", center: "#ececef", symbol: "#9db5d7" },
  current: { base: "#20366d", rim: "#2d4993", ring: "#9db5d7", center: "#565581", symbol: "#fff" },
  completed: { base: "#67658d", rim: "#9db5d7", ring: "#c5c3eb", center: "#9db5d7", symbol: "#172552" },
  locked: { base: "#292a2e", rim: "#4c4d52", ring: "#74757b", center: "#a4a5aa", symbol: "#4b4c51" },
} satisfies Record<LessonState, Record<string, string>>;

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
  const palette = { ...PALETTES[state] };
  if (state === "available" && selected) {
    palette.center = "#9db5d7";
    palette.symbol = "#fff";
  }
  const morph = { duration: reducedMotion ? 0 : 0.35 };

  return (
    <svg className="h-[134px] w-32 shrink-0 transition-transform duration-150" viewBox="0 0 128 134" fill="none" aria-hidden="true">
      <ellipse cx="64" cy="116" rx="45" ry="12" fill="#09090b" opacity=".72" />
      <motion.path animate={{ fill: palette.base }} transition={morph} d="M22 90c0-13 19-24 42-24s42 11 42 24v21c0 13-19 23-42 23s-42-10-42-23V90Z" />
      <motion.ellipse animate={{ fill: palette.rim }} transition={morph} cx="64" cy="90" rx="42" ry="24" />
      <motion.ellipse animate={{ fill: palette.ring }} transition={morph} cx="64" cy="89" rx="31" ry="17" />
      <motion.ellipse animate={{ fill: palette.center }} transition={morph} cx="64" cy="88" rx="21" ry="11" />

      {/* A quiet pulse for "available": present and tappable, but nowhere near
          as loud as the current tile's beacon. */}
      {state === "available" && !reducedMotion && (
        <motion.ellipse
          cx="64"
          cy="89"
          rx="31"
          ry="17"
          fill="none"
          stroke={palette.ring}
          strokeWidth="1.5"
          animate={{ opacity: [0.25, 0.6, 0.25] }}
          transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {checkpoint && (
        <g fill={palette.symbol}>
          <path d="M64 57V30" stroke={palette.symbol} strokeWidth="5" strokeLinecap="round" />
          <path d="M67 31h24l-7 8 7 8H67V31Z" />
        </g>
      )}

      {/* Mounts the moment a lesson is completed, so the check draws in and settles. */}
      {state === "completed" && (
        <motion.g
          style={{ transformOrigin: "64px 88px" }}
          initial={reducedMotion ? false : { scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 380, damping: 14 }}
        >
          <motion.path
            d="m54 87 7 7 15-16"
            stroke={palette.symbol}
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={reducedMotion ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
          />
        </motion.g>
      )}
      {state === "locked" && (
        <g fill={palette.symbol}>
          <rect x="55" y="82" width="18" height="15" rx="3" />
          <path d="M59 82v-4a5 5 0 0 1 10 0v4" stroke={palette.symbol} strokeWidth="4" />
        </g>
      )}
      {(state === "current" || state === "available") && <circle cx="64" cy="88" r={state === "current" ? 6 : 4} fill={palette.symbol} />}
    </svg>
  );
}
