"use client";

import { useEffect, useState, type ReactNode } from "react";
import { BoltIcon, CheckIcon } from "~/components/ui/icons";
import type { Quest } from "~/types/home";
import { GameIcon } from "./game-icon";

const BookGlyph = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5v-15Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    <path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20v3H6.5A2.5 2.5 0 0 1 4 20.5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
  </svg>
);

const FlameGlyph = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 16 16" aria-hidden="true">
    <path
      d="M8.6 1.2c.3 2.1-.9 3.2-2 4.4C5.4 6.9 4 8.3 4 10.4 4 12.9 5.8 14.8 8 14.8s4-1.9 4-4.3c0-1.9-1-3.2-1.9-4.1-.2 1-.7 1.7-1.4 2 .6-2.6-.3-5.4-.1-7.2z"
      fill="currentColor"
    />
  </svg>
);

// Each quest has a colour of its own, as an "R G B" triplet.
const LOOK: Record<Quest["id"], { tone: string; icon: ReactNode }> = {
  xp: { tone: "245 180 0", icon: <BoltIcon className="size-5" /> },
  lesson: { tone: "59 130 246", icon: <BookGlyph className="size-5" /> },
  practice: { tone: "249 115 22", icon: <FlameGlyph className="size-5" /> },
};

const percent = (quest: Quest | undefined) => (quest ? Math.round((quest.current / quest.target) * 100) : 0);

// Today's quests as bars that fill from where they stood before to where they
// are now: the beat that shows people the quests exist at the moment they move them.
export function DailyQuestProgress({ before, after, className = "" }: { before: Quest[]; after: Quest[]; className?: string }) {
  const [filled, setFilled] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setFilled(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <ul className={`m-0 grid w-full list-none gap-3 p-0 ${className}`} aria-label="Daily quests">
      {after.map((quest, index) => {
        const { tone, icon } = LOOK[quest.id];
        const previous = before[index];
        const moved = quest.current > (previous?.current ?? 0);

        return (
          <li key={quest.id} className="flex items-center gap-3.5 rounded-2xl border border-[#ececea] bg-canvas px-4 py-3 text-left dark:border-[#333336] dark:bg-[#232323]">
            <span className="grid size-10 flex-none place-items-center rounded-xl" style={{ background: `rgb(${tone} / 0.16)`, color: `rgb(${tone})` }}>
              {icon}
            </span>
            <span className="grid min-w-0 flex-1 gap-1.5">
              <span className="flex items-center justify-between gap-3">
                <strong className={`truncate text-[15px] font-semibold ${quest.done ? "text-neutral-800 dark:text-night-ink" : "text-neutral-700 dark:text-[#d4d4d6]"}`}>{quest.label}</strong>
                <span className={`flex-none text-[13px] font-bold tabular-nums ${moved ? "" : "text-[#8a8a86] dark:text-[#7d7d80]"}`} style={moved ? { color: `rgb(${tone})` } : undefined}>
                  {quest.current}/{quest.target}
                </span>
              </span>
              <span className="relative h-2.5 overflow-hidden rounded-full bg-[#e8e8e4] dark:bg-[#3a3a3d]" aria-hidden="true">
                <span
                  className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-700 ease-out motion-reduce:transition-none"
                  style={{ width: `${filled ? percent(quest) : percent(previous)}%`, background: quest.done ? "#22c55e" : `rgb(${tone})`, transitionDelay: `${250 + index * 150}ms` }}
                />
              </span>
            </span>
            {/* Each quest ends in its reward chest, greyed out until earned and
                marked with a check once it is. */}
            <span className="relative flex-none" role="img" aria-label={quest.done ? "done" : "not done yet"}>
              <GameIcon name="treasure-chest" className={`size-9 transition-[filter,opacity] duration-500 ${quest.done ? "" : "opacity-45 grayscale"}`} />
              {quest.done && (
                <span className="absolute -right-1 -bottom-1 grid size-4 place-items-center rounded-full border-2 border-canvas bg-[#22c55e] text-white dark:border-[#232323]">
                  <CheckIcon className="size-2.5" />
                </span>
              )}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
