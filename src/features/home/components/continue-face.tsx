import type { HomeCourse } from "~/types/home";
import { CardCta } from "./card-cta";
import { CourseArt } from "./course-card";

// The current lesson's status: a play disc with a soft glow behind it and a
// green check, the "this is the live one" cue.
function CurrentLessonIcon() {
  return (
    <span className="relative grid size-[26px] flex-none place-items-center">
      <span className="pointer-events-none absolute -inset-1.5 -z-10 rounded-full bg-accent/35 blur-md" aria-hidden="true" />
      <span className="grid size-full place-items-center rounded-full bg-neutral-600 shadow-[0_2px_0_#2a2a2f,0_0_0_3px_rgb(var(--card-accent)_/_0.15)] dark:bg-[#3f3f46]">
        <svg className="size-3" viewBox="0 0 24 24" fill="#ffffff" aria-hidden="true">
          <path d="M8 5v14l11-7L8 5Z" />
        </svg>
      </span>
      <span className="absolute -top-0.5 -right-0.5 grid size-[13px] place-items-center rounded-full border-2 border-white bg-green-500 dark:border-night-card">
        <svg className="size-1.5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M20 6 9 17l-5-5" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </span>
  );
}

function LockedLessonIcon() {
  return (
    <span className="grid size-[26px] flex-none place-items-center rounded-full bg-black/6 dark:bg-white/6">
      <svg className="size-[13px]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M6 10V8a6 6 0 1 1 12 0v2M5 10h14v10H5V10Z" stroke="#6b6b70" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

// A plain ring, tinted with the accent on the current lesson so the eye lands
// there first. Never filled: a finished lesson is marked on the left.
const Ring = ({ current }: { current?: boolean }) => (
  <span
    className={`size-[18px] flex-none rounded-full border-2 ${current ? "border-accent/70" : "border-black/12 dark:border-white/14"}`}
    aria-hidden="true"
  />
);

type ContinueFaceProps = {
  course: HomeCourse;
  onContinue: () => void;
};

// The Continue learning card on tablet and phone: the region, how far through
// it, then the lesson to carry on with and what follows it.
export function ContinueFace({ course, onContinue }: ContinueFaceProps) {
  const total = course.regionLessonsTotal;
  const completed = course.regionLessonsCompleted;

  return (
    <>
      <span className="flex w-full flex-col items-center gap-2 pt-3 pb-4 text-center max-tab:pb-3">
        <strong className="text-[19px] leading-tight font-semibold text-neutral-800 max-tab:text-lg dark:text-night-ink">
          {course.regionTitle ?? course.title}
        </strong>
        {total > 0 && (
          <span className="text-[11px] font-bold tracking-[0.08em] text-accent uppercase">
            Lesson {completed + 1} of {total}
          </span>
        )}
        <span className="mt-0.5 flex w-full max-w-[260px] items-center gap-2">
          <span className="block h-1.5 flex-1 overflow-hidden rounded-full bg-blue-600/16 dark:bg-white/16">
            <span className="block h-full rounded-full bg-accent" style={{ width: `${course.regionPercent}%` }} />
          </span>
          <span className="flex-none text-[11px] font-bold text-ink-soft dark:text-[#b6bac4]">{course.regionPercent}%</span>
        </span>
      </span>

      <span className="flex w-full justify-center">
        <CourseArt src={course.regionImage} className="my-2.5 size-24 max-tab:my-1.5 max-tab:size-20" />
      </span>

      <span className="mt-auto flex w-full flex-col gap-2">
        <span className="flex items-center gap-3.5 py-2.5 text-base font-semibold text-neutral-800 max-tab:text-[15px] dark:text-white">
          <CurrentLessonIcon />
          <strong className="flex-1 font-semibold">{course.nextLessonTitle ?? `${course.title} complete`}</strong>
          <Ring current />
        </span>
        {/* The following lesson is a quiet preview; phones have no room for it. */}
        {course.nextLessonTitle && course.upNextTitle && (
          <span className="flex items-center gap-3.5 py-2.5 text-base text-[#8a8a86] max-tab:hidden dark:text-[#a6aab4]">
            <LockedLessonIcon />
            <span className="flex-1">{course.upNextTitle}</span>
            <Ring />
          </span>
        )}
      </span>

      <CardCta
        className="mt-5 min-h-[52px] text-[17px] max-tab:mt-[18px] max-tab:text-[15px]"
        onClick={(event) => {
          event.stopPropagation();
          onContinue();
        }}
      >
        {course.nextLessonTitle ? "Continue lesson" : "See what’s next"}
      </CardCta>
    </>
  );
}
