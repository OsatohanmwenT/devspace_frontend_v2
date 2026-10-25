"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Avatar } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Drawer } from "~/components/ui/drawer";
import { CoinIcon } from "~/components/ui/game-icon";
import { BackLink } from "~/components/ui/nav-link";
import { saveH2hRival, type LeaderboardData } from "../api/leaderboard-api";
import { HeadToHeadArena } from "./head-to-head-arena";

export function HeadToHeadView({ data, onBack }: { data: LeaderboardData; onBack: () => void }) {
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const [rivalId, setRivalId] = useState(data.h2hRivalId);
  const [locked, setLocked] = useState(data.h2hLocked);
  const [choosing, setChoosing] = useState(false);
  const rival = data.standings.find((entry) => entry.id === rivalId) ?? data.standings.find((entry) => !entry.isCurrentUser)!;
  const rivalCoins = Math.max(1, Math.round(rival.score / 5));
  const difference = Math.abs(data.seasonCoins - rivalCoins);
  const total = data.seasonCoins + rivalCoins;
  const userShare = total === 0 ? 50 : Math.round((data.seasonCoins / total) * 100);
  const statusTone = data.seasonCoins === rivalCoins
    ? "text-[#3d77eb] dark:text-[#89baff]"
    : data.seasonCoins > rivalCoins
      ? "text-[#065f6b] dark:text-[#04adc0]"
      : "text-[#b3272d] dark:text-[#ff676d]";
  const status = data.seasonCoins === rivalCoins ? `Level at ${rivalCoins} — the next coin takes it.` : data.seasonCoins > rivalCoins ? `You lead ${rival.name.split(" ")[0]} by ${difference}` : `${difference} behind ${rival.name.split(" ")[0]}`;

  return (
    <main className="mx-auto grid w-[min(100%,904px)] gap-6 px-[22px] pt-8 pb-16 max-[900px]:px-[18px] max-tab:pt-6" aria-label="Head-to-head">
      <div className="justify-self-start"><BackLink onClick={onBack}>Back to your league</BackLink></div>
      <section className="grid gap-5 rounded-3xl bg-white p-6 shadow-[0_1px_3px_rgba(20,20,20,0.06)] max-tab:p-4 dark:bg-[#1a1a1c] dark:shadow-none" aria-label="This week's matchup">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[11px] font-semibold tracking-[.08em] text-ink-soft uppercase dark:text-night-soft">This week’s matchup</span>
          <span className="rounded-full bg-[#f0f0ee] px-2.5 py-1 text-xs font-medium text-ink-soft dark:bg-[#262626] dark:text-night-soft">{data.h2hTimeLeft}</span>
        </div>

        <HeadToHeadArena userRole={`${data.pathTitle} path`} userCoins={data.seasonCoins} rival={rival} rivalCoins={rivalCoins} />

        <div className="grid gap-2">
          <div className="relative h-2.5 overflow-hidden rounded-full bg-[#f3a5a8] dark:bg-[#ff676d]/70" aria-hidden="true">
            <motion.span className="absolute inset-y-0 left-0 rounded-full bg-[#4d8dff]" initial={false} animate={{ width: `${userShare}%` }} transition={{ duration: reducedMotion ? 0 : 0.5, ease: "easeOut" }} />
            <span className="absolute -inset-y-0.5 left-1/2 w-px bg-neutral-800/30 dark:bg-[#f4f4f2]/40" />
          </div>
          <p className={`flex items-center gap-1 text-sm font-semibold ${statusTone}`} aria-live="polite">
            {status} {data.seasonCoins !== rivalCoins && <CoinIcon />}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button className="min-h-10 text-sm" onClick={() => router.push(`/paths/${data.pathId}`)}>{data.seasonCoins < rivalCoins ? "Close the gap" : "Earn more coins"}</Button>
          {locked ? (
            <span className="text-[13px] text-ink-soft dark:text-night-soft">You picked {rival.name.split(" ")[0]} — locked in until Sunday.</span>
          ) : (
            <Button variant="neutral" className="min-h-10 text-sm" onClick={() => setChoosing(true)}>Choose your rival</Button>
          )}
        </div>
        <p className="border-t border-[#ebe9e4] pt-4 text-xs text-ink-soft dark:border-[#2e2e30] dark:text-night-soft">Most verified coins earned this week wins. Win 3 pts · Draw 1 · Loss 0. Rivalry only — never changes your official coins or rank.</p>
      </section>
      <section className="grid gap-4 rounded-3xl bg-white p-5 shadow-[0_1px_3px_rgba(20,20,20,0.06)] dark:bg-[#1a1a1c] dark:shadow-none" aria-label="This season's head-to-head record">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="grid gap-0.5">
            <span className="text-[11px] font-semibold tracking-[.08em] text-ink-soft uppercase dark:text-night-soft">This season</span>
            <strong className="text-2xl font-semibold text-neutral-800 tabular-nums dark:text-night-ink">0 pts</strong>
          </div>
          <div className="flex flex-wrap gap-1.5 text-xs font-semibold">
            <span className="rounded-full bg-[#e3f6f8] px-2.5 py-1 text-[#065f6b] dark:bg-[#04adc0]/15 dark:text-[#04adc0]">0W</span>
            <span className="rounded-full bg-[#eeeeeb] px-2.5 py-1 text-ink-soft dark:bg-[#2a2a2e] dark:text-night-soft">0D</span>
            <span className="rounded-full bg-[#fdecec] px-2.5 py-1 text-[#b3272d] dark:bg-[#ff676d]/15 dark:text-[#ff676d]">0L</span>
          </div>
        </div>
        <p className="text-[13px] text-ink-soft dark:text-night-soft">No matches settled this season yet — your first result lands at Sunday’s reset.</p>
      </section>
      {choosing && (
        <Drawer title="Choose your rival" subtitle="One pick per week — it locks in until the Sunday reset." onClose={() => setChoosing(false)}>
          <ul className="grid gap-2">
            {data.standings.filter((entry) => !entry.isCurrentUser).slice(0, 6).map((entry) => (
              <li key={entry.id}>
                <button
                  type="button"
                  className={`focus-ring flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-semibold text-neutral-800 dark:text-night-ink ${entry.id === rivalId ? "border-[#3d77eb] bg-[#eaf1ff] dark:border-[#88bdf2] dark:bg-[#1f2a3d]" : "border-[#eeeeeb] bg-white hover:border-neutral-300 dark:border-night-line dark:bg-[#1a1a1c] dark:hover:border-[#5a5a60]"}`}
                  onClick={() => { setRivalId(entry.id); saveH2hRival(entry.id); setLocked(true); setChoosing(false); }}
                >
                  <Avatar seed={entry.id} />
                  <span className="min-w-0 flex-1 truncate">{entry.name}</span>
                  {entry.id === rivalId && <span className="flex-none text-xs text-[#3d77eb] dark:text-[#89baff]">Drawn for you</span>}
                </button>
              </li>
            ))}
          </ul>
        </Drawer>
      )}
    </main>
  );
}
