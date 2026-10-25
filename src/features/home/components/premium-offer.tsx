"use client";

import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { useToast } from "~/providers/toast-provider";

function Gem() {
  return (
    <svg className="size-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m7 3-5 6 10 12L22 9l-5-6H7Zm-5 6h20M7 3l5 18L17 3" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

// The desktop offer stays at the bottom left, and collapses to a small tab.
export function PremiumOffer() {
  const [collapsed, setCollapsed] = useState(false);
  const reducedMotion = useReducedMotion();
  const toast = useToast();

  return (
    <div className="fixed bottom-0 left-6 z-50">
      <motion.div
        layout={!reducedMotion}
        transition={{ layout: { type: "spring", stiffness: 320, damping: 30, mass: 0.8 } }}
        className={collapsed ? "w-[228px]" : "w-[360px]"}
      >
        {collapsed ? (
          <button
            type="button"
            data-cuelume-toggle
            className="focus-ring flex h-12 w-full items-center gap-2.5 rounded-t-[18px] border border-neutral-200 bg-white px-4 text-sm font-semibold text-neutral-800 shadow-[0_12px_28px_rgb(20_20_20_/_0.14)] hover:bg-neutral-50 dark:border-white/10 dark:bg-[#232323] dark:text-night-ink dark:shadow-[0_12px_28px_rgb(0_0_0_/_0.24)] dark:hover:bg-[#2a2a2a]"
            aria-expanded="false"
            onClick={() => setCollapsed(false)}
          >
            <span className="text-[#2563eb] dark:text-[#88bdf2]"><Gem /></span>
            Devspace Pro
            <svg className="ml-auto size-4 text-night-soft" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m9 18 6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        ) : (
          <section id="premium-offer-panel" className="relative w-full overflow-hidden rounded-t-[16px] border border-neutral-200 bg-white p-6 text-neutral-800 shadow-[0_18px_40px_rgb(20_20_20_/_0.14)] dark:border-white/10 dark:bg-[#232323] dark:text-night-ink dark:shadow-[0_18px_40px_rgb(0_0_0_/_0.28)]" aria-labelledby="premium-offer-title">
            <button type="button" data-cuelume-toggle className="focus-ring absolute top-4 right-4 grid size-9 place-items-center rounded-full text-ink-soft hover:bg-black/5 dark:text-night-soft dark:hover:bg-white/10" aria-label="Collapse Devspace Pro offer" onClick={() => setCollapsed(true)}>
              <svg className="size-4" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <span className="mb-4 grid size-10 place-items-center rounded-xl bg-[linear-gradient(86deg,#7491ff33_-7.44%,#ff90e033_44.8%,#f7c32533_102.54%)] text-[#2563eb] dark:text-[#88bdf2]"><Gem /></span>
            <h2 id="premium-offer-title" className="m-0 pr-8 text-[21px] font-bold tracking-[-0.03em]">Keep your streak protected</h2>
            <p className="mt-2 max-w-[32ch] text-sm leading-5 text-ink-soft dark:text-[#b6bac4]">Devspace Pro gives you streak protection and more room to keep learning on your schedule.</p>
            <button
              type="button"
              data-cuelume-press="pulse"
              data-cuelume-release="release"
              className="focus-ring mt-5 min-h-11 w-full rounded-full bg-[linear-gradient(86deg,#748fff_0%,#ff90e0_44.8%,#f7c325_100%)] px-4 text-sm font-semibold text-neutral-800 shadow-[inset_0_-4px_0_rgba(20,37,99,.3)] transition-[transform,filter,box-shadow] duration-75 hover:brightness-105 active:translate-y-1 active:shadow-[inset_0_-1px_0_rgba(20,37,99,.3)]"
              onClick={() => toast("Devspace Pro is coming soon")}
            >
              Explore Devspace Pro
            </button>
          </section>
        )}
      </motion.div>
    </div>
  );
}
