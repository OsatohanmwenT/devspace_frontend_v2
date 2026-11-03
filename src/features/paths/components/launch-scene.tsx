"use client";

import { motion } from "motion/react";
import { LESSON_SCENE } from "~/features/lesson";

// The lesson's blue intro scene, the same one its loading screen shows. It
// rises from the bottom of the screen right behind Devy as he flies off the
// top, so he seems to pull the new screen in after him.
export function LaunchScene({ onCovered }: { onCovered: () => void }) {
  return (
    <motion.div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 z-[100] ${LESSON_SCENE} shadow-[0_-36px_70px_rgba(65,105,225,0.16)] dark:shadow-[0_-36px_70px_rgba(120,150,255,0.14)]`}
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      onAnimationComplete={(definition) => {
        if (typeof definition === "object" && "y" in definition && definition.y === 0) onCovered();
      }}
      exit={{ opacity: 0 }}
      transition={{ y: { duration: 0.8, delay: 0.2, ease: [0.4, 0, 0.2, 1] }, opacity: { duration: 0.25 } }}
    />
  );
}
