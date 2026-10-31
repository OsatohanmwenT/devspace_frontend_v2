"use client";

import { useEffect, useRef, type ReactNode } from "react";

type LessonDialogProps = {
  title: string;
  eyebrow?: string;
  body?: string;
  // "calm" for a choice that is not a loss, such as asking for help.
  leaveTone?: "danger" | "calm";
  media: ReactNode;
  // The safe choice, which Escape also picks.
  stayLabel: string;
  leaveLabel: string;
  onStay: () => void;
  onLeave: () => void;
};

// A "wait, don't go" prompt. Focus stays inside it, starts on the safe choice
// and Escape picks that choice.
export function LessonDialog({ title, eyebrow, body, leaveTone = "danger", media, stayLabel, leaveLabel, onStay, onLeave }: LessonDialogProps) {
  const dialog = useRef<HTMLDivElement>(null);
  const stay = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    stay.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onStay();
        return;
      }
      if (event.key !== "Tab") return;
      const buttons = dialog.current?.querySelectorAll("button");
      if (!buttons?.length) return;
      const first = buttons[0];
      const last = buttons[buttons.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onStay]);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/65 px-5">
      <div
        ref={dialog}
        className="grid w-full max-w-[440px] justify-items-center rounded-3xl bg-white px-7 py-7 text-center shadow-[0_18px_48px_rgba(0,0,0,.45)] max-[520px]:px-6 dark:bg-[#14252c]"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        {media}
        {eyebrow && <span className="mb-1.5 text-[11px] font-bold tracking-widest text-[#2563eb] uppercase dark:text-[#88bdf2]">{eyebrow}</span>}
        <h2 className="m-0 max-w-[18ch] text-2xl leading-[1.35] font-semibold text-neutral-800 dark:text-night-ink">{title}</h2>
        {body && <p className="m-0 mt-2.5 max-w-[34ch] text-sm leading-normal text-ink-soft dark:text-[#b2b2b6]">{body}</p>}
        <div className="mt-7 grid w-full gap-3">
          <button
            ref={stay}
            type="button"
            className="focus-ring min-h-14 rounded-2xl bg-[#2563eb] px-5 text-[15px] font-semibold tracking-[0.06em] text-white uppercase shadow-[0_5px_0_#1d4ed8] hover:bg-[#3b82f6] active:translate-y-1 active:shadow-none"
            onClick={onStay}
          >
            {stayLabel}
          </button>
          <button
            type="button"
            className={`focus-ring min-h-11 px-5 text-[15px] font-semibold tracking-[0.06em] uppercase ${leaveTone === "danger" ? "text-[#d92d2d] hover:text-[#ff8585] dark:text-[#ff6262]" : "text-ink-soft hover:text-neutral-700 dark:text-night-soft dark:hover:text-[#c4c4c7]"}`}
            onClick={onLeave}
          >
            {leaveLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
