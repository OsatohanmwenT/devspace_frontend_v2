"use client";

import { useRef, type ReactNode } from "react";
import { GemIcon } from "~/components/ui/icons";
import { useDismiss } from "~/hooks/use-dismiss";

const MENU_ITEM =
  "focus-ring flex min-h-10 w-full items-center gap-2.5 rounded-lg px-2.5 text-left text-[15px] text-neutral-800 hover:bg-[#f5f5f5] dark:text-night-ink dark:hover:bg-[#262626]";

type LessonHeaderProps = {
  xp: number;
  // Owned by the screen, so Escape closes the menu before it asks to exit.
  menuOpen: boolean;
  onMenuOpenChange: (open: boolean) => void;
  onExit: () => void;
  // Only offered when the lesson has reference material.
  onOpenCheatsheet?: () => void;
  progress: ReactNode;
};

// Exit, where you are in the lesson, XP, and a menu of lesson options.
export function LessonHeader({ xp, menuOpen, onMenuOpenChange, onExit, onOpenCheatsheet, progress }: LessonHeaderProps) {
  const menu = useRef<HTMLDivElement>(null);
  useDismiss(menuOpen, () => onMenuOpenChange(false), menu);

  return (
    <header className="relative grid grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-3 border-b border-[#e8e6e1] bg-[#fdfcf9] px-5 max-[720px]:grid-cols-[minmax(0,1fr)_auto] max-[720px]:gap-2 max-[720px]:px-3.5 dark:border-night-line dark:bg-[#1a1a1a]">
      <button
        type="button"
        className="focus-ring grid size-11 place-items-center rounded-lg text-[#777] hover:bg-[#f5f5f5] hover:text-neutral-700 max-[720px]:hidden dark:text-[#b2b2b6] dark:hover:bg-[#262626] dark:hover:text-night-ink"
        onClick={onExit}
        aria-label="Exit lesson"
      >
        <svg className="size-[21px]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      <div className="w-full min-w-0 justify-self-center">{progress}</div>

      <div className="flex items-center gap-2 justify-self-end">
        <span className="flex h-9 items-center gap-1.5 rounded-full border border-[#e1e1e1] bg-white px-2.5 text-sm font-medium text-neutral-800 max-[720px]:hidden dark:border-night-line dark:bg-night-card dark:text-night-ink" aria-label={`${xp} XP`}>
          <GemIcon className="size-[14px] text-[#513dec]" />
          {xp}
        </span>

        <div ref={menu} className="relative">
          <button
            type="button"
            className={`focus-ring grid size-10 place-items-center rounded-[10px] bg-[#f5f5f5] text-neutral-800 hover:bg-[#eeeeeb] dark:bg-[#262626] dark:text-night-ink dark:hover:bg-[#303030] ${menuOpen ? "" : "animate-options-nudge"}`}
            onClick={() => onMenuOpenChange(!menuOpen)}
            aria-expanded={menuOpen}
            aria-label="Lesson options"
          >
            <svg className="size-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 6h16M4 12h16M4 18h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          {menuOpen && (
            <div className="absolute top-[calc(100%+8px)] right-0 z-20 grid w-[240px] rounded-xl border border-[#eeeeeb] bg-white p-2 shadow-[0_12px_28px_rgba(20,20,20,.12)] dark:border-night-line dark:bg-night-card dark:shadow-[0_12px_28px_rgba(0,0,0,.32)]" role="menu">
              {onOpenCheatsheet && (
                <button
                  type="button"
                  className={MENU_ITEM}
                  role="menuitem"
                  onClick={() => {
                    onMenuOpenChange(false);
                    onOpenCheatsheet();
                  }}
                >
                  <svg className="size-[18px]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M5 4h14v16H5zM8 8h8M8 12h8M8 16h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Cheatsheet
                </button>
              )}
              <button
                type="button"
                className={MENU_ITEM}
                role="menuitem"
                onClick={() => {
                  onMenuOpenChange(false);
                  onExit();
                }}
              >
                <svg className="size-[18px]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
                Exit lesson
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
