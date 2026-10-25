import type { DerivedRegion } from "../api/paths-api";
import { LessonRow } from "./lesson-row";

type RegionSectionProps = {
  region: DerivedRegion;
  pinned: boolean;
  selectedLessonId: string;
  flying: boolean;
  onSelect: (lessonId: string) => void;
  onStart: (lessonId: string) => void;
};

// One stretch of the route: a sticky header, then its lessons down a centre line.
export function RegionSection({ region, pinned, selectedLessonId, flying, onSelect, onStart }: RegionSectionProps) {
  return (
    <section className="relative grid min-w-0 grid-cols-[minmax(0,1fr)]" aria-labelledby={`${region.id}-title`}>
      <header
        data-region-header={region.id}
        className={`sticky top-[86px] isolate z-2 grid min-h-[70px] content-center justify-items-center gap-1 rounded-2xl border border-[#eeeeeb] bg-white px-[18px] py-3 text-center shadow-[0_8px_20px_rgba(40,40,35,.08)] max-tab:min-h-16 dark:border-night-line dark:bg-night-card dark:shadow-[0_8px_20px_rgba(0,0,0,.28)] ${
          pinned
            ? "after:pointer-events-none after:fixed after:top-0 after:left-0 after:z-0 after:h-[86px] after:w-screen after:bg-canvas dark:after:bg-night"
            : ""
        }`}
      >
        <span className="relative z-1 text-[11px] font-bold tracking-[.1em] text-[#4169e1] uppercase">{region.level.replace("Region", "Section")}</span>
        <h2 id={`${region.id}-title`} className="relative z-1 text-base font-medium text-neutral-800 dark:text-night-ink">
          {region.title}
        </h2>
      </header>
      <div className="relative grid gap-2.5 px-6 pt-8 pb-1 before:absolute before:top-3 before:bottom-[18px] before:left-1/2 before:w-0.5 before:-translate-x-1/2 before:bg-[#eeeeeb] max-tab:px-0 max-tab:pt-6 max-tab:pb-0.5 dark:before:bg-night-line">
        {region.lessons.map((lesson, index) => (
          <LessonRow
            key={lesson.id}
            lesson={lesson}
            index={index}
            selected={lesson.id === selectedLessonId}
            flying={lesson.derivedState === "current" && flying}
            onSelect={() => onSelect(lesson.id)}
            onStart={() => onStart(lesson.id)}
          />
        ))}
      </div>
    </section>
  );
}
