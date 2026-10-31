"use client";

import { motion, useReducedMotion } from "motion/react";
import { Button } from "~/components/ui/button";
import { GameIcon } from "~/components/ui/game-icon";
import { CheckIcon } from "~/components/ui/icons";
import { useCountUp } from "~/hooks/use-count-up";

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];
const PAUSE = { duration: 0.4, ease: [0.22, 0.61, 0.36, 1] as const };

type StreakCelebrationProps = {
  before: number;
  after: number;
  // Days with activity, as `Date.toDateString()` values.
  dates: string[];
  onContinue: () => void;
};

// The streak moment: the bolt charges, the count ticks up and this week's
// days link together, today's last.
export function StreakCelebration({ before, after, dates, onContinue }: StreakCelebrationProps) {
  const reducedMotion = useReducedMotion();
  const count = useCountUp(after, { from: before, delay: 0.65, duration: 0.5 });
  const today = new Date();
  const monday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - ((today.getDay() + 6) % 7));
  const week = WEEKDAYS.map((letter, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    const key = date.toDateString();
    return { key, letter, done: dates.includes(key), isToday: key === today.toDateString() };
  });
  const message = after === 1 ? "A new streak! Practice every day to help it grow." : `${after} days in a row — keep it going tomorrow!`;
  const enter = (delay: number, from: object) => ({ initial: reducedMotion ? false : { opacity: 0, ...from }, animate: { opacity: 1, x: 0, y: 0, scale: 1 }, transition: { ...PAUSE, delay: reducedMotion ? 0 : delay } });

  return (
    <section className="flex h-full flex-col overflow-auto bg-white dark:bg-[#1f1f1f]" aria-labelledby="streak-celebration-title">
      <div className="grid flex-1 place-items-center px-7 py-10 max-tab:px-5">
        <div className="grid justify-items-center text-center">
          <motion.p
            {...enter(0.5, { y: 10, scale: 0.9 })}
            className="relative m-0 mb-3 max-w-[32ch] rounded-2xl border border-[#e6e6e2] bg-white px-4 py-3 text-[15px] leading-[1.45] font-medium text-neutral-800 shadow-[0_10px_24px_-16px_rgba(20,20,40,.25)] dark:border-[#3a3a3d] dark:bg-[#262626] dark:text-[#e4e4e6] dark:shadow-[0_10px_24px_-16px_rgba(0,0,0,.6)]"
          >
            {message}
            <span className="absolute -bottom-[7px] left-[70%] size-3 rotate-45 border-r border-b border-[#e6e6e2] bg-white dark:border-[#3a3a3d] dark:bg-[#262626]" aria-hidden="true" />
          </motion.p>

          {/* Lightning is the app's streak mark, so it carries this moment on its own. */}
          <div className="relative size-[200px] max-tab:size-[168px]">
            <motion.span
              {...enter(0, { scale: 0.5 })}
              aria-hidden="true"
              className="absolute -inset-[30px] rounded-full bg-[radial-gradient(circle,rgba(255,200,0,0.28),rgba(255,170,0,0.08)_45%,transparent_70%)] dark:bg-[radial-gradient(circle,rgba(255,214,0,0.32),rgba(255,184,0,0.1)_45%,transparent_70%)]"
            />
            <motion.span {...enter(0, { scale: 0.3, y: 30 })} className="absolute inset-x-0 top-0 grid origin-bottom justify-items-center">
              <GameIcon name="lightning-bolt" className="h-[184px] w-[180px] origin-bottom animate-bolt-charge max-tab:h-[154px] max-tab:w-[150px] motion-reduce:animate-none" />
            </motion.span>
          </div>

          <motion.strong
            {...enter(0.65, { scale: 1.4 })}
            id="streak-celebration-title"
            className="mt-3 bg-gradient-to-b from-yellow-300 to-amber-500 bg-clip-text text-[76px] leading-none font-extrabold text-transparent max-tab:text-6xl"
          >
            {count}
          </motion.strong>
          <span className="mt-1 text-xl font-bold text-amber-500 dark:text-amber-400">day streak</span>

          <motion.div
            {...enter(0.9, { y: 14 })}
            className="mt-8 rounded-3xl border border-[#ececea] bg-canvas px-6 py-5 max-tab:mt-6 max-tab:px-4 max-tab:py-4 dark:border-[#333336] dark:bg-[#232323]"
          >
            <ol className="m-0 grid list-none grid-cols-7 gap-x-3 p-0 max-tab:gap-x-2" aria-label="This week">
              {week.map((day, index) => (
                <li key={day.key} className="relative grid justify-items-center gap-2" aria-label={`${day.key}: ${day.done ? "active" : "not active"}`}>
                  <span className={`text-xs leading-4 font-bold ${day.isToday ? "text-amber-500 dark:text-amber-400" : "text-[#9a9a9d] dark:text-[#7d7d80]"}`}>{day.letter}</span>
                  {day.done && week[index + 1]?.done && (
                    <span aria-hidden="true" className="absolute top-[38px] left-1/2 h-2 w-[calc(100%+0.75rem)] bg-amber-400 max-tab:w-[calc(100%+0.5rem)]" />
                  )}
                  {day.done ? (
                    <span className={`relative grid size-9 place-items-center rounded-full bg-gradient-to-b from-yellow-300 to-amber-500 text-white shadow-[0_4px_10px_-4px_rgba(245,180,0,.7)] ${day.isToday ? "ring-4 ring-amber-400/25" : ""}`}>
                      <CheckIcon className="size-4" />
                    </span>
                  ) : (
                    <span className="relative size-9 rounded-full border-2 border-dashed border-[#dededa] dark:border-[#3a3a3d]" />
                  )}
                </li>
              ))}
            </ol>
          </motion.div>
        </div>
      </div>
      <div className="flex shrink-0 justify-center px-6 pt-2 pb-7 max-tab:px-4 max-tab:pb-5">
        <Button className="min-h-14 w-full max-w-[560px] text-[17px] font-semibold" onClick={onContinue}>
          Continue
        </Button>
      </div>
    </section>
  );
}
