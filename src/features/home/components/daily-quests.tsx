"use client";

import { useId, useRef, useState, type ReactNode } from "react";
import { GameIcon } from "~/components/ui/game-icon";
import { CheckIcon } from "~/components/ui/icons";
import { useDismiss } from "~/hooks/use-dismiss";
import type { Quest } from "~/types/home";

const SEEN_KEY = "devspace-daily-quests-seen";

type Seen = { date: string; done: number };

// When the checklist was last opened, and how many quests were done then, so
// the trigger can carry a dot on the first visit of each day and again when a
// quest is completed, the way games flag their missions button.
function readSeen(): Seen | null {
  try {
    return JSON.parse(localStorage.getItem(SEEN_KEY) ?? "null");
  } catch {
    return null;
  }
}

type DailyQuestsProps = {
  quests: Quest[];
  onContinueLesson: () => void;
  onStartPractice: () => void;
  triggerClassName: string;
  // Phones centre the panel under the trigger; desktop hangs it from the left.
  panelClassName: string;
  children: (state: { doneCount: number; total: number; unseen: boolean }) => ReactNode;
};

// Today's quests, opened from whatever trigger the caller draws. Clicks and
// keys stay inside, so a card this sits in does not react to them.
export function DailyQuests({
  quests,
  onContinueLesson,
  onStartPractice,
  triggerClassName,
  panelClassName,
  children,
}: DailyQuestsProps) {
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState(readSeen);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelId = useId();
  useDismiss(open, () => setOpen(false), rootRef);

  const doneCount = quests.filter((quest) => quest.done).length;
  const allDone = doneCount === quests.length;
  const today = new Date().toDateString();
  const unseen = seen?.date !== today || doneCount > (seen?.done ?? 0);

  function toggle() {
    if (!open) {
      const next = { date: today, done: doneCount };
      setSeen(next);
      try {
        localStorage.setItem(SEEN_KEY, JSON.stringify(next));
      } catch {
        // Storage unavailable: the dot just comes back next visit.
      }
    }
    setOpen((current) => !current);
  }

  return (
    <div
      className="relative"
      ref={rootRef}
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        className={triggerClassName}
        data-done={allDone || undefined}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={`Daily quests: ${allDone ? "all done" : `${doneCount} of ${quests.length} done`}${unseen ? ", new" : ""}`}
        onClick={toggle}
      >
        {children({ doneCount, total: quests.length, unseen })}
      </button>

      {open && (
        <div
          id={panelId}
          role="group"
          aria-label="Daily quests"
          className={`absolute top-[calc(100%+10px)] z-30 grid gap-0.5 rounded-[18px] border border-neutral-200 bg-white p-2 shadow-[0_18px_40px_-20px_rgba(20,20,40,0.25)] dark:border-white/10 dark:bg-night-card dark:shadow-[0_18px_40px_-18px_rgba(0,0,0,0.6)] ${panelClassName}`}
        >
          <span className="flex items-center justify-between px-2.5 pt-1.5 pb-1 text-[11px] font-bold tracking-[0.06em] text-ink-soft uppercase dark:text-night-soft">
            <span className="inline-flex items-center gap-1.5">
              <GameIcon name="daily-tasks-notebook" className="size-5" />
              Daily quests
            </span>
            <span className="text-amber-600 tabular-nums">
              {doneCount}/{quests.length}
            </span>
          </span>
          {quests.map((quest) => (
            <button
              key={quest.id}
              type="button"
              className={`focus-ring flex items-center gap-2.5 rounded-xl p-2.5 text-left text-sm font-semibold hover:bg-neutral-100 dark:hover:bg-white/5 ${quest.done ? "text-ink-soft dark:text-night-soft" : "text-neutral-800 dark:text-night-ink"}`}
              onClick={() => {
                setOpen(false);
                if (quest.id === "practice") onStartPractice();
                else onContinueLesson();
              }}
            >
              <span
                className={`grid size-[22px] flex-none place-items-center rounded-full border-2 text-white ${quest.done ? "border-green-600 bg-green-600" : "border-neutral-300 dark:border-white/20"}`}
                aria-hidden="true"
              >
                {quest.done && <CheckIcon className="size-3.5" />}
              </span>
              <span className="flex-1">{quest.label}</span>
              {quest.target > 1 && (
                <span className="text-[12.5px] text-amber-600 tabular-nums">
                  {quest.current}/{quest.target}
                </span>
              )}
              <span className="sr-only">{quest.done ? "done" : "not done"}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
