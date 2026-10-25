import type { Lesson, Path, Region } from "./types";

type Completed = Record<string, { completedAt: string }>;

export type DerivedLesson = Lesson & { derivedState: "completed" | "current" | "available" | "locked" };

export type DerivedRegion = Omit<Region, "lessons"> & {
  index: number;
  lessons: DerivedLesson[];
  lessonsTotal: number;
  lessonsCompleted: number;
  percent: number;
};

export type DerivedPath = {
  regions: DerivedRegion[];
  percent: number;
  currentLesson: DerivedLesson | null;
  currentRegion: DerivedRegion | null;
  // How many lessons until the next checkpoint, from the current one.
  nextCheckpoint: { title: string; lessonsUntil: number } | null;
  isComplete: boolean;
};

// Authored `state: "completed"` in the fixtures is seed data: it places a new
// learner partway along the path so the current lesson lands on one that has
// authored content. It combines with real completions rather than being
// replaced by them.
const isComplete = (lesson: Lesson, completed: Completed) =>
  Boolean(completed[lesson.id]) || lesson.state === "completed";

const toPercent = (done: number, total: number) => (total ? Math.round((done / total) * 100) : 0);

// A region built as a placeholder holds one lesson whose only job is to name
// what is coming; it has no real content and no real checkpoint.
const hasAuthoredContent = (region: Region) =>
  !(region.lessons.length === 1 && region.lessons[0].id.endsWith("-preview"));

// Derives where a learner is on a path from what they have completed. The
// first gap in the path is the current lesson.
export function derivePathProgress(path: Path, completed: Completed = {}): DerivedPath {
  const sequence = path.cards.flatMap((region, regionIndex) =>
    region.lessons.map((lesson, indexInRegion) => ({ lesson, region, regionIndex, indexInRegion })),
  );
  const currentIndex = sequence.findIndex((entry) => !isComplete(entry.lesson, completed));
  const currentEntry = currentIndex === -1 ? null : sequence[currentIndex];
  const currentRegionIndex = currentEntry ? currentEntry.regionIndex : -1;

  const regions: DerivedRegion[] = path.cards.map((region, regionIndex) => {
    const lessons: DerivedLesson[] = region.lessons.map((lesson) => {
      const derivedState = isComplete(lesson, completed)
        ? "completed"
        : currentEntry?.lesson.id === lesson.id
          ? "current"
          : regionIndex === currentRegionIndex
            ? "available"
            : "locked";
      return { ...lesson, derivedState };
    });
    const lessonsCompleted = lessons.filter((lesson) => lesson.derivedState === "completed").length;
    return {
      ...region,
      index: regionIndex,
      lessons,
      lessonsTotal: lessons.length,
      lessonsCompleted,
      percent: toPercent(lessonsCompleted, lessons.length),
    };
  });

  const allLessons = regions.flatMap((region) => region.lessons);
  const lessonsCompleted = allLessons.filter((lesson) => lesson.derivedState === "completed").length;
  const currentRegion = currentRegionIndex === -1 ? null : regions[currentRegionIndex];
  const currentLesson = currentEntry
    ? regions[currentRegionIndex].lessons[currentEntry.indexInRegion]
    : null;

  const checkpointIndex =
    currentIndex === -1
      ? -1
      : sequence.findIndex(
          (entry, index) =>
            index >= currentIndex && entry.lesson.checkpoint && hasAuthoredContent(entry.region),
        );

  return {
    regions,
    percent: toPercent(lessonsCompleted, allLessons.length),
    currentLesson,
    currentRegion,
    nextCheckpoint:
      checkpointIndex === -1
        ? null
        : {
            title: sequence[checkpointIndex].lesson.title,
            lessonsUntil: checkpointIndex - currentIndex,
          },
    isComplete: allLessons.length > 0 && currentIndex === -1,
  };
}
