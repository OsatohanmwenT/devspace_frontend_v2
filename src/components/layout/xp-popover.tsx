const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

// Today's XP against the daily goal, and the week as seven bars. Only today's
// bar carries data until there is a weekly history to draw.
export function XpPopover({ earnedToday, xpGoal }: { earnedToday: number; xpGoal: number }) {
  const jsDay = new Date().getDay();
  const todayIndex = jsDay === 0 ? 6 : jsDay - 1;
  const goalPercent = Math.min(100, Math.round((earnedToday / Math.max(1, xpGoal)) * 100));

  return (
    <div
      className="absolute top-[calc(100%+10px)] right-0 z-[6] grid w-[300px] gap-3.5 rounded-[18px] border border-line bg-white p-5 text-left shadow-[0_8px_24px_rgba(20,20,20,0.10)] dark:border-night-line dark:bg-night-card dark:shadow-none"
      role="dialog"
      aria-label="Daily and weekly XP activity"
    >
      <div>
        <h2 className="m-0 text-lg font-semibold text-neutral-800 dark:text-night-ink">
          You earned <strong className="text-blue-600 dark:text-blue-400">{earnedToday} XP</strong> today!
        </h2>
        <div className="mt-2 flex items-center justify-between text-xs text-ink-soft dark:text-night-soft">
          <span>Daily goal: {xpGoal} XP</span>
          <span className="font-semibold text-neutral-800 dark:text-night-ink">{goalPercent}%</span>
        </div>
        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
          <div
            className="h-full rounded-full bg-blue-600 transition-all duration-300 dark:bg-blue-400"
            style={{ width: `${goalPercent}%` }}
          />
        </div>
      </div>
      <p className="mt-0.5 mb-0 text-xs text-ink-soft dark:text-night-soft">
        Here’s a look at your weekly activity
      </p>
      <div className="flex items-end justify-between gap-2" role="img" aria-label="Weekly XP earned">
        {DAY_LABELS.map((label, index) => {
          const isToday = index === todayIndex;
          return (
            <div className="grid flex-1 justify-items-center gap-2" key={index}>
              <span className="flex h-16 w-2.5 items-end overflow-hidden rounded-full">
                <span
                  className={`block w-full rounded-[inherit] ${isToday ? "bg-blue-600 dark:bg-blue-400" : "bg-neutral-200 dark:bg-neutral-800"}`}
                  style={{ height: isToday && earnedToday > 0 ? `${Math.max(15, goalPercent)}%` : "10%" }}
                />
              </span>
              <small
                className={`text-[11px] ${isToday ? "font-bold text-blue-600 dark:text-blue-400" : "font-semibold text-ink-soft dark:text-night-soft"}`}
              >
                {label}
              </small>
            </div>
          );
        })}
      </div>
    </div>
  );
}
