import { DevyLottie } from "~/components/devy";
import { Button } from "~/components/ui/button";
import { DailyQuestProgress } from "~/components/ui/daily-quest-progress";
import { GameIcon } from "~/components/ui/game-icon";
import type { LessonReward } from "~/types/lesson";

// The daily quests this lesson just moved, filling up: so the quests are seen
// where they are earned, not only when someone opens the checklist on Home.
export function QuestProgressScreen({ quests, onContinue }: { quests: NonNullable<LessonReward["quests"]>; onContinue: () => void }) {
  const doneCount = quests.after.filter((quest) => quest.done).length;
  const allDone = doneCount === quests.after.length;

  return (
    <section className="flex h-full flex-col overflow-auto bg-white dark:bg-[#1f1f1f]" aria-labelledby="quest-progress-title">
      <div className="grid flex-1 place-items-center px-7 py-10 max-tab:px-5">
        <div className="grid w-full max-w-[520px] justify-items-center text-center">
          {/* All three done earns the treasure-chest Devy, the day's haul; part
              way through it is the regular celebration. */}
          {allDone ? <GameIcon name="devy-treasure-chest" className="mb-4 size-36" /> : <DevyLottie clip="lesson-complete" loop={false} className="mb-5 size-28" />}
          <h1 id="quest-progress-title" className="m-0 text-[clamp(26px,3.4vw,32px)] leading-[1.12] font-semibold text-neutral-800 dark:text-night-ink">
            {allDone ? "Daily quests complete!" : "Daily quest progress"}
          </h1>
          <p className="mt-2 mb-0 text-[15px] text-ink-soft dark:text-[#b2b2b6]">{allDone ? "All three done for today. See you tomorrow." : `${doneCount} of ${quests.after.length} done today`}</p>
          <DailyQuestProgress before={quests.before} after={quests.after} className="mt-7" />
        </div>
      </div>
      <div className="flex shrink-0 justify-center px-6 pt-2 pb-7 max-tab:px-4 max-tab:pb-5">
        <Button className="min-h-14 w-full max-w-[560px] text-[17px] font-semibold" onClick={onContinue} autoFocus>
          Continue
        </Button>
      </div>
    </section>
  );
}
