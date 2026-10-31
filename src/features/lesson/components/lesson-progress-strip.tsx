import { ChevronLeftIcon, ChevronRightIcon } from "~/components/ui/icons";

const NAV =
  "focus-ring grid size-9 place-items-center text-[#aaa] disabled:opacity-60 max-tab:size-[34px] dark:text-[#89898e]";

type LessonProgressStripProps = {
  currentStep: number;
  totalSteps: number;
  onPrevious?: () => void;
  onNext?: () => void;
  // Turns the filled segments gold while the learner is on a streak.
  streaking: boolean;
};

// One segment per screen, with a step back and, once the current step is done, forward.
export function LessonProgressStrip({ currentStep, totalSteps, onPrevious, onNext, streaking }: LessonProgressStripProps) {
  return (
    <div
      className="mx-auto grid w-[min(100%,600px)] grid-cols-[36px_minmax(0,520px)_36px] items-center gap-3.5 max-tab:grid-cols-[34px_minmax(0,1fr)_34px] max-tab:gap-1.5"
      aria-label="Lesson navigation"
    >
      <button type="button" className={NAV} disabled={!onPrevious} onClick={onPrevious} aria-label="Previous lesson step">
        <ChevronLeftIcon className="size-[18px]" />
      </button>
      <div
        className="grid gap-[5px] max-tab:gap-[3px]"
        role="img"
        aria-label={`Lesson progress: step ${currentStep} of ${totalSteps}`}
        style={{ gridTemplateColumns: `repeat(${totalSteps}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: totalSteps }, (_, index) => (
          <span
            key={index}
            className={`h-2 rounded ${index < currentStep ? `origin-left animate-segment-in ${streaking ? "bg-[#f0c964]" : "bg-[#2986f2]"}` : "bg-[#e1e1e1] dark:bg-night-line"}`}
          />
        ))}
      </div>
      <button type="button" className={NAV} disabled={!onNext} onClick={onNext} aria-label="Next lesson step">
        <ChevronRightIcon className="size-[18px]" />
      </button>
    </div>
  );
}
