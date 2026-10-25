import type { ReactNode } from "react";

type PathProgressCardProps = {
  title: string;
  subtitle: ReactNode;
  // Percent complete; leave out to show `badge` in its place.
  progress?: number;
  badge?: string;
  actionLabel: string;
  onOpen: () => void;
};

// One shell for every card under "Your progress", the active path and any
// paused custom paths alike. Same size, padding and bottom row; only the
// content differs.
export function PathProgressCard({ title, subtitle, progress, badge, actionLabel, onOpen }: PathProgressCardProps) {
  return (
    <button
      type="button"
      data-cuelume-press="pulse"
      data-cuelume-release="release"
      aria-label={`${actionLabel} ${title}`}
      onClick={onOpen}
      className="focus-ring flex h-full min-h-[164px] w-full flex-col items-start justify-between gap-5 rounded-2xl border border-[#d4d4d4] bg-white px-5 py-4 text-left shadow-[0_2px_6px_rgba(20,20,20,0.06)] transition-[border-color,background,transform] duration-150 hover:-translate-y-0.5 hover:bg-[#fafafa] max-tab:min-h-0 max-tab:gap-4 dark:border-night-line dark:bg-night-card dark:shadow-none dark:hover:border-[#525252] dark:hover:bg-[#252525]"
    >
      <div className="grid w-full min-w-0 gap-0.5">
        <h3 className="truncate text-[19px] font-medium text-neutral-800 dark:text-night-ink">{title}</h3>
        <p className="line-clamp-2 text-[13px] leading-normal text-ink-soft dark:text-night-soft">{subtitle}</p>
      </div>
      <span className="flex w-full items-center gap-3">
        {progress === undefined ? (
          <span className="flex-1">
            {badge && (
              <span className="inline-flex rounded-full bg-[#e2f6e8] px-2 py-1 text-[10px] font-bold tracking-[.08em] text-[#168a46] uppercase dark:bg-[#1d3b2a] dark:text-[#8ee6ad]">
                {badge}
              </span>
            )}
          </span>
        ) : (
          <span className="relative h-2 flex-1 overflow-hidden rounded-full bg-[#ececea] dark:bg-[#333336]" aria-hidden="true">
            <span className="absolute inset-y-0 left-0 rounded-full bg-[#16a34a]" style={{ width: `${progress}%` }} />
          </span>
        )}
        <span className="flex-none rounded-lg bg-[#16a34a] px-3 py-2 text-[13px] font-semibold text-white">{actionLabel}</span>
      </span>
    </button>
  );
}
