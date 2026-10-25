"use client";

import { animate, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { assetUrl } from "~/config/assets";
import { usePrefersReducedMotion } from "~/hooks/use-prefers-reduced-motion";
import { getStageArt } from "../lib/stage-art";
import type { Option } from "../types";

// Where a card sits relative to the active one. Neighbours peek in from the
// stage edges, straight (±2° at most) and slightly smaller; anything further
// out waits just past the edge, so a step change slides rather than pops.
function slotFor(offset: number) {
  const side = Math.sign(offset);
  const distance = Math.min(Math.abs(offset), 2);
  const x = distance <= 1 ? 92 * distance : 92 + 68 * (distance - 1);
  const scale = distance <= 1 ? 1 - 0.1 * distance : 0.9 - 0.05 * (distance - 1);
  const opacity = distance <= 1 ? 1 - 0.15 * distance : 0.85 * (2 - distance);
  return { x: `${side * x}%`, scale, rotate: side * 2 * Math.min(distance, 1), opacity };
}

// One accent per card, so each step has its own colour.
const CARD_TINTS = [
  "bg-green-700",
  "bg-orange-600",
  "bg-blue-600",
  "bg-amber-600",
  "bg-violet-600",
];

function StageCard({
  stage,
  index,
  active,
  onClick,
}: {
  stage: Option;
  index: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      data-cuelume-toggle
      tabIndex={active ? -1 : 0}
      aria-label={active ? undefined : `Show ${stage.label}`}
      onClick={onClick}
      className={`focus-ring flex h-[224px] w-[212px] flex-col rounded-2xl p-3.5 text-left text-white max-[480px]:h-[198px] max-[480px]:w-[188px] ${CARD_TINTS[index % CARD_TINTS.length]} ${active ? "cursor-default" : "cursor-pointer"}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className="grid size-8 flex-none place-items-center rounded-full bg-white/20 text-[13px] font-semibold"
          aria-hidden="true"
        >
          {index + 1}
        </span>
        {index === 0 && (
          <span className="text-[11px] font-semibold tracking-[0.06em] text-white/85 uppercase">
            Start here
          </span>
        )}
      </div>
      <p className="m-0 mt-2 line-clamp-2 font-display text-[15px] leading-[1.2] font-semibold max-[480px]:text-sm">
        {stage.label}
      </p>
      <div className="relative mt-2.5 flex flex-1 items-end justify-center overflow-hidden rounded-xl bg-black/15">
        {/* eslint-disable-next-line @next/next/no-img-element -- small fixed illustration */}
        <img
          src={assetUrl(getStageArt(String(stage.value), index))}
          alt=""
          className="h-[86%] max-h-[120px] object-contain"
        />
      </div>
    </button>
  );
}

// The role reveal's stage carousel, kept compact: a fixed, clipped stage with
// the active step dead centre and the previous/next steps peeking in from the
// edges, dots below. The learner can step through the route (dots, or tap a
// peeking card). It opens by scanning from the last step back to the first,
// because that is where they will start.
export function StageCards({ stages, label }: { stages: Option[]; label: string }) {
  const cards = stages.slice(0, 5);
  const reducedMotion = usePrefersReducedMotion();
  const canScan = !reducedMotion && cards.length >= 2;
  const [position, setPosition] = useState(canScan ? cards.length - 1 : 0);
  const [isScanning, setIsScanning] = useState(canScan);
  const scanAnimation = useRef<{ stop: () => void } | null>(null);
  const active = Math.round(position);
  const lastIndex = cards.length - 1;

  useEffect(() => {
    if (!canScan) return;
    scanAnimation.current = animate(lastIndex, 0, {
      duration: 1.15 + cards.length * 0.08,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: setPosition,
      onComplete: () => setIsScanning(false),
    });
    return () => scanAnimation.current?.stop();
  }, [canScan, lastIndex, cards.length]);

  function showStage(index: number) {
    scanAnimation.current?.stop();
    setIsScanning(false);
    setPosition(index);
  }

  return (
    <div className="grid w-full justify-items-center gap-3">
      <div
        className="relative h-[254px] w-full max-w-[460px] overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_16%,#000_84%,transparent)] max-[480px]:h-[228px]"
        role="group"
        aria-roledescription="carousel"
        aria-label={label}
      >
        {cards.map((stage, index) => {
          const offset = index - position;

          return (
            <motion.div
              key={stage.value}
              className="absolute top-1/2 left-1/2 -mt-[112px] -ml-[106px] max-[480px]:-mt-[99px] max-[480px]:-ml-[94px]"
              initial={reducedMotion ? false : { opacity: 0, scale: 0.85, x: "0%" }}
              animate={slotFor(offset)}
              transition={
                reducedMotion || isScanning
                  ? { duration: 0 }
                  : { type: "spring", stiffness: 280, damping: 28, mass: 0.9 }
              }
              style={{ zIndex: 3 - Math.min(Math.ceil(Math.abs(offset)), 2) }}
              aria-hidden={index === active ? undefined : true}
            >
              <StageCard
                stage={stage}
                index={index}
                active={index === active}
                onClick={() => showStage(index)}
              />
            </motion.div>
          );
        })}
      </div>

      <div className="flex items-center gap-2" role="tablist" aria-label="Route steps">
        {cards.map((stage, index) => (
          <button
            key={stage.value}
            type="button"
            data-cuelume-toggle
            role="tab"
            aria-selected={index === active}
            aria-label={`${stage.label}, step ${index + 1}`}
            onClick={() => showStage(index)}
            className={`focus-ring h-2 rounded-full transition-[width,background-color] duration-300 ${
              index === active
                ? "w-6 bg-ink dark:bg-night-ink"
                : "w-2 bg-neutral-300 hover:bg-neutral-400 dark:bg-neutral-700 dark:hover:bg-neutral-500"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
