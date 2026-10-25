"use client";

import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";
import { DevyMood } from "~/components/devy/devy-mood";
import { Button } from "~/components/ui/button";
import { GameIcon } from "~/components/ui/game-icon";
import { CheckIcon, LockIcon } from "~/components/ui/icons";
import { STREAK_MILESTONES } from "~/config/streak-milestones";
import type { ProgressSummary } from "~/types/progress";

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];

export function StreakJourneyDrawer({
  summary,
  onClose,
  onKeepStreak,
}: {
  summary: ProgressSummary;
  onClose: () => void;
  onKeepStreak: () => void;
}) {
  const [now, setNow] = useState(() => new Date());
  const panelRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
      }
      if (event.key !== "Tab") return;
      const focusable = panelRef.current?.querySelectorAll<HTMLElement>("button:not([disabled]), a[href]");
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown, true);
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, [onClose]);

  useEffect(() => {
    if (!summary.streakAtRisk) return;
    const interval = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(interval);
  }, [summary.streakAtRisk]);

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayKey = today.toDateString();
  const activeToday = summary.lastActiveDate === todayKey;
  const activeDates = new Set(summary.streakActivityDates);
  if (summary.lastActiveDate && summary.streakDays > 0) {
    const date = new Date(summary.lastActiveDate);
    for (let index = 0; index < Math.min(summary.streakDays, 30); index += 1) {
      activeDates.add(date.toDateString());
      date.setDate(date.getDate() - 1);
    }
  }
  const activity = Array.from({ length: 30 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (29 - index));
    const key = date.toDateString();
    return { key, active: activeDates.has(key), today: key === todayKey };
  });
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  const week = WEEKDAYS.map((label, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    const key = date.toDateString();
    return { key, label, active: activeDates.has(key), today: key === todayKey, future: date > today };
  });
  const nextMilestone = STREAK_MILESTONES.find((tier) => tier.days > summary.streakDays);
  const minutesLeft = Math.max(0, Math.floor((new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).getTime() - now.getTime()) / 60_000));
  const status = summary.streakAtRisk
    ? `${String(Math.floor(minutesLeft / 60)).padStart(2, "0")}h ${String(minutesLeft % 60).padStart(2, "0")}m left to keep your streak`
    : activeToday
      ? "You're covered for today. Come back tomorrow."
      : "Finish a lesson or practice round to begin.";

  return createPortal(
    <div className="fixed inset-0 z-70 flex justify-end">
      <button type="button" className="absolute inset-0 cursor-default bg-black/30 dark:bg-black/55" onClick={onClose} aria-label="Close streak journey" tabIndex={-1} />
      <section ref={panelRef} id="streak-journey-dialog" role="dialog" aria-modal="true" aria-labelledby="streak-journey-title" className="relative grid h-full w-[min(100%,560px)] grid-rows-[auto_minmax(0,1fr)] border-l border-line bg-white shadow-[-8px_0_24px_rgba(20,20,20,0.08)] dark:border-night-line dark:bg-[#151517] dark:shadow-none">
        <header className="flex items-center justify-between border-b border-line px-6 py-4 dark:border-night-line">
          <h2 id="streak-journey-title" className="m-0 text-xl font-semibold text-neutral-800 dark:text-night-ink">Streak journey</h2>
          <button ref={closeRef} type="button" className="focus-ring grid size-9 place-items-center rounded-lg text-ink-soft hover:bg-neutral-100 dark:text-night-soft dark:hover:bg-neutral-800" onClick={onClose} aria-label="Close">
            <svg className="size-[18px]" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          </button>
        </header>
        <div className="min-h-0 overflow-y-auto px-6 py-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden max-[680px]:px-4">
          <div className="grid gap-7">
            <div className="grid gap-3">
              <div className="flex items-center gap-3">
                <GameIcon name="lightning-bolt" className="size-12 flex-none" />
                <span className="grid">
                  <strong className="text-[40px] leading-none font-semibold tracking-[-0.04em] text-neutral-800 dark:text-night-ink">{summary.streakDays}</strong>
                  <span className="text-[13px] font-semibold text-ink-soft dark:text-night-soft">day streak</span>
                </span>
                {(summary.streakAtRisk || activeToday) && <DevyMood mood={summary.streakAtRisk ? "annoyed" : "celebrating"} className="-my-2 ml-auto size-[72px] flex-none" />}
              </div>
              <p className={`m-0 text-[13px] ${summary.streakAtRisk ? "text-red-700 dark:text-red-400" : "text-ink-soft dark:text-night-soft"}`} role="status">{status}</p>
              {summary.lastStreakProtection && <p className="m-0 text-[13px] text-ink-soft dark:text-night-soft">{summary.lastStreakProtection === "shield" ? "A Premium shield" : "An earned restore"} covered your last missed day.</p>}
              {!activeToday && <Button className="mt-1 min-h-11 w-full text-[15px]" onClick={onKeepStreak}>{summary.streakDays ? "Keep my streak" : "Start my streak"}</Button>}
            </div>

            <ol className="m-0 grid list-none grid-cols-7 gap-2 p-0" aria-label="This week">
              {week.map((day) => (
                <li key={day.key} className="grid justify-items-center gap-1.5" aria-label={`${day.key}: ${day.active ? "active" : day.today ? "today, not yet active" : day.future ? "upcoming" : "no activity"}`} aria-current={day.today ? "date" : undefined}>
                  <span className={`text-[11px] font-semibold ${day.today ? "text-neutral-800 dark:text-night-ink" : "text-neutral-400 dark:text-neutral-500"}`}>{day.label}</span>
                  <span className={`grid size-9 place-items-center rounded-full ${day.active ? "bg-amber-400 text-amber-950" : day.today ? "border-2 border-dashed border-amber-400" : day.future ? "border border-line dark:border-night-line" : "bg-neutral-100 dark:bg-neutral-800"}`} aria-hidden="true">
                    {day.active && <CheckIcon className="size-3.5" />}
                  </span>
                </li>
              ))}
            </ol>

            <div className="grid grid-cols-2 gap-2">
              <div className="grid gap-0.5 rounded-xl bg-neutral-100 px-3.5 py-3 dark:bg-neutral-800"><strong className="text-[17px] text-neutral-800 dark:text-night-ink">{summary.longestStreak} {summary.longestStreak === 1 ? "day" : "days"}</strong><span className="text-xs text-ink-soft dark:text-night-soft">Longest streak</span></div>
              <div className="grid gap-0.5 rounded-xl bg-neutral-100 px-3.5 py-3 dark:bg-neutral-800"><strong className="text-[17px] text-neutral-800 dark:text-night-ink">{summary.streakRestoreCredits}</strong><span className="text-xs text-ink-soft dark:text-night-soft">Restores left</span></div>
            </div>

            <div className="grid gap-2">
              <span className="text-xs font-semibold text-ink-soft dark:text-night-soft">Last 30 days</span>
              <ol className="m-0 grid w-full list-none grid-cols-[repeat(15,minmax(0,1fr))] gap-1 p-0" aria-label="Activity over the last 30 days">
                {activity.map((day) => <li key={day.key} className={`aspect-square rounded-[4px] ${day.active ? "bg-amber-400" : day.today ? "border border-dashed border-neutral-400" : "bg-neutral-100 dark:bg-neutral-800"}`} aria-label={`${day.key}: ${day.active ? "active" : day.today ? "today, not yet active" : "no activity"}`} aria-current={day.today ? "date" : undefined} />)}
              </ol>
            </div>

            <div className="grid gap-4">
              <div className="flex items-center gap-3 text-sm font-semibold text-neutral-800 dark:text-night-ink">Milestones and rewards<span className="h-px flex-1 bg-line dark:bg-night-line" /></div>
              <ol className="relative m-0 grid list-none gap-4 p-0 before:absolute before:top-4 before:bottom-4 before:left-[17px] before:w-px before:bg-line before:content-[''] dark:before:bg-night-line">
                <li className="flex items-start gap-3">
                  <span className={`relative z-1 grid size-9 flex-none place-items-center rounded-lg border border-amber-400 text-[11px] font-bold ${summary.streakDays > 0 ? "bg-amber-400 text-amber-950" : "bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300"}`}>0d</span>
                  <span className="grid gap-0.5 pt-1"><strong className="text-sm text-neutral-800 dark:text-night-ink">Start your streak</strong>{summary.streakDays === 0 && <span className="text-[13px] text-ink-soft dark:text-night-soft">Any lesson or practice round counts.</span>}</span>
                </li>
                {STREAK_MILESTONES.map((tier) => {
                  const earned = summary.earnedStreakMilestones.includes(tier.days);
                  const next = nextMilestone?.days === tier.days;
                  return (
                    <li key={tier.days} className="flex items-start gap-3">
                      <span className={`relative z-1 grid size-9 flex-none place-items-center rounded-lg border text-[11px] font-bold ${earned ? "border-amber-400 bg-amber-400 text-amber-950" : next ? "border-amber-400 bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300" : "border-line bg-white text-neutral-400 dark:border-night-line dark:bg-night-card dark:text-night-soft"}`}>{tier.days}d</span>
                      <span className="grid min-w-0 gap-0.5 pt-1">
                        <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                          <strong className={`flex items-center gap-1.5 text-sm ${earned || next ? "text-neutral-800 dark:text-night-ink" : "text-ink-soft dark:text-night-soft"}`}>{!earned && !next && <LockIcon className="size-3" />}{tier.label}{earned && <CheckIcon className="size-3.5 text-amber-500" />}</strong>
                          <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${earned ? "bg-amber-100 text-amber-800 dark:bg-amber-400/15 dark:text-amber-300" : next ? "border border-amber-400/50 text-amber-700 dark:text-amber-300" : "bg-neutral-100 text-ink-soft dark:bg-neutral-800 dark:text-night-soft"}`}>Streak restore ×{tier.restores}</span>
                        </span>
                        {(earned || next) && <span className="text-[13px] text-ink-soft dark:text-night-soft">{earned ? "Earned. Covers a missed day automatically." : `${tier.days - summary.streakDays} more ${tier.days - summary.streakDays === 1 ? "day" : "days"} to unlock.`}</span>}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        </div>
      </section>
    </div>,
    document.body,
  );
}
