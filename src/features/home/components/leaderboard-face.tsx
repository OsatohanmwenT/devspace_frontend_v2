import type { HomeLeague } from "~/types/home";
import { TierMedal } from "~/components/ui/tier-medal";
import { CardCta } from "./card-cta";
import { LeaguePanel } from "./league-panel";

type LeaderboardFaceProps = {
  league: HomeLeague;
  onOpenLeaderboard: () => void;
  onStartLesson: () => void;
};

// The Leaderboard card on tablet and phone, with the reference's locked state
// until the learner has earned a place in the season.
export function LeaderboardFace({ league, onOpenLeaderboard, onStartLesson }: LeaderboardFaceProps) {
  if (!league.unlocked) {
    return (
      <>
        <span className="flex w-full items-center gap-2.5">
          <TierMedal color={league.color} state="current" size={34} />
          <span className="text-sm font-semibold text-ink-soft max-tab:text-xs dark:text-[#b6bac4]">Leaderboard</span>
        </span>
        <span className="flex w-full flex-1 flex-col items-center justify-center gap-3 text-center">
          <span className="relative grid place-items-center">
            <span className="absolute size-20 rounded-full bg-accent/35 blur-2xl" aria-hidden="true" />
            <span className="relative"><TierMedal color={league.color} state="locked" size={64} /></span>
          </span>
          <strong className="text-[19px] font-bold text-neutral-800 max-tab:text-lg dark:text-night-ink">It’s comeback time</strong>
          <span className="text-[11px] font-medium text-ink-soft dark:text-night-soft">Complete a lesson to claim your place in the league.</span>
        </span>
        <CardCta
          className="min-h-[52px] text-[17px] max-tab:text-[15px]"
          onClick={(event) => {
            event.stopPropagation();
            onStartLesson();
          }}
        >
          Start lesson
        </CardCta>
      </>
    );
  }

  return (
    <>
      <span className="flex min-h-0 w-full flex-1 flex-col gap-2 pt-2">
        <LeaguePanel league={league} onOpenLeaderboard={onOpenLeaderboard} onStartLesson={onStartLesson} />
      </span>
      <CardCta
        className="min-h-[52px] text-[17px] max-tab:text-[15px]"
        onClick={(event) => {
          event.stopPropagation();
          onOpenLeaderboard();
        }}
      >
        View leaderboard
      </CardCta>
    </>
  );
}
