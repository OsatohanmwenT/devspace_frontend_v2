"use client";

import { useMemo, useState } from "react";
import { useToast } from "~/providers/toast-provider";
import type { LeaderboardEntry } from "~/types/leaderboard";
import type { LeaderboardData } from "../api/leaderboard-api";
import { getBoardWindow, type BoardItem } from "../lib/board-window";
import { getZoneSummary } from "../lib/zone-summary";
import { CompetitorDrawer } from "./competitor-drawer";
import { LeaderboardTabs } from "./leaderboard-tabs";
import { LeagueHeader } from "./league-header";
import { LockedBoardSkeleton } from "./locked-board";
import { StandingsList } from "./standings-list";

const TABS = ["This season", "All time", "By path"] as const;
type Tab = (typeof TABS)[number];

const asRows = (entries: LeaderboardEntry[]): BoardItem[] => entries.map((entry) => ({ type: "row", entry }));

type OfficialBoardProps = {
  data: LeaderboardData;
  onOpenView: (view: "h2h" | "private") => void;
};

export function OfficialBoard({ data, onOpenView }: OfficialBoardProps) {
  const toast = useToast();
  const [tab, setTab] = useState<Tab>("This season");
  const [selected, setSelected] = useState<LeaderboardEntry | null>(null);
  // Until the learner has earned something this season they are not really in
  // the league, and a stranger's board with them last is the wrong first impression.
  const joined = data.seasonCoins > 0;

  const items = useMemo(() => {
    const summary = getZoneSummary(data.standings, data.league);
    if (!summary) return [];
    if (tab === "This season") return getBoardWindow(data.standings, summary);
    const byPath = data.standings.filter((entry) => entry.role === summary.user.role).map((entry, index) => ({ ...entry, rank: index + 1 }));
    return asRows(byPath);
  }, [data.standings, data.league, tab]);

  // All-time standings and the full cohort come with Pro, which arrives with plans.
  const comingSoon = () => toast("Devspace Pro coming soon");

  return (
    <main className="mx-auto grid w-[min(100%,1160px)] gap-8 px-[22px] pt-8 pb-16 max-[900px]:px-[18px] max-tab:pt-6" aria-label="Leaderboard">
      <LeagueHeader data={data} joined={joined} onOpenView={onOpenView} />

      {joined ? (
        <div className="mx-auto grid w-full max-w-[860px] gap-6">
          <LeaderboardTabs tabs={TABS} active={tab} onSelect={setTab} lockedTabs={["All time"]} onLockedSelect={comingSoon} />
          <StandingsList
            label={`${data.league.name} standings`}
            items={items}
            canExpand={false}
            onExpand={comingSoon}
            onSelect={tab === "This season" ? setSelected : undefined}
          />
        </div>
      ) : (
        <div className="mx-auto w-full max-w-[860px]">
          <LockedBoardSkeleton />
        </div>
      )}

      {selected && <CompetitorDrawer entry={selected} leagueName={data.league.name} seasonIndex={data.seasonIndex} onClose={() => setSelected(null)} />}
    </main>
  );
}
