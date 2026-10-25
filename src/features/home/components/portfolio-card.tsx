import { assetUrl } from "~/config/assets";
import { GameIcon } from "~/components/ui/game-icon";
import type { HomeData } from "~/types/home";
import { ACCENTS, accentStyle } from "../lib/accents";

// The desktop's "Your work" row: who the learner is and what they have done so
// far, with Devy leaning in from the corner.
export function PortfolioCard({ data, onOpen }: { data: HomeData; onOpen: () => void }) {
  const { learner, stats } = data;
  const displayName = learner.name || "Learner";
  const modules = stats.completedLessonsCount;

  return (
    <button
      type="button"
      className="focus-ring group relative flex h-[120px] w-full cursor-pointer flex-col overflow-hidden rounded-3xl border border-accent/30 bg-white px-5 py-[18px] text-left transition-[border-color,background-color] duration-200 hover:border-accent/60 dark:border-accent/35 dark:bg-night-card dark:hover:border-accent/90 dark:hover:bg-[#252525]"
      style={accentStyle(ACCENTS.portfolio)}
      aria-label={`Open profile: ${displayName}`}
      onClick={onOpen}
    >
      <span className="absolute top-3.5 right-3.5 grid size-[26px] place-items-center text-neutral-400 dark:text-neutral-500" aria-hidden="true">
        <svg className="size-4" viewBox="0 0 24 24" fill="none">
          <path d="M7 17 17 7M9 7h8v8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>

      <span className="flex min-h-0 flex-1 flex-col justify-between pr-[84px]">
        <span className="flex min-w-0 items-center gap-3 pr-5">
          {/* eslint-disable-next-line @next/next/no-img-element -- small avatar */}
          <img
            className="size-11 flex-none rounded-[14px] bg-accent/14 object-cover"
            src={assetUrl(learner.avatarUrl)}
            alt=""
          />
          <span className="min-w-0">
            <strong className="block truncate text-base leading-tight text-neutral-800 dark:text-night-ink">
              {displayName}
            </strong>
            <span className="mt-px block truncate text-[13px] font-medium text-ink-soft dark:text-night-soft">
              {learner.headline}
            </span>
          </span>
        </span>
        <span className="flex flex-wrap gap-1.5 text-xs font-semibold whitespace-nowrap text-[#2563eb] dark:text-[#88bdf2]">
          <span className="rounded-full bg-accent/12 px-2.5 py-[3px]">
            <b className="font-extrabold text-[#2563eb] dark:text-[#88bdf2]">{modules}</b> module{modules === 1 ? "" : "s"}
          </span>
          <span className="rounded-full bg-accent/12 px-2.5 py-[3px]">
            <b className="font-extrabold text-[#2563eb] dark:text-[#88bdf2]">{stats.longestStreak}</b>-day best streak
          </span>
        </span>
      </span>

      <GameIcon
        name="devy-dumbbell"
        className="absolute -right-0.5 -bottom-1 h-[86px] w-auto origin-bottom-right transition-transform duration-[260ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:-rotate-[4deg]"
      />
    </button>
  );
}
