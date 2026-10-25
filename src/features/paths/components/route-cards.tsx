import { Button } from "~/components/ui/button";
import type { CustomRoute } from "~/types/paths";

const EYEBROW = "text-[11px] font-semibold tracking-widest text-ink-soft uppercase dark:text-night-soft";
const TEXT_LINK =
  "focus-ring text-sm text-[#8b8b90] underline underline-offset-4 hover:text-[#6699ec] disabled:opacity-40";

function StatusIcon({ included }: { included: boolean }) {
  return included ? (
    <svg className="size-4 flex-none text-[#008a62]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m5 12 4 4L19 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ) : (
    <svg className="size-4 flex-none text-[#8b8b8b]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 7l10 10M17 7 7 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ItemList({ title, items, included }: { title: string; items: string[]; included: boolean }) {
  return (
    <div>
      <span className={EYEBROW}>{title}</span>
      <ul className="mt-2.5 grid list-none gap-1.5 p-0">
        {items.map((item) => (
          <li key={item} className={`flex items-center gap-2 text-[15px] ${included ? "text-neutral-800 dark:text-night-ink" : "text-ink-soft dark:text-night-soft"}`}>
            <StatusIcon included={included} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

type ReviewCardProps = {
  route: CustomRoute;
  disabled: boolean;
  onConfirm: () => void;
  onAdjust: () => void;
};

// The route in brief, before it is created: what it will focus on and skip.
export function ReviewCard({ route, disabled, onConfirm, onAdjust }: ReviewCardProps) {
  return (
    <div className="grid w-full max-w-[720px] gap-5 rounded-3xl border border-[#e7e5e0] bg-white p-6 dark:border-night-line dark:bg-night-card">
      <div>
        <span className={EYEBROW}>Goal</span>
        <p className="mt-1.5 mb-0 text-[15px] leading-[1.6] text-neutral-800 dark:text-night-ink">{route.goal}</p>
      </div>
      <div>
        <span className={EYEBROW}>Starting point</span>
        <p className="mt-1.5 mb-0 text-[15px] text-neutral-800 dark:text-night-ink">{route.startingPoint}</p>
      </div>
      <ItemList title="We’ll focus on" items={route.focus} included />
      <ItemList title="We’ll skip" items={route.skip} included={false} />
      <div className="flex flex-wrap items-center gap-3 border-t border-[#eee] pt-4 dark:border-[#333]">
        <Button className="min-h-11 flex-1 text-[15px] font-semibold" disabled={disabled} onClick={onConfirm}>
          Looks good, create path
        </Button>
        <button type="button" disabled={disabled} className={TEXT_LINK} onClick={onAdjust}>
          Adjust
        </button>
      </div>
    </div>
  );
}

type RouteCardProps = {
  route: CustomRoute;
  disabled: boolean;
  onStart: () => void;
  onAdjust: () => void;
};

// The finished route: what you'll build, where you start and the stages between.
export function RouteCard({ route, disabled, onStart, onAdjust }: RouteCardProps) {
  const facts: [number, string][] = [
    [route.sections.length, "sections"],
    [15, "lessons"],
    [15, "practice steps"],
    [1, "project"],
  ];

  return (
    <article className="grid w-full max-w-[780px] gap-6 rounded-3xl border border-[#e7e5e0] bg-white p-6 shadow-[0_2px_10px_rgba(20,20,20,0.06)] dark:border-night-line dark:bg-night-card dark:shadow-none">
      <div>
        <span className="rounded-full bg-[#eff4ff] px-3 py-1 text-[13px] font-medium text-[#2563eb] dark:bg-[#1c2a4d] dark:text-[#88bdf2]">Custom path</span>
        <h2 className="mt-3 mb-1.5 text-2xl font-semibold text-neutral-800 dark:text-night-ink">{route.title}</h2>
        <p className="m-0 text-[15px] leading-[1.6] text-ink-soft dark:text-night-soft">{route.goal}</p>
      </div>

      <aside className="rounded-2xl border border-[#b7e6d3] bg-[#e7f8f0] px-5 py-4 dark:border-[#2f6b53] dark:bg-[#132a22]" aria-label="Project payoff">
        <span className="text-xs font-semibold tracking-widest text-[#008a62] uppercase dark:text-[#7fe0b8]">You’ll build</span>
        <p className="mt-1 mb-0 text-[15px] leading-[1.55] text-[#046648] dark:text-[#d3f3e5]">{route.project}</p>
      </aside>

      <div className="flex flex-wrap gap-2" aria-label="Route facts">
        {facts.map(([value, label]) => (
          <span key={label} className="rounded-full bg-[#f3f2ef] px-3 py-1.5 text-[13px] text-ink-soft dark:bg-[#27272a] dark:text-[#c9c9cc]">
            <strong className="mr-1 text-neutral-800 dark:text-night-ink">{value}</strong>
            {label}
          </span>
        ))}
      </div>

      <section className="rounded-2xl border border-[#cbd8ff] bg-[#eff4ff] px-5 py-4 dark:border-[#6c8ee8] dark:bg-[#1d2f5d]" aria-label="Starting point">
        <span className="text-xs font-semibold tracking-widest text-[#315bb5] uppercase dark:text-[#a9c4ff]">Start here</span>
        <h3 className="mt-1 mb-1 text-lg font-semibold text-[#1f3c7c] dark:text-white">{route.stages[0].title}</h3>
        <p className="m-0 text-[15px] leading-[1.55] text-[#3a568d] dark:text-[#dbe6ff]">{route.startingPoint}</p>
      </section>

      <section aria-labelledby="route-story-title">
        <span id="route-story-title" className={EYEBROW}>
          Your route
        </span>
        <ol className="mt-4 grid list-none gap-4 p-0">
          {route.stages.map((stage, index) => (
            <li key={stage.title} className="relative flex gap-4">
              <div className="flex flex-col items-center">
                <span
                  className={`grid size-9 place-items-center rounded-full text-sm font-semibold ${
                    index === 0 ? "bg-[#2f6fed] text-white" : "bg-[#f1f1ef] text-ink-soft dark:bg-[#2b2b2e] dark:text-[#c9c9cc]"
                  }`}
                >
                  {index + 1}
                </span>
                {index < route.stages.length - 1 && <span className="mt-1 h-8 w-px border-l border-dashed border-[#767676]" aria-hidden="true" />}
              </div>
              <div className="pb-3">
                <span className="text-xs font-medium text-[#2563eb] dark:text-[#88bdf2]">{stage.label}</span>
                <h3 className="mt-0.5 mb-1 text-base font-semibold text-neutral-800 dark:text-night-ink">{stage.title}</h3>
                <p className="m-0 text-sm leading-normal text-ink-soft dark:text-night-soft">{stage.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <div className="flex flex-wrap items-center gap-3 border-t border-[#eee] pt-4 dark:border-[#333]">
        <Button className="min-h-11 flex-1 text-[15px] font-semibold" disabled={disabled} onClick={onStart}>
          Jump into your first lesson
        </Button>
        <button type="button" disabled={disabled} className={TEXT_LINK} onClick={onAdjust}>
          Adjust route
        </button>
      </div>
    </article>
  );
}
