import type { DerivedRegion } from "../api/paths-api";
import type { LaunchFlight } from "../hooks/use-lesson-launch";
import { LessonRow } from "./lesson-row";

type RegionSectionProps = {
  region: DerivedRegion;
  // How many lessons come before this section, so the road's curve carries on
  // from where the last section left it instead of restarting.
  lessonsBefore: number;
  pinned: boolean;
  selectedLessonId: string;
  flight: LaunchFlight | null;
  onSelect: (lessonId: string) => void;
  onStart: (lessonId: string) => void;
};

// One stretch of the route: a sticky header, then its lessons winding down the road.
export function RegionSection({ region, lessonsBefore, pinned, selectedLessonId, flight, onSelect, onStart }: RegionSectionProps) {
  return (
    <section className="relative grid min-w-0 grid-cols-[minmax(0,1fr)]" aria-labelledby={`${region.id}-title`}>
      <header
        data-region-header={region.id}
        className={`sticky top-[86px] isolate z-2 grid min-h-[70px] content-center justify-items-center gap-1 rounded-2xl border px-[18px] py-3 text-center shadow-[0_8px_20px_rgba(40,40,35,.08)] max-tab:min-h-16 dark:shadow-[0_8px_20px_rgba(0,0,0,.28)] ${
          pinned
            ? "border-[#e0e0dc] bg-white dark:border-[#56565c] dark:bg-[#323236] after:pointer-events-none after:fixed after:top-0 after:left-0 after:z-0 after:h-[86px] after:w-screen after:bg-canvas dark:after:bg-night"
            : "border-[#eeeeeb] bg-white dark:border-night-line dark:bg-night-card"
        }`}
      >
        <span className="relative z-1 text-[11px] font-bold tracking-[.1em] text-[#4169e1] uppercase dark:text-[#88bdf2]">{region.level.replace("Region", "Section")}</span>
        <h2 id={`${region.id}-title`} className="relative z-1 text-base font-medium text-neutral-800 dark:text-night-ink">
          {region.title}
        </h2>
      </header>
      <div className="relative grid px-6 pt-8 pb-2 max-tab:px-0 max-tab:pt-6 max-tab:pb-1">
        {region.lessons.map((lesson, index) => (
          <LessonRow
            key={lesson.id}
            lesson={lesson}
            index={lessonsBefore + index}
            selected={lesson.id === selectedLessonId}
            flight={lesson.derivedState === "current" ? flight : null}
            onSelect={() => onSelect(lesson.id)}
            onStart={() => onStart(lesson.id)}
          />
        ))}
      </div>
    </section>
  );
}
