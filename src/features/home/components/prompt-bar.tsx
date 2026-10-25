"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState, type RefObject } from "react";

// A few things Devy can help with, rotated through the idle placeholder so the
// empty bar hints at what it is for without any visible controls: those only
// appear once the learner clicks in.
const IDLE_PROMPTS = [
  "What do you need help with?",
  "Explain recursion to me...",
  "Help me understand APIs...",
  "What should I learn next?",
  "Quiz me on Python...",
];

const ICON_BUTTON =
  "focus-ring grid size-10 flex-none place-items-center rounded-full text-ink-soft transition-colors hover:bg-black/5 hover:text-neutral-800 dark:text-night-soft dark:hover:bg-white/10 dark:hover:text-night-ink";

type PromptBarProps = {
  // An "R G B" accent that tints the glow behind the bar.
  accent: string;
  isComposing: boolean;
  placeholder?: string;
  value: string;
  onValueChange: (value: string) => void;
  inputRef: RefObject<HTMLInputElement | null>;
  onComposeStart: () => void;
  onComposeEnd: () => void;
  onDismiss: () => void;
  onAsk: (question?: string) => void;
};

// The page's closing call to action: a discovery-style prompt bar for asking
// Devy. Idle, it is a single-line input with a rotating hint; upload, voice
// and send appear once the learner clicks in.
export function PromptBar({
  accent,
  isComposing,
  placeholder,
  value,
  onValueChange,
  inputRef,
  onComposeStart,
  onComposeEnd,
  onDismiss,
  onAsk,
}: PromptBarProps) {
  const [promptIndex, setPromptIndex] = useState(0);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (isComposing) return;
    const timer = window.setInterval(() => {
      setPromptIndex((index) => (index + 1) % IDLE_PROMPTS.length);
    }, 3200);
    return () => window.clearInterval(timer);
  }, [isComposing]);

  return (
    <div className="group relative mx-auto w-full max-w-[480px]" data-compose={isComposing}>
      <motion.span
          className="pointer-events-none absolute -inset-x-14 -inset-y-8 z-0 rounded-full bg-[radial-gradient(ellipse_at_center,rgb(var(--card-accent)_/_0.3),rgb(var(--card-accent)_/_0.12)_44%,transparent_76%)] blur-3xl transition-transform duration-[420ms] group-data-[compose=true]:scale-110 tab:-inset-x-28 tab:-inset-y-14 max-tab:bg-[radial-gradient(ellipse_at_center,rgb(var(--card-accent)_/_0.14),rgb(var(--card-accent)_/_0.035)_44%,transparent_76%)] dark:bg-[radial-gradient(ellipse_at_center,rgb(var(--card-accent)_/_0.4),rgb(var(--card-accent)_/_0.14)_46%,transparent_76%)] dark:max-tab:bg-[radial-gradient(ellipse_at_center,rgb(var(--card-accent)_/_0.1),rgb(var(--card-accent)_/_0.025)_44%,transparent_76%)]"
          initial={false}
          animate={{ "--card-accent": accent }}
          transition={{ duration: reducedMotion ? 0 : 1.2, ease: "easeInOut" }}
          aria-hidden="true"
        />
      <form
        className="relative z-10 flex w-full items-center rounded-full border border-line bg-white p-2 shadow-[0_5px_14px_rgba(183,181,203,0.16)] max-tab:mt-4 dark:border-night-line dark:bg-night-card dark:shadow-[0_14px_32px_rgba(0,0,0,0.16)]"
        onSubmit={(event) => {
          event.preventDefault();
          onAsk(value.trim() || undefined);
          onValueChange("");
        }}
      >
        <input
          className="min-h-12 min-w-0 flex-1 rounded-full bg-transparent px-5 text-base text-neutral-800 placeholder:text-night-soft focus:outline-none dark:text-night-ink"
          ref={inputRef}
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
          placeholder={placeholder ?? (isComposing ? "Ask Devy anything..." : IDLE_PROMPTS[promptIndex])}
          aria-label="Ask Devy for help"
          onFocus={onComposeStart}
          onBlur={onComposeEnd}
          onKeyDown={(event) => {
            if (event.key !== "Escape") return;
            event.currentTarget.blur();
            onDismiss();
          }}
        />
        {isComposing && (
          <>
            <button
              type="button"
              className={ICON_BUTTON}
              aria-label="Add a photo or file"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => onAsk()}
            >
              <svg className="size-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
            <button
              type="button"
              className={ICON_BUTTON}
              aria-label="Talk to Devy"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => onAsk()}
            >
              <svg className="size-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="9" y="3" width="6" height="11" rx="3" stroke="currentColor" strokeWidth="2" />
                <path d="M5 11a7 7 0 0 0 14 0M12 18v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
            <button
              type="submit"
              className="focus-ring grid size-10 flex-none place-items-center rounded-full bg-blue-600 text-white transition-colors hover:bg-blue-700 dark:bg-blue-400 dark:hover:bg-blue-500"
              aria-label="Send"
            >
              <svg className="size-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </>
        )}
      </form>
    </div>
  );
}
