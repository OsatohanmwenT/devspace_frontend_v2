import { ArrowLeftIcon } from "~/components/ui/icons";
import { GameIcon } from "~/components/ui/game-icon";
import { TierMedal } from "~/components/ui/tier-medal";
import type { HomeLeague } from "~/types/home";

// A different avatar colour per rival row: cosmetic variety, cycled by index.
const AVATAR_COLORS = ["bg-[#f5b400]", "bg-[#8b5cf6]", "bg-[#04adc0]", "bg-[#3b82f6]"];

function promotionText({ inPromotionZone, coinsToPromotion, promoteCount }: HomeLeague) {
  if (inPromotionZone) return `In the top ${promoteCount}`;
  if (coinsToPromotion > 0) return `${coinsToPromotion} coins to top ${promoteCount}`;
  return `Top ${promoteCount} advance`;
}

type LeaguePanelProps = {
  league: HomeLeague;
  onOpenLeaderboard: () => void;
  onStartLesson: () => void;
};

// The desktop dashboard's lower half: where the learner stands in their league,
// or, before a first lesson, why they are not in one yet.
export function LeaguePanel({ league, onOpenLeaderboard, onStartLesson }: LeaguePanelProps) {
  if (!league.unlocked) {
    return (
      <span className="grid flex-1 content-center justify-items-center gap-2.5 text-center">
        <GameIcon name="shield-keyhole" className="size-[68px] drop-shadow-[0_8px_14px_rgb(0_0_0_/_0.18)]" />
        <span className="grid gap-1">
          <strong className="text-[17px] leading-tight text-neutral-800 dark:text-night-ink">It’s comeback time</strong>
          <span className="text-[13px] leading-[1.4] text-ink-soft dark:text-night-soft">Complete a lesson to claim your place in the league.</span>
        </span>
        <button
          type="button"
          className="focus-ring inline-flex items-center gap-1.5 text-[13px] font-bold text-neutral-600 hover:underline dark:text-[#b6bac4]"
          onClick={(event) => {
            event.stopPropagation();
            onStartLesson();
          }}
        >
          Continue <ArrowLeftIcon className="size-4 rotate-180" />
        </button>
      </span>
    );
  }

  return (
    <>
      <span className="flex flex-none items-center gap-2.5">
        <TierMedal color={league.color} state="current" size={34} />
        <span className="flex min-w-0 flex-1 flex-col">
          <strong className="text-[17px] leading-tight text-neutral-800 dark:text-night-ink">{league.name}</strong>
          <span className="text-xs font-semibold text-ink-soft dark:text-night-soft">
            {promotionText(league)} · {league.seasonTimeLeft}
          </span>
        </span>
        <button
          type="button"
          aria-label="View full leaderboard"
          className="focus-ring grid size-[26px] flex-none place-items-center rounded-lg text-neutral-400 hover:text-neutral-800 dark:text-neutral-500 dark:hover:text-night-ink"
          onClick={(event) => {
            event.stopPropagation();
            onOpenLeaderboard();
          }}
        >
          <svg className="size-4" viewBox="0 0 24 24" fill="none">
            <path d="M7 17 17 7M9 7h8v8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </span>

      <span className="relative isolate flex min-h-0 flex-1 flex-col justify-center gap-1 overflow-hidden">
        <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 z-10 h-12 bg-white/90 backdrop-blur-[2px] [mask-image:linear-gradient(to_bottom,black,transparent)] dark:bg-night-card/90" />
        {league.neighborsWide.slice(0, 3).map((entry, index) => (
          <span
            key={entry.id}
            className={`grid grid-cols-[28px_minmax(0,1fr)_auto] items-center gap-2 rounded-xl px-3 py-[9px] text-[15px] font-semibold ${
              entry.isCurrentUser
                ? "bg-accent/16 font-bold text-neutral-800 dark:text-[#8a8f9c]"
                : "text-neutral-700 dark:text-[#8a8f9c]"
            }`}
          >
            <span className={`font-bold tabular-nums ${entry.isCurrentUser ? "text-orange-700 dark:text-orange-300" : "text-ink-soft dark:text-[#8a8f9c]"}`}>
              {entry.rank}
            </span>
            <span className="flex min-w-0 items-center gap-2.5">
              <span
                className={`grid size-[26px] flex-none place-items-center rounded-full text-[11px] font-bold text-white ${entry.isCurrentUser ? "bg-accent" : AVATAR_COLORS[index % AVATAR_COLORS.length]}`}
              >
                {entry.name[0]?.toUpperCase()}
              </span>
              <span className="min-w-0 truncate">{entry.name}</span>
            </span>
            <span className={`text-right font-bold tabular-nums ${entry.isCurrentUser ? "text-orange-700 dark:text-orange-300" : "text-ink-soft dark:text-[#8a8f9c]"}`}>
              {entry.score}
            </span>
          </span>
        ))}
        <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-12 bg-white/90 backdrop-blur-[2px] [mask-image:linear-gradient(to_top,black,transparent)] dark:bg-night-card/90" />
      </span>
    </>
  );
}
