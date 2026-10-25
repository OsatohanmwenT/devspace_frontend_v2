import { Avatar } from "~/components/ui/avatar";
import { TrophyIcon } from "~/components/ui/icons";
import type { LeaderboardEntry } from "~/types/leaderboard";

// Shared with the locked board's skeleton, which has to agree column for column
// or the placeholder rows stop lining up with the real ones.
export const ROW_GRID =
  "grid grid-cols-[28px_40px_minmax(0,1fr)_auto] items-center gap-3.5 p-3.5 max-tab:grid-cols-[22px_34px_minmax(0,1fr)_auto] max-tab:gap-2.5 max-tab:p-2.5";

const PODIUM_COLORS = ["text-[#b8860b] dark:text-[#ffcf8b]", "text-[#8a8d97] dark:text-[#c7c9d1]", "text-[#a35a25] dark:text-[#d98a52]"];
const SR_ONLY = "absolute -m-px h-px w-px overflow-hidden whitespace-nowrap border-0 p-0 [clip:rect(0,0,0,0)]";

type LeaderboardRowProps = {
  entry: LeaderboardEntry;
  // Opens the competitor drawer. Inspecting yourself is not a thing, so the
  // learner's own row stays plain either way.
  onSelect?: (entry: LeaderboardEntry) => void;
};

export function LeaderboardRow({ entry, onSelect }: LeaderboardRowProps) {
  const podium = PODIUM_COLORS[entry.rank - 1];
  const interactive = Boolean(onSelect) && !entry.isCurrentUser;
  const className = `${ROW_GRID} ${
    entry.isCurrentUser
      ? "my-1 rounded-2xl border border-[#b9d4f7] bg-[#e9f2ff] dark:border-[#8bb5f5] dark:bg-[#2a293c]"
      : "rounded-xl border border-transparent transition-colors duration-150 hover:bg-[#f3f1ec] dark:hover:bg-[#262626]"
  } ${interactive ? "w-full cursor-pointer text-left" : ""}`;

  const content = (
    <>
      <span className={`grid place-items-center text-center text-[13px] ${podium ?? "text-[#737371] dark:text-[#7d7d80]"}`}>
        <span aria-hidden="true">{podium ? <TrophyIcon className="size-[18px]" /> : entry.rank}</span>
        <span className={SR_ONLY}>Rank {entry.rank}</span>
      </span>
      <Avatar seed={entry.id} />
      <div className="grid min-w-0">
        <span className="flex items-center gap-1.5 text-sm font-semibold text-neutral-800 dark:text-night-ink">
          {entry.name}
          {entry.tag && (
            <span className="rounded-full bg-[#dde8f7] px-1.5 py-px text-[10px] font-bold tracking-[.04em] text-[#073c72] dark:bg-[#6699ec]/22 dark:text-[#d3e2ff]">
              {entry.tag}
            </span>
          )}
        </span>
        <span className="truncate text-xs text-ink-soft dark:text-night-soft">{entry.role}</span>
      </div>
      <div className="grid justify-items-end gap-0.5">
        <span className={`text-sm whitespace-nowrap text-neutral-800 tabular-nums dark:text-night-ink ${entry.isCurrentUser ? "font-semibold" : ""}`}>
          {entry.score.toLocaleString()}
        </span>
      </div>
    </>
  );

  return interactive ? (
    <button type="button" className={`focus-ring ${className}`} onClick={() => onSelect?.(entry)}>
      {content}
    </button>
  ) : (
    <div className={className}>{content}</div>
  );
}
