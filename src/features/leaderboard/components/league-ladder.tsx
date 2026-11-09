import { TierMedal } from "~/components/ui/tier-medal";
import type { LeaderboardLadderTier } from "../api/leaderboard-api";

// Tiers shrink and fade as they recede from the learner's own.
const SIZE_BY_DISTANCE = [136, 76, 58, 44];
const OPACITY_BY_DISTANCE = [1, 0.68, 0.42, 0.24];
const SR_ONLY = "absolute -m-px h-px w-px overflow-hidden whitespace-nowrap border-0 p-0 [clip:rect(0,0,0,0)]";

const at = (scale: number[], distance: number) => scale[Math.min(distance, scale.length - 1)];
const shortName = (name: string) => name.replace(" League", "");

type LeagueLadderProps = {
  tiers: LeaderboardLadderTier[];
  currentIndex: number;
};

// Every league, with the learner's own lit up in the middle: reached ones
// trail off to the left, ones still to climb to the right.
export function LeagueLadder({ tiers, currentIndex }: LeagueLadderProps) {
  const current = tiers[currentIndex];

  return (
    <div className="relative flex w-full items-center overflow-hidden py-4" aria-label="League progression" role="list">
      <div className="flex min-w-0 flex-1 justify-end gap-6 max-tab:gap-3">
        {tiers.slice(0, currentIndex).map((tier, index) => {
          const distance = currentIndex - index;
          return (
            <div key={tier.id} className="grid w-[84px] flex-none justify-items-center gap-2" role="listitem" style={{ opacity: at(OPACITY_BY_DISTANCE, distance) }}>
              <TierMedal color={tier.color} state="default" size={at(SIZE_BY_DISTANCE, distance)} />
              <span className={SR_ONLY}>{shortName(tier.name)} — unlocked</span>
            </div>
          );
        })}
      </div>
      <div className="grid w-[136px] flex-none justify-items-center gap-2 mx-4 max-tab:mx-2" role="listitem">
        <TierMedal color={current.color} state="current" size={SIZE_BY_DISTANCE[0]} />
        <small className="text-[11px] font-semibold tracking-[.06em] text-ink-soft uppercase dark:text-night-soft">{shortName(current.name)}</small>
        <span className={SR_ONLY}>{current.name} — your league</span>
      </div>
      <div className="flex min-w-0 flex-1 gap-6 max-tab:gap-3">
        {tiers.slice(currentIndex + 1).map((tier, offset) => (
          <div key={tier.id} className="grid w-[84px] flex-none justify-items-center gap-2" role="listitem" style={{ opacity: at(OPACITY_BY_DISTANCE, offset + 1) }}>
            <TierMedal color={tier.color} state="locked" size={at(SIZE_BY_DISTANCE, offset + 1)} />
            <span className={SR_ONLY}>{shortName(tier.name)} — locked</span>
          </div>
        ))}
      </div>
    </div>
  );
}
