import { DevyMood } from "~/components/devy";
import { Button } from "~/components/ui/button";

// A dead end is Devy's problem, not the learner's: the annoyance is pointed at
// the missing content.
export function UnavailableLesson({ lessonId, onBack }: { lessonId: string; onBack: () => void }) {
  return (
    <main className="fixed inset-0 z-20 grid place-items-center bg-canvas px-6 text-center dark:bg-night">
      <div className="grid max-w-[42ch] justify-items-center gap-2">
        <DevyMood mood="annoyed" className="mb-2 size-[132px]" />
        <h1 className="m-0 text-[clamp(24px,3vw,30px)] font-semibold text-neutral-800 dark:text-night-ink">This lesson isn’t written yet</h1>
        <p className="m-0 text-[15px] leading-[1.55] text-[#777] dark:text-[#b2b2b6]">
          <code className="text-[.9em]">{lessonId}</code> has no content authored against it yet. Pick another lesson from your path.
        </p>
        <Button className="mt-4 min-h-11 px-6" onClick={onBack}>
          Back to paths
        </Button>
      </div>
    </main>
  );
}
