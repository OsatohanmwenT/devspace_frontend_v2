"use client";

import { motion, type MotionValue } from "motion/react";
import type { ReactNode } from "react";
import { useCardStyle } from "../hooks/use-card-carousel";
import { accentStyle } from "../lib/accents";

type CarouselCardProps = {
  index: number;
  count: number;
  position: MotionValue<number>;
  spread: number;
  depth: 0 | 1;
  accent: string;
  label: string;
  isFront: boolean;
  // Extra surface classes, for a card that wants its own background.
  surfaceClassName?: string;
  // Padding differs per card on phones.
  paddingClassName?: string;
  onClick: () => void;
  children: ReactNode;
};

// One card in the tablet and phone stack. Its position comes from the shared
// carousel value; this is the frame: size, surface, accent and focus.
export function CarouselCard({
  index,
  count,
  position,
  spread,
  depth,
  accent,
  label,
  isFront,
  surfaceClassName = "bg-white dark:bg-night-card",
  paddingClassName = "p-6 max-tab:px-6 max-tab:pt-2.5 max-tab:pb-5",
  onClick,
  children,
}: CarouselCardProps) {
  const style = useCardStyle(position, index, count, spread, depth);

  return (
    <motion.div
      role="group"
      aria-label={label}
      aria-current={isFront ? "true" : undefined}
      tabIndex={isFront ? 0 : -1}
      style={{ ...style, ...accentStyle(accent), transformOrigin: "center bottom" }}
      className={`focus-ring absolute top-[54px] left-1/2 -ml-[240px] flex h-[420px] w-[480px] cursor-pointer flex-col items-start rounded-3xl border border-neutral-200 text-left font-medium transition-[translate,scale,border-color,background-color,box-shadow] duration-300 hover:border-neutral-300 hover:-translate-y-1.5 active:scale-[0.99] max-tab:top-24 max-tab:left-[45px] max-tab:ml-0 max-tab:h-[340px] max-tab:w-[calc(100vw-90px)] dark:border-white/10 dark:hover:border-white/20 ${surfaceClassName} ${paddingClassName} ${
        isFront
          ? "shadow-[0_10px_24px_-18px_rgba(20,20,40,0.14)] max-tab:shadow-[0_8px_18px_-16px_rgba(20,20,40,0.12)] dark:shadow-[0_7px_16px_-15px_rgb(0_0_0_/_0.28)]"
          : ""
      }`}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}
