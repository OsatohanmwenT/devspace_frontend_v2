"use client";

import { Button } from "~/components/ui/button";

type LessonPreviewDialogProps = {
  title: string;
  onClose: () => void;
  onShowCurrent: () => void;
};

// Shown for a lesson that is next in the route but not ready to start.
export function LessonPreviewDialog({ title, onClose, onShowCurrent }: LessonPreviewDialogProps) {
  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-black/65 p-5 backdrop-blur-sm" role="presentation" onMouseDown={onClose}>
      <section
        className="w-full max-w-[560px] rounded-3xl border border-[#e0e0dc] bg-white p-6 shadow-[0_24px_60px_rgba(0,0,0,.45)] max-tab:p-5 dark:border-night-line dark:bg-night-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="lesson-preview-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <p className="m-0 text-[11px] font-semibold tracking-[.1em] text-[#2563eb] uppercase dark:text-[#88bdf2]">Lesson preview</p>
        <h2 id="lesson-preview-title" className="mt-2 text-[26px] font-semibold text-neutral-800 dark:text-night-ink">
          {title}
        </h2>
        <p className="mt-3 text-[15px] leading-[1.55] text-ink-soft dark:text-[#b2b2b6]">
          This lesson is next in your route, but it is not ready to start yet. Complete your current lesson first and we’ll unlock it when it becomes available.
        </p>
        <div className="mt-6 flex justify-end gap-3 max-tab:flex-col-reverse">
          <Button variant="neutral" className="min-h-11 px-5" onClick={onClose}>
            Back to path
          </Button>
          <Button className="min-h-11 px-5" onClick={onShowCurrent}>
            Continue current lesson
          </Button>
        </div>
      </section>
    </div>
  );
}
