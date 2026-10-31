import { DevyMood } from "~/components/devy";
import { LESSON_SCENE } from "./lesson-scene";

// The beat between the path page and the lesson: Devy drops in under a beam of
// light, in the same blue scene the launch spotlight filled the screen with.
export function LessonLoading({ title }: { title: string }) {
  return (
    <section
      className={`fixed inset-0 z-30 grid min-h-screen place-items-center ${LESSON_SCENE} px-6 py-8 text-neutral-800 max-tab:px-4 dark:text-night-ink`}
      aria-label="Preparing your lesson"
      aria-live="polite"
      aria-busy="true"
    >
      <main className="grid w-full max-w-[520px] justify-items-center text-center">
        <div className="relative mb-7 size-44 animate-loader-devy max-tab:mb-6 max-tab:size-36 motion-reduce:animate-none">
          <div
            className="absolute bottom-[20%] left-1/2 h-[65vh] w-24 -translate-x-1/2 animate-loader-beam bg-[linear-gradient(to_bottom,transparent,rgb(102_153_236/0.16))] blur-[14px] motion-reduce:hidden dark:bg-[linear-gradient(to_bottom,transparent,rgb(102_153_236/0.2))]"
            aria-hidden="true"
          />
          <DevyMood mood="neutral" className="relative size-full" />
        </div>
        <p className="m-0 text-[13px] font-semibold tracking-[0.08em] text-ink-soft uppercase dark:text-[#b2b2b6]">Preparing your lesson</p>
        <h1 className="mt-3 mb-0 text-[clamp(28px,4vw,38px)] leading-[1.14] font-semibold">{title}</h1>
      </main>
    </section>
  );
}
