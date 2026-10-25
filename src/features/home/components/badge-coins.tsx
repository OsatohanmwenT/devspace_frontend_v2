import type { Badge } from "~/types/home";

function describe(badge: Badge, streakDays: number) {
  if (badge.state === "earned") return `${badge.label} · ${badge.days}-day streak`;
  if (badge.state === "next") {
    const remaining = badge.days - streakDays;
    return `${remaining} more ${remaining === 1 ? "day" : "days"} to ${badge.label}`;
  }
  return `${badge.label} · ${badge.days} days`;
}

// Each badge is a coin: earned ones are glossy gold, unearned ones sit as a
// recessed socket, a badge waiting to be collected.
export function BadgeCoins({ badges, streakDays }: { badges: Badge[]; streakDays: number }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {badges.map((badge) => (
        <span
          key={badge.days}
          title={describe(badge, streakDays)}
          className={`relative grid size-11 place-items-center rounded-full before:absolute before:inset-[5px] before:rounded-full before:border before:content-[''] ${
            badge.state === "earned"
              ? "bg-[radial-gradient(circle_at_35%_28%,#fff4c2_0%,#f5c542_38%,#d99a0b_76%,#b67a05_100%)] text-[#8a5a00] shadow-[inset_0_0_0_1.5px_rgb(255_255_255_/_0.35),inset_0_-3px_6px_rgb(120_70_0_/_0.35),0_4px_10px_rgb(217_154_11_/_0.3)] before:border-white/45"
              : "bg-[radial-gradient(circle_at_50%_28%,#ffffff_0%,#eef0f3_78%)] text-neutral-400 shadow-[inset_0_0_0_1px_#e1e3e8,inset_0_2px_5px_rgb(15_23_42_/_0.08),0_1px_2px_rgb(15_23_42_/_0.04)] before:border-slate-900/6 dark:bg-[radial-gradient(circle_at_50%_30%,rgb(255_255_255_/_0.08),rgb(255_255_255_/_0.02)_72%)] dark:text-white/30 dark:shadow-[inset_0_0_0_1px_rgb(255_255_255_/_0.1),inset_0_2px_6px_rgb(0_0_0_/_0.45),0_1px_0_rgb(255_255_255_/_0.05)] dark:before:border-white/7"
          }`}
        >
          <svg className="relative size-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="9" r="5.25" stroke="currentColor" strokeWidth="1.8" />
            <path
              d="m8.5 14-1.25 5.25L12 17l4.75 2.25L15.5 14"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      ))}
    </span>
  );
}
