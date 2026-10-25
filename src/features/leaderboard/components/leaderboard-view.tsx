"use client";

import { useCallback, useEffect, useState } from "react";
import { PageIntroStages, type IntroStage } from "~/components/ui/page-intro-stages";
import { useLoad } from "~/hooks/use-load";
import { getLeaderboard, markLeaderboardIntroSeen, type LeaderboardData } from "../api/leaderboard-api";
import { OfficialBoard } from "./official-board";
import { HeadToHeadView } from "./side-views";
import { PrivateLeaguesView } from "./private-leagues-view";

type View = "official" | "h2h" | "private";

const INTROS: Record<View, { id: string; stages: IntroStage[]; action: string; label: string }> = {
  official: {
    id: "leaderboard",
    action: "See the board",
    label: "About leagues",
    stages: [
      { title: "Welcome to Leagues", body: "Track your progress with other learners on a seasonal leaderboard.", mood: "neutral" },
      { title: "Earn Devy Coins to get ahead", body: "Finish lessons and practice sessions to climb this season’s standings.", mood: "neutral" },
      { title: "Level up each season", body: "When the season ends, the top of the board moves up to a tougher league.", mood: "celebrating" },
    ],
  },
  h2h: {
    id: "h2h",
    action: "See this week's matchup",
    label: "About head-to-head",
    stages: [
      { title: "Weekly rivalries", body: "Each week you’re matched one-on-one against a rival, with the whole matchup visible as it happens.", mood: "neutral" },
      { title: "Win = 3, draw = 1, loss = 0", body: "Whoever earns more verified Devy Coins during the week wins the matchup. Points add up all season.", mood: "neutral" },
      { title: "Rivalry only", body: "Head-to-head never touches your official coins, rank, or rewards — it’s bragging rights, not another economy.", mood: "celebrating" },
    ],
  },
  private: {
    id: "private-leagues",
    action: "See private leagues",
    label: "About private leagues",
    stages: [
      { title: "Compete with your circle", body: "Create a league or join one with a code to race friends, separate from the official board.", mood: "neutral" },
      { title: "Same coins, just among friends", body: "Private leagues use your Season Devy Coins. Your official rank stays unchanged.", mood: "neutral" },
      { title: "Invite with a code", body: "Share your invite code or link so friends can jump straight in.", mood: "celebrating" },
    ],
  },
};

function LeaderboardContent({ data }: { data: LeaderboardData }) {
  const [view, setView] = useState<View>("official");
  const [seen, setSeen] = useState(data.seen);
  const intro = INTROS[view];

  if (!seen[intro.id]) {
    return (
      <PageIntroStages
        stages={intro.stages}
        finalActionLabel={intro.action}
        ariaLabel={intro.label}
        onDone={() => {
          markLeaderboardIntroSeen(intro.id);
          setSeen({ ...seen, [intro.id]: true });
        }}
      />
    );
  }
  if (view === "h2h") return <HeadToHeadView data={data} onBack={() => setView("official")} />;
  if (view === "private") return <PrivateLeaguesView onBack={() => setView("official")} />;
  return <OfficialBoard data={data} onOpenView={setView} />;
}

const REFRESH_MS = 60 * 1000;

export function LeaderboardView() {
  // Rival totals advance with the clock, so the board is re-fetched every
  // minute and visibly moves while the page is open.
  const [clock, setClock] = useState<number | null>(null);
  const load = useCallback(() => getLeaderboard(clock ?? Date.now()), [clock]);
  const result = useLoad(load);

  useEffect(() => {
    const timer = window.setInterval(() => setClock(Date.now()), REFRESH_MS);
    return () => window.clearInterval(timer);
  }, []);

  if (result.status !== "ready" || !result.data) return <main className="min-h-dvh" aria-busy="true" />;
  return <LeaderboardContent data={result.data} />;
}
