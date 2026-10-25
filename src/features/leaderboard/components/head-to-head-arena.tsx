"use client";

import { motion, useReducedMotion } from "motion/react";
import { useId } from "react";
import { Avatar } from "~/components/ui/avatar";
import { CoinIcon } from "~/components/ui/game-icon";

const BOLT_POINTS = "53,0 45,38 53,42 43,76 51,80 47,100";

type HeadToHeadArenaProps = {
  userRole: string;
  userCoins: number;
  rival: { id: string; name: string; role: string };
  rivalCoins: number;
};

export function HeadToHeadArena({ userRole, userCoins, rival, rivalCoins }: HeadToHeadArenaProps) {
  const id = useId();
  const reducedMotion = useReducedMotion();
  const total = userCoins + rivalCoins;
  const push = total === 0 ? 0 : Math.max(-1, Math.min(1, ((userCoins - rivalCoins) / total) * 1.5));

  return (
    <div className="relative grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-4 overflow-hidden rounded-2xl bg-[#0d0d10] px-5 py-6 max-tab:px-3">
      <svg className="pointer-events-none absolute inset-0 size-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id={`${id}-blue`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#0b1f4d" />
            <stop offset="1" stopColor="#1f4fc4" />
          </linearGradient>
          <linearGradient id={`${id}-red`} x1="1" y1="0" x2="0" y2="0">
            <stop offset="0" stopColor="#4d0d14" />
            <stop offset="1" stopColor="#b82533" />
          </linearGradient>
        </defs>
        <motion.g
          initial={false}
          animate={{ x: push * 14 }}
          transition={{ duration: reducedMotion ? 0 : 0.7, ease: [0.2, 0.9, 0.3, 1.2] }}
        >
          <polygon points={`-40,0 ${BOLT_POINTS} -40,100`} fill={`url(#${id}-blue)`} />
          <polygon points={`140,0 ${BOLT_POINTS} 140,100`} fill={`url(#${id}-red)`} />
          <motion.polyline
            points={BOLT_POINTS}
            fill="none"
            stroke="white"
            strokeWidth="2.5"
            strokeLinejoin="miter"
            vectorEffect="non-scaling-stroke"
            className="[filter:drop-shadow(-3px_0_5px_rgba(80,150,255,0.9))_drop-shadow(3px_0_5px_rgba(255,80,95,0.9))]"
            animate={{ opacity: reducedMotion ? 1 : [1, 0.8, 1] }}
            transition={{ duration: 2.8, ease: "easeInOut", repeat: reducedMotion ? 0 : Infinity }}
          />
        </motion.g>
      </svg>

      <div className="relative z-10 grid min-w-0 justify-items-start gap-2 text-left">
        <Avatar seed="you" size="lg" />
        <div className="grid min-w-0 gap-0.5">
          <span className="truncate text-sm font-semibold text-white">You</span>
          <span className="truncate text-xs text-white/70">{userRole}</span>
        </div>
        <strong className="flex items-center gap-1.5 text-3xl font-semibold text-white tabular-nums">
          {userCoins.toLocaleString()} <CoinIcon className="text-[18px]" />
        </strong>
      </div>

      <span className="relative z-10 grid size-9 place-items-center rounded-full bg-black/60 text-xs font-extrabold tracking-[.08em] text-white uppercase ring-1 ring-white/30">vs</span>

      <div className="relative z-10 grid min-w-0 justify-items-end gap-2 text-right">
        <Avatar seed={rival.id} size="lg" />
        <div className="grid min-w-0 gap-0.5">
          <span className="truncate text-sm font-semibold text-white">{rival.name}</span>
          <span className="truncate text-xs text-white/70">{rival.role}</span>
        </div>
        <strong className="flex items-center gap-1.5 text-3xl font-semibold text-white tabular-nums">
          {rivalCoins.toLocaleString()} <CoinIcon className="text-[18px]" />
        </strong>
      </div>
    </div>
  );
}
