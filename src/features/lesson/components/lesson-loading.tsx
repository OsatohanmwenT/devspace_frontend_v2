import { LESSON_SCENE } from "./lesson-scene";

// The lesson intro keeps the same backdrop as the rising launch scene.
export function LessonLoading({ title }: { title: string }) {
  return (
    <section
      className={`fixed inset-0 z-30 grid min-h-screen place-items-center ${LESSON_SCENE} px-6 py-8 text-neutral-800 max-tab:px-4 dark:text-night-ink`}
      aria-label="Preparing your lesson"
      aria-live="polite"
      aria-busy="true"
    >
      <main className="grid w-full max-w-[520px] justify-items-center text-center">
        <p className="m-0 text-[13px] font-semibold tracking-[0.08em] text-ink-soft uppercase dark:text-[#b2b2b6]">Preparing your lesson</p>
        <h1 className="mt-3 mb-0 text-[clamp(28px,4vw,38px)] leading-[1.14] font-semibold">{title}</h1>
      </main>
    </section>
  );
}
