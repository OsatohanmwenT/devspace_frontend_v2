"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { LESSON_SCENE } from "~/features/lesson";

// How far the curved crest stands above the scene's flat top edge.
const CREST_PX = 88;

// The lesson's blue intro scene, the same one its loading screen shows. It
// rises from the bottom of the screen right behind Devy as he flies off the
// top, so he seems to pull the new screen in after him.
//
// It arrives as a swell rather than a flat sheet: the leading edge is a wide
// curve that glows as it travels, and the motion eases in slowly (Devy is still
// clearing the pad), surges through the middle, then settles onto the top of
// the screen instead of stopping dead.
export function LaunchScene({ onCovered }: { onCovered: () => void }) {
  // Starts far enough down that the crest is below the screen too.
  const [startY] = useState(() => window.innerHeight + CREST_PX);

  return (
    <motion.div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 z-[100] ${LESSON_SCENE}`}
      initial={{ y: startY }}
      animate={{ y: 0 }}
      onAnimationComplete={(definition) => {
        if (typeof definition === "object" && "y" in definition && definition.y === 0) onCovered();
      }}
      exit={{ opacity: 0 }}
      transition={{ y: { duration: 1, delay: 0.1, ease: [0.55, 0, 0.1, 1] }, opacity: { duration: 0.25 } }}
    >
      {/* Same colour as the scene's flat top, so the crest and the sheet read as one surface. */}
      <span
        className="absolute inset-x-[-14%] bottom-full rounded-[50%_50%_0_0/100%_100%_0_0] border-t border-[#6f8cf0]/30 bg-[#fafaf8] shadow-[0_-18px_70px_rgba(111,140,240,0.3)] dark:bg-[#121214] dark:shadow-[0_-18px_70px_rgba(120,150,255,0.26)]"
        style={{ height: CREST_PX }}
      />
    </motion.div>
  );
}
