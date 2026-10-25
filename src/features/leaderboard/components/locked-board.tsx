import { Button } from "~/components/ui/button";
import { CoinIcon, GameIcon } from "~/components/ui/game-icon";
import { ROW_GRID } from "./leaderboard-row";

const SKELETON_WIDTHS = ["58%", "72%", "44%", "66%", "52%", "78%"];
const BONE = "bg-[#ececea] dark:bg-[#2e2e2e]";

function SkeletonRow({ width }: { width: string }) {
  return (
    <div className={ROW_GRID}>
      <span className={`size-2.5 justify-self-center rounded-full ${BONE}`} />
      <span className={`size-10 rounded-full max-tab:size-[34px] ${BONE}`} />
      <span className="grid gap-1.5">
        <span className={`h-2.5 rounded-full ${BONE}`} style={{ width }} />
        <span className="h-2 w-[34%] rounded-full bg-[#f2f2f0] dark:bg-[#282828]" />
      </span>
      <span className={`h-2.5 w-12 rounded-full ${BONE}`} />
    </div>
  );
}

type LeagueJoinPromptProps = {
  coinsToJoin: number;
  onAction: () => void;
  actionLabel: string;
};

// Lives inside the league card rather than under it, so the one action on the
// page is visible on arrival. Devy is already warming up and waiting for the
// learner to join: eager, not disappointed.
export function LeagueJoinPrompt({ coinsToJoin, onAction, actionLabel }: LeagueJoinPromptProps) {
  return (
    <div className="mt-1 flex w-full items-center gap-4 border-t border-[#ebe9e4] pt-5 text-left max-tab:flex-col max-tab:gap-3 max-tab:text-center dark:border-night-line">
      <GameIcon name="devy-dumbbell" className="h-[92px] w-[120px] flex-none max-tab:h-[78px] max-tab:w-[102px]" />
      <div className="grid min-w-0 flex-1 gap-1">
        <strong className="text-[15px] font-semibold text-neutral-800 dark:text-night-ink">You’re not on this season’s board yet</strong>
        <span className="text-sm leading-normal text-ink-soft dark:text-night-soft">
          Earn {coinsToJoin} <CoinIcon /> to join. One lesson does it.
        </span>
      </div>
      <Button className="min-h-[50px] flex-none px-6 text-[15px] font-medium max-tab:w-full" onClick={onAction}>
        {actionLabel}
      </Button>
    </div>
  );
}

// Standings stay hidden until the learner has joined the season.
export function LockedBoardSkeleton() {
  return (
    <div
      className="grid rounded-2xl border border-[#eeeeeb] bg-white p-1.5 shadow-[0_2px_6px_rgba(20,20,20,0.06)] dark:border-night-line dark:bg-night-card dark:shadow-none"
      aria-label="Standings are hidden until you join this season's league"
    >
      {SKELETON_WIDTHS.map((width) => (
        <SkeletonRow key={width} width={width} />
      ))}
    </div>
  );
}
