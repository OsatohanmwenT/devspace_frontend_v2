"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { DevyLottie } from "~/components/devy";
import { Button } from "~/components/ui/button";
import { useBuildIn } from "../hooks/use-build-in";
import { SWAP } from "../lib/motion-presets";
import type { Option } from "../types";

type PlacementRecommendationProps = {
  placement: Option;
  roleLabel: string;
  explanation: { rungSummary: string; tail: string } | null;
  onStartLearning: () => void;
  onReviewRoute: () => void;
  onChangeCareer: () => void;
  onTestLevel: () => void;
};

const TEXT_BUTTON =
  "focus-ring rounded text-sm font-medium text-blue-600 underline underline-offset-4 hover:opacity-80 dark:text-blue-400";
const MENU_ITEM =
  "focus-ring min-h-11 rounded-xl px-3.5 text-left text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800";

// Kept deliberately small: one recommendation, one reason, one decisive action.
// The corrections (test my level / pick a different stage / change career)
// still exist, but tucked behind "This doesn’t feel right" rather than sitting
// next to the primary action asking to be second-guessed.
export function PlacementRecommendation({
  placement,
  roleLabel,
  explanation,
  onStartLearning,
  onReviewRoute,
  onChangeCareer,
  onTestLevel,
}: PlacementRecommendationProps) {
  const [showOptions, setShowOptions] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  useBuildIn(rootRef, String(placement.value));

  return (
    <div ref={rootRef} className="grid w-full max-w-[420px] justify-items-center gap-2.5 text-center">
      <span data-build data-build-order="0">
        <DevyLottie clip="wave" ariaLabel="Devy" className="mb-1 h-24 w-24" />
      </span>
      <p
        data-build
        data-build-order="1"
        className="m-0 text-[11px] font-semibold tracking-[0.08em] text-blue-600 uppercase dark:text-blue-400"
      >
        Your recommended start
      </p>
      <h1
        data-build
        data-build-order="2"
        className="m-0 max-w-[22ch] font-display text-[clamp(24px,3vw,30px)] leading-tight font-medium"
      >
        Start with <span className="text-blue-600 dark:text-blue-400">{placement.label}</span>
      </h1>
      <p data-build data-build-order="3" className="text-muted m-0 max-w-[40ch] text-sm leading-normal">
        {explanation
          ? `${explanation.rungSummary}, ${explanation.tail}`
          : "Based on your experience, this is the best place to begin."}
      </p>
      <p data-build data-build-order="4" className="text-muted m-0 mt-0.5 text-[13px] font-medium">
        {roleLabel} · {placement.label}
      </p>

      <span data-build data-build-order="6" className="w-full">
        <Button className="mt-3 min-h-[52px] w-full text-[15px] font-semibold" onClick={onStartLearning}>
          Start learning →
        </Button>
      </span>

      <div
        data-build
        data-build-order="7"
        className="mt-1 flex flex-wrap items-center justify-center gap-x-4 gap-y-1"
      >
        <button type="button" className={TEXT_BUTTON} onClick={onReviewRoute}>
          Review your full route
        </button>
        <button
          type="button"
          className={TEXT_BUTTON}
          onClick={() => setShowOptions((current) => !current)}
          aria-expanded={showOptions}
        >
          This doesn’t feel right
        </button>
      </div>

      <AnimatePresence initial={false}>
        {showOptions && (
          <motion.div
            className="w-full overflow-hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.26, ease: SWAP.ease }}
          >
            <div className="mt-1 grid w-full gap-1 rounded-2xl border border-neutral-200 bg-white p-1.5 text-left dark:border-neutral-700 dark:bg-neutral-900">
              <button type="button" className={MENU_ITEM} onClick={onTestLevel}>
                Test my level
              </button>
              <button type="button" className={MENU_ITEM} onClick={onReviewRoute}>
                Choose a different starting point
              </button>
              <button type="button" className={MENU_ITEM} onClick={onChangeCareer}>
                Change career
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
