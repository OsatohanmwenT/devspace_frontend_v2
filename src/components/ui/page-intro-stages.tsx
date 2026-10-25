"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { DevyLottie, DevyMood } from "~/components/devy";
import { Button } from "~/components/ui/button";

export type IntroStage = {
  title: string;
  body: string;
  mood: "neutral" | "celebrating";
  eyebrow?: string;
};

type PageIntroStagesProps = {
  stages: IntroStage[];
  finalActionLabel: string;
  ariaLabel: string;
  onDone: () => void;
};

// Neutral stages get the thinking clip. Celebrating brings its own entrance
// and loop, so it is left alone.
function StageArt({ mood }: { mood: IntroStage["mood"] }) {
  const size = "relative size-36 max-tab:size-28";
  return (
    <div className="relative mb-9 grid place-items-center max-tab:mb-7">
      {mood === "neutral" ? <DevyLottie clip="thinking" className={size} /> : <DevyMood mood={mood} className={size} />}
    </div>
  );
}

// A staged intro: one idea per screen, advanced by Continue. The dots and the
// button sit outside the animated stage, so the controls stay put while the
// idea moves from right to left.
export function PageIntroStages({ stages, finalActionLabel, ariaLabel, onDone }: PageIntroStagesProps) {
  const [index, setIndex] = useState(0);
  const stage = stages[index];
  const last = index === stages.length - 1;

  return (
    <section
      className="fixed inset-0 z-40 grid min-h-screen place-items-center overflow-y-auto bg-[linear-gradient(to_bottom,#fafaf8_0%,#fafaf8_42%,#e4effd_100%)] px-6 py-8 text-neutral-800 max-tab:px-4 dark:bg-[linear-gradient(to_bottom,#121214_0%,#121214_42%,#1d2a43_100%)] dark:text-night-ink"
      aria-label={ariaLabel}
    >
      <main className="grid w-full max-w-[520px] justify-items-center text-center">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={index}
            className="grid w-full justify-items-center"
            initial={{ opacity: 0, x: 72 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -72 }}
            transition={{ duration: 0.62, ease: [0.22, 0.61, 0.36, 1] }}
          >
            <StageArt mood={stage.mood} />
            {stage.eyebrow && <p className="m-0 text-[13px] font-semibold tracking-[0.08em] text-ink-soft uppercase dark:text-[#b2b2b6]">{stage.eyebrow}</p>}
            <h1 className="mt-3 mb-2 text-3xl leading-[1.4] font-semibold max-tab:text-[26px]">{stage.title}</h1>
            <p className="m-0 max-w-[42ch] text-[17px] leading-[1.55] text-ink-soft dark:text-[#b2b2b6]">{stage.body}</p>
          </motion.div>
        </AnimatePresence>

        <div className="mt-9 flex items-center gap-2" role="img" aria-label={`Step ${index + 1} of ${stages.length}`}>
          {stages.map((entry, dot) => (
            <span
              key={entry.title}
              className={`size-2 rounded-full transition-colors duration-200 ${dot === index ? "bg-neutral-800 dark:bg-night-ink" : "bg-[#d4d4d4] dark:bg-night-line"}`}
            />
          ))}
        </div>

        <Button className="mt-5 min-h-13 w-[min(100%,350px)] text-[15px] font-semibold" onClick={() => (last ? onDone() : setIndex(index + 1))} autoFocus>
          {last ? finalActionLabel : "Continue"}
        </Button>
      </main>
    </section>
  );
}
