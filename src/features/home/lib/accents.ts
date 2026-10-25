import type { CSSProperties } from "react";

// Each Home card has one colour of its own, as an "R G B" triplet. A card sets
// it as `--card-accent`, and utilities such as `text-accent` and `bg-accent/15`
// read it.
export const ACCENTS = {
  continueLearning: "59 130 246",
  leaderboard: "249 115 22",
  portfolio: "139 124 246",
  update: "34 197 94",
} as const;

export type AccentId = keyof typeof ACCENTS;

export const accentStyle = (accent: string) => ({ "--card-accent": accent }) as CSSProperties;
