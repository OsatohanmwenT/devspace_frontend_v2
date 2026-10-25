"use client";

import { GameIcon } from "~/components/ui/game-icon";
import { BoltIcon } from "~/components/ui/icons";
import type { HomeData } from "~/types/home";
import { ACCENTS, accentStyle } from "../lib/accents";
import { BadgeCoins } from "./badge-coins";
import { DailyQuests } from "./daily-quests";
import { LeaguePanel } from "./league-panel";

// 1250 becomes "1.2k", 12500 "13k": keeps the XP number a steady width.
function formatCompactXp(value: number) {
  if (value < 1000) return String(value);
  const thousands = value / 1000;
  return `${thousands >= 10 ? Math.round(thousands) : Math.floor(thousands * 10) / 10}k`;
}

type DashboardCardProps = {
  data: HomeData;
  onContinueLesson: () => void;
  onStartPractice: () => void;
  onOpenProfile: () => void;
  onOpenLeaderboard: () => void;
};

// The desktop's top-left card: today's XP and quests, the streak badges, and
// the league standings underneath.
export function DashboardCard({
  data,
  onContinueLesson,
  onStartPractice,
  onOpenProfile,
  onOpenLeaderboard,
}: DashboardCardProps) {
  const { stats, quests, badges, league } = data;
  const goalPercent = Math.min(100, Math.round((stats.dailyXp / Math.max(1, stats.xpGoal)) * 100));

  return (
    <section
      className="h-[356px] overflow-hidden rounded-3xl border border-neutral-200 bg-white text-neutral-800 hover:border-neutral-300 dark:border-white/10 dark:bg-night-card dark:text-night-ink dark:hover:border-white/20"
      style={accentStyle(ACCENTS.leaderboard)}
      aria-label="Your progress"
    >
      <div className="grid h-full grid-cols-[minmax(0,1fr)] grid-rows-[88px_minmax(0,1fr)]">
        <div className="flex items-center justify-between border-b border-black/9 px-7 py-4 dark:border-white/8">
          <DailyQuests
            quests={quests}
            onContinueLesson={onContinueLesson}
            onStartPractice={onStartPractice}
            triggerClassName="group focus-ring -my-1.5 -mr-2.5 -ml-1.5 inline-flex cursor-pointer items-center gap-3 rounded-full py-1.5 pr-2.5 pl-1.5 transition-colors hover:bg-black/4 aria-expanded:bg-black/4 dark:hover:bg-white/6 dark:aria-expanded:bg-white/6"
            panelClassName="left-[-8px] w-[280px]"
          >
            {({ doneCount, total, unseen }) => (
              <>
                {/* The ring fills with today's real progress toward the daily goal. */}
                <span
                  className="relative grid size-[34px] place-items-center rounded-full bg-[conic-gradient(#f5b400_var(--xp-fill),rgb(245_180_0_/_0.18)_0)] shadow-[0_4px_10px_rgb(245_180_0_/_0.22)]"
                  style={{ "--xp-fill": `${goalPercent}%` } as React.CSSProperties}
                  title={`${goalPercent}% of today’s XP goal`}
                >
                  <span className="absolute inset-[3px] rounded-full bg-night-card" />
                  <BoltIcon className="relative size-[18px] text-white" />
                </span>
                <strong className="text-[22px] leading-none" title={`${stats.xp.toLocaleString()} XP`}>
                  {formatCompactXp(stats.xp)}
                </strong>
                <span
                  className={`relative -ml-0.5 inline-flex items-center gap-1 rounded-full py-1 pr-1.5 pl-2 text-xs font-bold whitespace-nowrap ${
                    doneCount === total
                      ? "bg-green-100 text-green-700 dark:bg-green-600/14 dark:text-green-500"
                      : "bg-amber-100 text-amber-700 dark:bg-amber-500/14 dark:text-amber-400"
                  }`}
                >
                  <GameIcon name="daily-tasks-notebook" className="-my-0.5 -ml-0.5 size-[17px]" />
                  Quests
                  <span className="tabular-nums opacity-75">
                    {doneCount}/{total}
                  </span>
                  <svg
                    className="-ml-0.5 size-3.5 transition-transform duration-200 group-aria-expanded:rotate-180"
                    viewBox="0 0 16 16"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path d="m4.5 6.5 3.5 3.5 3.5-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {unseen && (
                    <span
                      className="absolute -top-0.5 -right-0.5 size-[9px] rounded-full border-2 border-white bg-red-500 dark:border-night-card"
                      aria-hidden="true"
                    />
                  )}
                </span>
              </>
            )}
          </DailyQuests>

          <button
            type="button"
            className="focus-ring inline-flex items-center rounded-full pl-2"
            onClick={onOpenProfile}
            aria-label={`Badges: ${badges.filter((badge) => badge.state === "earned").length} earned. Open profile`}
          >
            <BadgeCoins badges={badges} streakDays={stats.streakDays} />
          </button>
        </div>

        <div className="flex min-h-0 flex-col gap-2 px-7 pt-5 pb-2">
          <LeaguePanel league={league} onOpenLeaderboard={onOpenLeaderboard} onStartLesson={onContinueLesson} />
        </div>
      </div>
    </section>
  );
}
