"use client";

import { motion } from "motion/react";

// The lesson's blue intro scene, the same one its loading screen shows. It
// rises from the bottom of the screen right behind Devy as he flies off the
// top, so he seems to pull the new screen in after him.
export function LaunchScene() {
  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[100] bg-[linear-gradient(to_bottom,#fafaf8_0%,#fafaf8_42%,#e4effd_100%)] shadow-[0_-36px_70px_rgba(65,105,225,0.16)] dark:bg-[linear-gradient(to_bottom,#121214_0%,#121214_42%,#1d2a43_100%)] dark:shadow-[0_-36px_70px_rgba(120,150,255,0.14)]"
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ y: { duration: 0.8, delay: 0.2, ease: [0.4, 0, 0.2, 1] }, opacity: { duration: 0.25 } }}
    />
  );
}
