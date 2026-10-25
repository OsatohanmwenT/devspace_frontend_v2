"use client";

import { motion } from "motion/react";
import { WORD } from "../lib/motion-presets";

// Each word rises a beat after the last. Hero titles only. Renders inline
// spans, so it can sit inside any heading and keep that heading's typography;
// screen readers get the whole string once via aria-label.
export function WordReveal({ text, delay = 0 }: { text: string; delay?: number }) {
  const words = text.split(" ");

  return (
    <span aria-label={text}>
      {words.map((word, index) => (
        <motion.span
          key={`${word}-${index}`}
          aria-hidden="true"
          className="inline-block whitespace-pre"
          initial={{ opacity: 0, y: WORD.y }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: WORD.duration, ease: WORD.ease, delay: delay + index * WORD.stagger }}
        >
          {word}
          {index < words.length - 1 ? " " : ""}
        </motion.span>
      ))}
    </span>
  );
}
