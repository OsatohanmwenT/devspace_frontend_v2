import { Button } from "~/components/ui/button";
import type { Framework } from "../api/paths-api";

const FRAMEWORKS: Framework[] = ["react", "vue", "angular"];

// Shown once a frontend learner finishes the JavaScript foundations: the next
// decision on the route is which framework to focus on.
export function FrameworkCheckpoint({ onChoose }: { onChoose: (framework: Framework) => void }) {
  return (
    <section
      className="grid gap-4 rounded-2xl border border-[#4169e1] bg-[#eff4ff] p-6 dark:bg-[#18284d]"
      aria-labelledby="framework-checkpoint-title"
    >
      <div className="grid gap-1">
        <p className="m-0 text-[11px] font-semibold tracking-[.1em] text-[#315bb5] uppercase dark:text-[#88bdf2]">Next decision</p>
        <h2 id="framework-checkpoint-title" className="m-0 text-2xl font-semibold text-neutral-800 dark:text-white">
          Choose your frontend framework
        </h2>
        <p className="m-0 text-[15px] leading-[1.55] text-[#52657f] dark:text-[#c8d8f4]">
          You have finished the JavaScript foundations. Pick the framework you want to focus on next.
        </p>
      </div>
      <div className="grid grid-cols-3 gap-3 max-[560px]:grid-cols-1">
        {FRAMEWORKS.map((framework) => (
          <Button key={framework} variant="neutral" className="min-h-11 capitalize" onClick={() => onChoose(framework)}>
            {framework}
          </Button>
        ))}
      </div>
    </section>
  );
}
