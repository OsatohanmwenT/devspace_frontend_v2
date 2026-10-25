import { CoinIcon } from "~/components/ui/game-icon";
import type { LeaderboardEntry } from "~/types/leaderboard";
import type { BoardItem } from "../lib/board-window";
import { LeaderboardRow } from "./leaderboard-row";

function ZoneDivider({ label, className, line }: { label: string; className: string; line: string }) {
  return (
    <div className={`mx-1 my-1.5 flex items-center gap-2.5 text-[11px] font-bold tracking-[.08em] uppercase ${className}`} role="separator" aria-label={label}>
      <span className={`h-px flex-1 opacity-50 ${line}`} />
      {label}
      <span className={`h-px flex-1 opacity-50 ${line}`} />
    </div>
  );
}

function HiddenRows({ count, locked, onExpand }: { count: number; locked: boolean; onExpand: () => void }) {
  return (
    <button
      type="button"
      onClick={onExpand}
      className="focus-ring w-full rounded-lg py-2 text-[11px] font-semibold tracking-[.06em] text-[#737371] uppercase transition-colors hover:text-neutral-700 dark:text-[#7d7d80] dark:hover:text-night-ink"
    >
      ··· {count} more{locked ? " · Premium" : ""}
    </button>
  );
}

type StandingsListProps = {
  label: string;
  items: BoardItem[];
  // Whether the rest of the cohort can be revealed; otherwise the gap routes to Premium.
  canExpand: boolean;
  onExpand: () => void;
  onSelect?: (entry: LeaderboardEntry) => void;
};

export function StandingsList({ label, items, canExpand, onExpand, onSelect }: StandingsListProps) {
  return (
    <ol className="m-0 grid list-none overflow-hidden rounded-3xl bg-white p-1.5 shadow-[0_1px_3px_rgba(20,20,20,0.06)] dark:bg-[#1a1a1c] dark:shadow-none" aria-label={label}>
      <li className="grid grid-cols-[minmax(0,1fr)_auto] gap-3.5 px-4 pt-3 pb-2 text-[10px] font-semibold tracking-[.08em] text-[#737371] uppercase dark:text-[#7d7d80]">
        <span>Learner</span>
        <CoinIcon className="text-sm" />
      </li>
      {items.map((item, index) => {
        switch (item.type) {
          case "gap":
            return (
              <li key={`gap-${index}`}>
                <HiddenRows count={item.hiddenCount} locked={!canExpand} onExpand={onExpand} />
              </li>
            );
          case "promotion-line":
            return (
              <li key="promotion-line">
                <ZoneDivider label="Promotion zone ends" className="text-[#04adc0]" line="bg-[#04adc0]" />
              </li>
            );
          case "demotion-line":
            return (
              <li key="demotion-line">
                <ZoneDivider label="Demotion zone starts" className="text-[#ff676d]" line="bg-[#ff676d]" />
              </li>
            );
          case "row":
            return (
              <li key={item.entry.id} className="border-t border-[#ebe9e4] first:border-t-0 dark:border-night-line">
                <LeaderboardRow entry={item.entry} onSelect={onSelect} />
              </li>
            );
        }
      })}
    </ol>
  );
}
