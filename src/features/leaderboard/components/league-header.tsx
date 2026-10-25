import { useRouter } from "next/navigation";
import { InfoTooltip } from "~/components/ui/info-tooltip";
import { ForwardLink } from "~/components/ui/nav-link";
import { useToast } from "~/providers/toast-provider";
import type { LeaderboardData } from "../api/leaderboard-api";
import { LeagueJoinPrompt } from "./locked-board";
import { LeagueLadder } from "./league-ladder";

export const COINS_TO_JOIN = 5;

type LeagueHeaderProps = {
  data: LeaderboardData;
  joined: boolean;
  onOpenView: (view: "h2h" | "private") => void;
};

// The header explains the league: where it sits on the ladder, how it is
// decided and, until the learner has joined, the one thing to do next.
export function LeagueHeader({ data, joined, onOpenView }: LeagueHeaderProps) {
  const router = useRouter();
  const toast = useToast();
  const { league } = data;
  const you = data.standings.find((entry) => entry.isCurrentUser);
  const nextLeague = data.ladder[data.leagueIndex + 1];

  const rule =
    league.promoteCount > 0 && league.demoteCount > 0
      ? `Top ${league.promoteCount} advance · bottom ${league.demoteCount} drop`
      : league.promoteCount > 0
        ? `Top ${league.promoteCount} advance to ${nextLeague?.name}`
        : `Hold your place · bottom ${league.demoteCount} drop`;

  const shareStanding = async () => {
    if (!you) return;
    try {
      await navigator.clipboard.writeText(`I'm #${you.rank} in ${league.name} on Devspace!`);
      toast("Standing copied");
    } catch {
      toast(`You’re #${you.rank} in ${league.name}`);
    }
  };

  return (
    <div className="mx-auto grid w-full max-w-[860px] justify-items-center gap-3 rounded-3xl bg-white px-6 py-5 text-center shadow-[0_1px_3px_rgba(20,20,20,0.06)] max-tab:px-4 dark:bg-[#1a1a1c] dark:shadow-none">
      <div className="flex w-full flex-wrap items-center justify-end gap-x-5 gap-y-1">
        <ForwardLink onClick={() => onOpenView("h2h")}>Head-to-head</ForwardLink>
        <ForwardLink onClick={() => onOpenView("private")}>Private leagues</ForwardLink>
      </div>
      <LeagueLadder tiers={data.ladder} currentIndex={data.leagueIndex} />
      <div className="flex items-center gap-2">
        <h1 className="m-0 mt-1 text-3xl leading-tight font-semibold text-neutral-800 dark:text-night-ink">{league.name}</h1>
        <InfoTooltip label="How the leaderboard works">
          Everyone in your league is ranked by Season Devy Coins earned this season: verified lessons and practice count, repeats don&apos;t. Standings reset every season.{" "}
          {league.promoteCount > 0 ? `Finish in the top ${league.promoteCount} to move up a league.` : "This is the top league, so there’s nowhere higher to climb."}{" "}
          {league.demoteCount > 0 ? `Finish in the bottom ${league.demoteCount} and you’ll drop one.` : "You can’t drop below this league."}
        </InfoTooltip>
      </div>
      <p className="m-0 text-[15px] leading-normal text-ink-soft dark:text-night-soft">{rule}</p>
      {joined ? (
        <button type="button" className="focus-ring mt-1 rounded-md text-[13px] font-medium text-[#3d77eb] hover:underline dark:text-[#89baff]" onClick={shareStanding}>
          Share your standing
        </button>
      ) : (
        <LeagueJoinPrompt coinsToJoin={COINS_TO_JOIN} actionLabel="Explore your path" onAction={() => router.push(`/paths/${data.pathId}`)} />
      )}
    </div>
  );
}
