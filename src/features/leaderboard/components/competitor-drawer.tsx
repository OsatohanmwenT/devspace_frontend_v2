"use client";

import { useCallback, type ReactNode } from "react";
import { Avatar } from "~/components/ui/avatar";
import { Drawer } from "~/components/ui/drawer";
import { CoinIcon } from "~/components/ui/game-icon";
import { useLoad } from "~/hooks/use-load";
import type { LeaderboardEntry } from "~/types/leaderboard";
import { getCompetitorProfile } from "../api/leaderboard-api";

const CARD = "rounded-xl border border-[#eeeeeb] bg-white dark:border-night-line dark:bg-[#1a1a1c]";
const EYEBROW = "text-[11px] font-semibold tracking-[.06em] text-[#737371] uppercase dark:text-[#7d7d80]";

function Stat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className={`grid gap-0.5 px-3.5 py-3 ${CARD}`}>
      <span className={EYEBROW}>{label}</span>
      <span className="text-base font-semibold text-neutral-800 dark:text-night-ink">{value}</span>
    </div>
  );
}

type CompetitorDrawerProps = {
  entry: LeaderboardEntry;
  leagueName: string;
  seasonIndex: number;
  onClose: () => void;
};

// A side panel, so the standings stay visible behind it. There is no real
// proof book for a simulated rival to link to, so that action is left out.
export function CompetitorDrawer({ entry, leagueName, seasonIndex, onClose }: CompetitorDrawerProps) {
  const load = useCallback(() => getCompetitorProfile(entry.id, seasonIndex), [entry.id, seasonIndex]);
  const profile = useLoad(load);

  return (
    <Drawer title={entry.name} subtitle={entry.role} onClose={onClose}>
      <div className="grid gap-5">
        <div className="flex items-center gap-3">
          <Avatar seed={entry.id} size="lg" />
          <div className="grid min-w-0 gap-0.5">
            <span className="flex items-center gap-1.5 text-base font-semibold text-neutral-800 dark:text-night-ink">
              {entry.name}
              {entry.tag && (
                <span className="rounded-full bg-[#dde8f7] px-1.5 py-px text-[10px] font-bold tracking-[.04em] text-[#073c72] dark:bg-[#6699ec]/22 dark:text-[#d3e2ff]">
                  {entry.tag}
                </span>
              )}
            </span>
            <span className="text-[13px] text-ink-soft dark:text-night-soft">
              {leagueName} · Rank #{entry.rank}
            </span>
          </div>
        </div>

        {profile.status === "ready" && (
          <>
            <div className="grid grid-cols-2 gap-2.5">
              <Stat label="Season Coins" value={<><CoinIcon /> {entry.score.toLocaleString()}</>} />
              <Stat label="Streak" value={`${profile.data.streakDays}d`} />
              <Stat label="Concepts mastered" value={profile.data.conceptsMastered} />
              <Stat label="Reinforcement checks" value={profile.data.reinforcementChecks} />
              <Stat label="Project milestones" value={profile.data.projectMilestones} />
            </div>
            <div className={`grid gap-1.5 px-4 py-3.5 ${CARD}`}>
              <span className={EYEBROW}>Recent proof</span>
              <span className="text-sm text-neutral-800 dark:text-night-ink">{profile.data.recentProof}</span>
            </div>
          </>
        )}
      </div>
    </Drawer>
  );
}
