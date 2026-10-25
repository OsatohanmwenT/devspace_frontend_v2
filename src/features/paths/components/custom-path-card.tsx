"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { assetUrl } from "~/config/assets";

const EXAMPLES = [
  "React Native state management",
  "Prepare for a Flutter internship",
  "Build AI agents with Python",
  "Learn SQL for data analysis",
  "Prepare for a backend role at a fintech",
];

// The door out of the catalogue, at the bottom of the list. It rotates its
// example so the prompt reads as "describe anything" rather than "pick one of
// these five".
export function CustomPathCard({ onCreate }: { onCreate: () => void }) {
  const reducedMotion = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const cycle = window.setInterval(() => setIndex((current) => (current + 1) % EXAMPLES.length), 2400);
    return () => window.clearInterval(cycle);
  }, []);

  return (
    <article className="flex items-center gap-5 rounded-2xl border border-dashed border-[#c9c5bd] bg-[#f7f6f3] px-6 py-5 max-tab:flex-col max-tab:items-stretch max-tab:text-center dark:border-[#4a4a4a] dark:bg-[#1a1a1a]">
      <span className="grid size-12 flex-none place-items-center rounded-full bg-[#eeebff] max-tab:mx-auto dark:bg-[#2a264c]">
        {/* eslint-disable-next-line @next/next/no-img-element -- local Devy illustration */}
        <img className="size-7 object-contain" src={assetUrl("devy/neutral.svg")} alt="" />
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="text-base font-semibold text-neutral-800 dark:text-night-ink">Didn’t find the right path?</h3>
        <p className="mt-1 text-sm leading-normal text-ink-soft dark:text-night-soft">
          Tell Devy what you want to learn — e.g.{" "}
          <AnimatePresence initial={false} mode="wait">
            <motion.span
              key={EXAMPLES[index]}
              className="inline-block text-[#2563eb] dark:text-[#88bdf2]"
              initial={reducedMotion ? false : { opacity: 0, y: "0.7em" }}
              animate={{ opacity: 1, y: 0 }}
              exit={reducedMotion ? undefined : { opacity: 0, y: "-0.7em" }}
              transition={{ duration: reducedMotion ? 0 : 0.2 }}
            >
              “{EXAMPLES[index]}”
            </motion.span>
          </AnimatePresence>
        </p>
      </div>
      <Button className="min-h-[46px] flex-none px-5 text-sm font-semibold max-tab:w-full" onClick={onCreate}>
        Create custom path
      </Button>
    </article>
  );
}
