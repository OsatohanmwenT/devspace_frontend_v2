import { assetUrl } from "~/config/assets";
import { GameIcon } from "~/components/ui/game-icon";
import { RocketIcon } from "~/components/ui/icons";
import type { HomeData } from "~/types/home";
import { CardCta } from "./card-cta";
import { IconChip } from "./icon-chip";

type PortfolioFaceProps = {
  data: HomeData;
  onOpen: () => void;
};

// The "Your work" card on tablet and phone: who the learner is and what they
// have built so far, with Devy mid-workout leaning in from the right edge.
export function PortfolioFace({ data, onOpen }: PortfolioFaceProps) {
  const { learner, stats } = data;
  const displayName = learner.name || "Learner";
  const lessons = stats.completedLessonsCount;

  return (
    <>
      <span className="flex w-full items-center gap-2.5">
        <IconChip icon={RocketIcon} tone="violet" />
        <span className="text-sm font-semibold text-ink-soft max-tab:text-xs dark:text-[#b6bac4]">Your work</span>
      </span>

      <span className="flex w-full flex-1 flex-col justify-center gap-2.5">
        <span className="flex min-w-0 items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element -- small avatar */}
          <img
            className="size-11 flex-none rounded-[14px] bg-accent/14 object-cover max-tab:size-10"
            src={assetUrl(learner.avatarUrl)}
            alt=""
          />
          <span className="min-w-0">
            <strong className="block truncate text-base leading-tight text-neutral-800 dark:text-night-ink">{displayName}</strong>
            <span className="block truncate text-xs text-ink-soft dark:text-night-soft">{learner.headline}</span>
          </span>
        </span>
        <span className="flex flex-wrap gap-1.5 text-xs font-semibold whitespace-nowrap text-[#2563eb] dark:text-[#88bdf2]">
          <span className="rounded-full bg-accent/12 px-2.5 py-[3px]">
            <b className="font-extrabold text-[#2563eb] dark:text-[#88bdf2]">{lessons}</b> lesson{lessons === 1 ? "" : "s"}
          </span>
          <span className="rounded-full bg-accent/12 px-2.5 py-[3px]">
            <b className="font-extrabold text-[#2563eb] dark:text-[#88bdf2]">{stats.longestStreak}</b>-day best streak
          </span>
        </span>
        {lessons === 0 && (
          <span className="max-w-[26ch] text-[13px] leading-snug font-semibold text-neutral-800 max-tab:text-xs dark:text-night-ink">
            Finish your first lesson and your work starts showing up here.
          </span>
        )}
      </span>

      <GameIcon name="devy-dumbbell" className="pointer-events-none absolute right-0 bottom-[84px] h-20 w-auto max-tab:bottom-[72px] max-tab:h-16" />

      <CardCta
        className="min-h-[52px] text-[17px] max-tab:text-[15px]"
        onClick={(event) => {
          event.stopPropagation();
          onOpen();
        }}
      >
        {lessons === 0 ? "Explore first project" : "View portfolio"}
      </CardCta>
    </>
  );
}
