"use client";

import { motion } from "motion/react";
import { useRef } from "react";
import { DevyLottie } from "~/components/devy";
import { Button } from "~/components/ui/button";
import { useBuildIn } from "../hooks/use-build-in";
import { SWAP } from "../lib/motion-presets";

type FirstLessonWelcomeProps = {
  pathTitle: string;
  lessonTitle: string;
  onBegin: () => void;
};

// The handoff out of onboarding: the route has been built, Devy waves the
// learner in, and one button opens the first lesson. It takes over the whole
// screen, so it needs no header or progress bar.
export function FirstLessonWelcome({ pathTitle, lessonTitle, onBegin }: FirstLessonWelcomeProps) {
  const rootRef = useRef<HTMLElement>(null);
  useBuildIn(rootRef, "first-lesson");

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: SWAP.in, ease: SWAP.ease }}
      className="fixed inset-0 z-30 grid place-items-center bg-[linear-gradient(to_bottom,#fafaf8_0%,#fafaf8_42%,#fff1bd_100%)] px-6 py-8 text-neutral-800 max-[680px]:px-4 dark:bg-[linear-gradient(to_bottom,#121214_0%,#121214_42%,#3a2d0d_100%)] dark:text-night-ink"
      aria-label="Your first lesson"
    >
      <main ref={rootRef} className="grid w-full max-w-[520px] justify-items-center text-center">
        <span data-build data-build-order="0" className="mb-7 max-[680px]:mb-6">
          <DevyLottie clip="wave" loop={false} ariaLabel="Devy" className="h-28 w-28 max-[680px]:h-24 max-[680px]:w-24" />
        </span>
        <p
          data-build
          data-build-order="1"
          className="m-0 text-[13px] font-semibold tracking-[0.08em] text-[#946200] uppercase dark:text-[#f7c948]"
        >
          Your learning path
        </p>
        <h1
          data-build
          data-build-order="1"
          className="mt-3 mb-2 font-display text-[clamp(28px,4vw,38px)] leading-[1.14] font-semibold"
        >
          Your first lesson is ready
        </h1>
        <p data-build data-build-order="1" className="m-0 text-[17px] leading-[1.55] text-ink-soft dark:text-night-soft">
          {pathTitle} starts with{" "}
          <strong className="font-semibold text-neutral-800 dark:text-night-ink">{lessonTitle}</strong>.
        </p>
        <span data-build data-build-order="2" className="mt-9 w-[min(100%,350px)]">
          <Button
            className="min-h-[52px] w-full border-[#facc15]! bg-[#eab308]! text-[15px] font-semibold text-[#221b08]! shadow-[0_3px_0_#a16207]! hover:bg-[#facc15]! focus-visible:outline-[#fef08a]!"
            onClick={onBegin}
          >
            Let’s begin
          </Button>
        </span>
      </main>
    </motion.section>
  );
}
