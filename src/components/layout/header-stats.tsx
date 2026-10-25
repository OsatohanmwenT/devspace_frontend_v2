"use client";

import { useCallback, useRef, useState } from "react";
import { SirenIcon } from "~/components/ui/icons";
import { useDismiss } from "~/hooks/use-dismiss";
import { useToast } from "~/providers/toast-provider";
import type { ProgressSummary } from "~/types/progress";
import { AnimatedBoltIcon, AnimatedGemIcon } from "./animated-stat-icons";
import { StreakJourneyDrawer } from "./streak-journey-drawer";
import { XpPopover } from "./xp-popover";

// 1250 becomes "1.2k", 12500 "13k": keeps the number a steady width.
function formatCompact(value: number) {
  if (value < 1000) return String(value);
  const thousands = value / 1000;
  return `${thousands >= 10 ? Math.round(thousands) : Math.floor(thousands * 10) / 10}k`;
}

// On phones the chips drop their frames and sit as a bare icon and number, so
// the streak and XP stay visible without crowding the nav.
const CHIP =
  "relative inline-flex items-center gap-1 tab:h-[34px] tab:gap-[5px] tab:rounded-full tab:border tab:px-3 tab:text-[13px] tab:font-semibold max-tab:px-1 max-tab:text-sm max-tab:font-bold";
const CHIP_IDLE =
  "text-neutral-900 tab:border-neutral-200 tab:bg-white tab:text-neutral-800 dark:text-night-ink tab:dark:border-night-line tab:dark:bg-neutral-800 tab:dark:text-night-ink";
const CHIP_AT_RISK =
  "text-red-600 tab:border-red-400 tab:bg-red-50 tab:text-red-700 dark:text-red-500 tab:dark:border-red-400/80 tab:dark:bg-red-500/10 tab:dark:text-red-200";

export function HeaderStats({ summary }: { summary: ProgressSummary }) {
  const { xp, dailyXp, xpGoal, streakDays, streakAtRisk } = summary;
  const [streakOpen, setStreakOpen] = useState(false);
  const [xpOpen, setXpOpen] = useState(false);
  const xpRef = useRef<HTMLDivElement>(null);
  const toast = useToast();
  const closeStreak = useCallback(() => setStreakOpen(false), []);
  useDismiss(xpOpen, () => setXpOpen(false), xpRef);

  return (
    <>
      <button
        type="button"
        data-cuelume-toggle
        className={`${CHIP} focus-ring cursor-pointer transition-colors ${streakAtRisk ? CHIP_AT_RISK : CHIP_IDLE}`}
        onClick={() => {
          setXpOpen(false);
          setStreakOpen(true);
        }}
        aria-haspopup="dialog"
        aria-expanded={streakOpen}
        aria-controls="streak-journey-dialog"
        aria-label={
          streakAtRisk
            ? `${streakDays} day streak. Activity required today.`
            : `${streakDays} day streak`
        }
      >
        {streakAtRisk ? (
          <SirenIcon className="size-4 max-tab:size-[18px]" />
        ) : (
          <AnimatedBoltIcon className="size-4 text-amber-500 max-tab:size-[18px]" />
        )}
        <span aria-hidden="true">{streakDays}</span>
        {streakAtRisk && (
          <span
            className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full border-2 border-white bg-red-400 motion-safe:animate-pulse dark:border-night"
            aria-hidden="true"
          />
        )}
      </button>

      {streakOpen && (
        <StreakJourneyDrawer
          summary={summary}
          onClose={closeStreak}
          onKeepStreak={() => {
            closeStreak();
            toast("Lessons are coming soon");
          }}
        />
      )}

      <div className="relative" ref={xpRef}>
        <button
          type="button"
          className={`${CHIP} focus-ring cursor-pointer transition-colors ${
            xpOpen
              ? "text-blue-600 tab:border-blue-400 tab:text-neutral-800 dark:text-blue-400 tab:dark:text-night-ink"
              : "text-neutral-900 tab:border-neutral-200 tab:text-ink-soft tab:hover:border-ink-soft dark:text-night-ink tab:dark:border-night-line tab:dark:text-night-soft tab:dark:hover:border-night-soft"
          } tab:bg-white tab:dark:bg-neutral-800`}
          onClick={() => setXpOpen((open) => !open)}
          aria-haspopup="dialog"
          aria-expanded={xpOpen}
        >
          <AnimatedGemIcon className="size-3.5 text-blue-400 max-tab:size-4" />
          <span aria-hidden="true">{formatCompact(xp)}</span>
          <span className="sr-only">{xp} XP</span>
        </button>
        {xpOpen && <XpPopover earnedToday={dailyXp} xpGoal={xpGoal} />}
      </div>
    </>
  );
}
