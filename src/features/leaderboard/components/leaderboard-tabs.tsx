import { LockIcon } from "~/components/ui/icons";

const TAB =
  "focus-ring relative z-10 flex min-h-8 items-center justify-center gap-1.5 rounded-lg px-3 py-1 text-[13px] font-medium";

type LeaderboardTabsProps<T extends string> = {
  tabs: readonly T[];
  active: T;
  onSelect: (tab: T) => void;
  // A locked tab still looks and behaves like a tab; it just routes the click
  // somewhere else. Nothing here knows what unlocks it.
  lockedTabs?: readonly T[];
  onLockedSelect: (tab: T) => void;
};

export function LeaderboardTabs<T extends string>({ tabs, active, onSelect, lockedTabs = [], onLockedSelect }: LeaderboardTabsProps<T>) {
  const activeIndex = Math.max(0, tabs.indexOf(active));

  return (
    <div className="relative mx-auto grid w-[324px] max-w-full grid-cols-3 rounded-full bg-[#f1efe9] p-1 dark:bg-[#1e1e1e]" role="group" aria-label="Leaderboard range">
      <span
        aria-hidden="true"
        className="absolute inset-y-1 left-1 w-[calc((100%-8px)/3)] rounded-full bg-white transition-transform duration-200 ease-out motion-reduce:transition-none dark:bg-[#262626]"
        style={{ transform: `translateX(${activeIndex * 100}%)` }}
      />
      {tabs.map((tab) => {
        const locked = lockedTabs.includes(tab);
        const isActive = !locked && tab === active;
        return (
          <button
            key={tab}
            type="button"
            aria-pressed={isActive}
            onClick={() => (locked ? onLockedSelect(tab) : onSelect(tab))}
            className={`${TAB} transition-colors duration-200 ${
              isActive
                ? "text-neutral-800 dark:text-night-ink"
                : "text-ink-soft hover:text-neutral-700 dark:text-night-soft dark:hover:text-night-ink"
            }`}
          >
            {tab}
            {locked && (
              <>
                <LockIcon className="size-3 flex-none" />
                <span className="absolute -m-px h-px w-px overflow-hidden whitespace-nowrap border-0 p-0 [clip:rect(0,0,0,0)]">Premium</span>
              </>
            )}
          </button>
        );
      })}
    </div>
  );
}
