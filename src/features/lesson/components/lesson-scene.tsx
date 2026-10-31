// The lesson's blue intro backdrop, shared by the launch scene on the path page,
// the route's loading fallback and the loader, so the screen never goes blank
// between them.
export const LESSON_SCENE =
  "bg-[linear-gradient(to_bottom,#fafaf8_0%,#fafaf8_42%,#e4effd_100%)] dark:bg-[linear-gradient(to_bottom,#121214_0%,#121214_42%,#1d2a43_100%)]";

export function LessonScene() {
  return <div aria-hidden="true" className={`fixed inset-0 z-30 ${LESSON_SCENE}`} />;
}
