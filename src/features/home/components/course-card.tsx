import { assetUrl } from "~/config/assets";
import type { HomeCourse } from "~/types/home";
import { ACCENTS, accentStyle } from "../lib/accents";
import { CardCta } from "./card-cta";

// The region's artwork, or a plain play icon when a region has none.
export function CourseArt({ src, className }: { src: string | null; className: string }) {
  return (
    <span className={`grid place-items-center ${className}`} aria-hidden="true">
      {src && (
        // eslint-disable-next-line @next/next/no-img-element -- small fixed illustration
        <img src={assetUrl(src)} alt="" className="size-full object-contain" draggable={false} />
      )}
    </span>
  );
}

type CourseCardProps = {
  course: HomeCourse;
  onContinue: () => void;
};

// The desktop's Continue learning card: what the learner is on right now, how
// far through the region they are, and the one action to carry on.
export function CourseCard({ course, onContinue }: CourseCardProps) {
  const total = course.regionLessonsTotal;
  const completed = Math.min(course.regionLessonsCompleted, total);

  return (
    <section
      className="relative flex h-[500px] flex-col items-center self-start rounded-3xl border border-blue-500/18 bg-[#f5f9ff] px-12 pt-8 pb-6 text-center shadow-[0_10px_24px_-18px_rgb(20_20_40_/_0.14)] dark:bg-[#1a2130] dark:shadow-[0_12px_24px_-20px_rgb(0_0_0_/_0.5)]"
      style={accentStyle(ACCENTS.continueLearning)}
      aria-label="Continue learning"
    >
      <span className="rounded-full bg-accent/12 px-3 py-1.5 text-xs font-bold text-accent">{course.title}</span>
      <strong className="mt-3.5 text-4xl leading-[1.08] font-bold tracking-[-0.03em] text-neutral-800 dark:text-night-ink">
        {course.nextLessonTitle ?? course.regionTitle ?? course.title}
      </strong>
      <span className="mt-2 max-w-[38ch] text-sm leading-[1.45] font-semibold text-[#687086] dark:text-night-soft">
        {course.regionTitle ?? "First region"}
        {total > 0 && ` · Lesson ${Math.min(completed + 1, total)} of ${total}`}
      </span>
      {total > 0 && (
        <span className="mt-3.5 flex gap-1.5" role="img" aria-label={`${completed} of ${total} lessons done`}>
          {Array.from({ length: total }, (_, index) => (
            <span
              key={index}
              className={`h-1.5 w-[34px] rounded-full ${
                index < completed ? "bg-accent" : index === completed ? "bg-accent/40" : "bg-slate-800/10 dark:bg-white/12"
              }`}
            />
          ))}
        </span>
      )}
      <span className="grid min-h-[160px] flex-[1_0_160px] place-items-center">
        <CourseArt src={course.regionImage} className="size-[180px]" />
      </span>
      <CardCta className="mb-1 min-h-[52px] text-[17px]" onClick={onContinue}>
        {course.nextLessonTitle ? "Continue lesson" : "See what’s next"}
      </CardCta>
    </section>
  );
}
