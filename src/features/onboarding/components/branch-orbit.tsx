"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { DevyLottie } from "~/components/devy";
import { usePrefersReducedMotion } from "~/hooks/use-prefers-reduced-motion";
import { BRANCH_ORBIT_CARDS, type OrbitPart } from "../data/branch-orbit-cards";
import { FAN } from "../lib/motion-presets";
import type { BranchId } from "../types";

// Where each card rests when motion is reduced, instead of travelling.
const STATIC_POSITION = [
  "motion-reduce:[transform:translate(-50%,calc(-50%+78px))]",
  "motion-reduce:[transform:translate(calc(-50%-var(--orbit-radius)),calc(-50%-60px))_scale(0.8)]",
  "motion-reduce:[transform:translate(calc(-50%+var(--orbit-radius)),calc(-50%-60px))_scale(0.8)]",
];

function OrbitText({ parts }: { parts: OrbitPart[] }) {
  return parts.map((part, index) =>
    typeof part === "string" ? (
      <span key={index}>{part}</span>
    ) : (
      <span
        key={index}
        className={
          part.tone === "keyword"
            ? "text-blue-600 dark:text-blue-400"
            : "text-emerald-600 dark:text-emerald-400"
        }
      >
        {part.text}
      </span>
    ),
  );
}

// Cards stay facing the learner as they travel around one central Devy. The
// wrapper clips at its own edge so a card mid-swing never spills past the
// break screen into whatever sits below it.
//
// Each card's inner face fans in from a tilted, shrunken state while its outer
// orbit track holds still (the orbit keyframes own the outer transform). The
// orbit only starts travelling once the last card has landed.
export function BranchOrbit({ branch }: { branch: BranchId }) {
  const cards = BRANCH_ORBIT_CARDS[branch];
  const reducedMotion = usePrefersReducedMotion();
  const [landed, setLanded] = useState(false);
  const orbiting = reducedMotion || landed;

  return (
    <div
      className="relative mx-auto h-[230px] w-full max-w-[420px] overflow-hidden [--orbit-radius:clamp(70px,22vw,130px)]"
      aria-hidden="true"
    >
      <div className="absolute inset-0">
        {cards.map((card, index) => (
          <div
            key={index}
            className={`absolute top-1/2 left-1/2 w-[136px] motion-safe:animate-orbit-travel ${STATIC_POSITION[index]}`}
            style={{
              animationDelay: `${-index * 6}s`,
              animationPlayState: orbiting ? "running" : "paused",
            }}
          >
            <motion.div
              className="overflow-hidden rounded-lg border border-neutral-200 bg-white text-left font-mono text-[11px] leading-normal text-neutral-800 shadow-md dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
              initial={{
                opacity: 0,
                scale: FAN.scaleFrom,
                rotate: (index - 1) * FAN.angle * 1.4,
                y: FAN.rise,
              }}
              animate={{ opacity: 1, scale: 1, rotate: 0, y: 0 }}
              transition={{
                duration: FAN.duration,
                ease: FAN.ease,
                delay: 0.25 + index * FAN.stagger,
              }}
              onAnimationComplete={index === cards.length - 1 ? () => setLanded(true) : undefined}
            >
              <div className="whitespace-pre px-2.5 py-2">
                {card.lines.map((line, lineIndex) => (
                  <div key={lineIndex}><OrbitText parts={line} /></div>
                ))}
              </div>
              {card.output && (
                <div className="border-t border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400">
                  <p className="m-0 text-[9px] font-semibold tracking-[0.08em] uppercase opacity-70">Output</p>
                  <OrbitText parts={card.output} />
                </div>
              )}
            </motion.div>
          </div>
        ))}
      </div>
      <motion.div
        className="pointer-events-none absolute top-1/2 left-1/2 z-[2] -translate-x-1/2 -translate-y-1/2"
        initial={{ opacity: 0, scale: 0.5, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.34, 1.9, 0.64, 1] }}
      >
        <span
          aria-hidden="true"
          className="absolute inset-0 -z-10 rounded-full bg-blue-600/15 blur-2xl motion-safe:animate-thought-glow dark:bg-blue-400/25"
        />
        <DevyLottie clip="thinking" className="relative h-28 w-28" />
      </motion.div>
    </div>
  );
}
