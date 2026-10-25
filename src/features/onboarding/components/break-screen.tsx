"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { DevyLottie } from "~/components/devy";
import { useTypewriter } from "../hooks/use-typewriter";

type BreakScreenProps = {
  message: string;
  insight?: string;
  // Replaces Devy with something concrete, like the branch's orbiting cards.
  snippet?: ReactNode;
};

// A short pause after a question: Devy says one line, then adds a spark. Mount
// it fresh (via `key`) for each break so the line types out again.
export function BreakScreen({ message, insight, snippet }: BreakScreenProps) {
  const typed = useTypewriter(message);
  const isTyping = typed.length < message.length;

  return (
    <div className="grid w-full max-w-[560px] justify-items-center gap-4">
      <div className="flex w-full items-end justify-center gap-3">
        {!snippet && (
          // Devy pops in with an overshoot, the bubble follows a beat behind
          // with its own: the second bounce reads as "he just said something".
          <motion.div
            className="relative flex-none"
            initial={{ opacity: 0, scale: 0.5, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.34, 1.9, 0.64, 1] }}
          >
            <span
              aria-hidden="true"
              className="absolute inset-0 -z-10 rounded-full bg-blue-600/15 blur-2xl motion-safe:animate-thought-glow dark:bg-blue-400/25"
            />
            <DevyLottie clip="thinking" className="relative h-24 w-24" />
          </motion.div>
        )}
        <motion.div
          className={`relative max-w-[320px] rounded-2xl rounded-bl-md border border-neutral-200 bg-white px-4 py-3 text-left text-[17px] leading-[1.4] font-medium shadow-md dark:border-neutral-700 dark:bg-neutral-900 ${isTyping ? "" : "motion-safe:animate-bubble-pop"}`}
          initial={{ opacity: 0, scale: 0.8, x: -12 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 0.4, ease: [0.34, 2.2, 0.64, 1], delay: snippet ? 0 : 0.28 }}
          role="status"
        >
          {/* The screen-reader text is whole; the visible text types out. */}
          <span className="sr-only">{message}</span>
          <span aria-hidden="true">
            {typed}
            {isTyping && (
              <span className="ml-0.5 inline-block h-[1em] w-0.5 bg-current align-[-0.15em] motion-safe:animate-caret-blink" />
            )}
          </span>
        </motion.div>
      </div>
      {snippet && <div className="w-full">{snippet}</div>}
      {insight && (
        <p
          className={`text-muted m-0 max-w-[60ch] text-center text-[15px] leading-normal transition-[opacity,transform] duration-300 ease-out ${isTyping ? "translate-y-1.5 opacity-0" : "translate-y-0 opacity-100"}`}
        >
          {insight}
        </p>
      )}
    </div>
  );
}
