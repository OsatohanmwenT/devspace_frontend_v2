"use client";

import { useMemo, useState } from "react";
import type { LeaderboardEntry } from "~/types/leaderboard";
import type { LeaderboardData } from "../api/leaderboard-api";
import { getBoardWindow } from "../lib/board-window";
import { getZoneSummary } from "../lib/zone-summary";
import { CompetitorDrawer } from "./competitor-drawer";
import { LeagueHeader } from "./league-header";
import { LockedBoardSkeleton } from "./locked-board";
import { StandingsList } from "./standings-list";

type OfficialBoardProps = {
  data: LeaderboardData;
  onOpenView: (view: "h2h" | "private") => void;
};

export function OfficialBoard({ data, onOpenView }: OfficialBoardProps) {
  const [selected, setSelected] = useState<LeaderboardEntry | null>(null);
  // Until the learner has earned something this season they are not really in
  // the league, and a stranger's board with them last is the wrong first impression.
  const joined = data.seasonCoins > 0;

  const items = useMemo(() => {
    const summary = getZoneSummary(data.standings, data.league);
    return summary ? getBoardWindow(data.standings, summary) : [];
  }, [data.standings, data.league]);

  return (
    <main className="mx-auto grid w-[min(100%,1160px)] gap-8 px-[22px] pt-8 pb-16 max-[900px]:px-[18px] max-tab:pt-6" aria-label="Leaderboard">
      <LeagueHeader data={data} joined={joined} onOpenView={onOpenView} />

      {joined ? (
        <div className="mx-auto grid w-full max-w-[860px] gap-6">
          <StandingsList label={`${data.league.name} standings`} items={items} onSelect={setSelected} />
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
