"use client";

import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

const DURATION_MS = 1200;
const COLUMN_STARTS = [
  43.068, 39.741, 36.414, 33.087, 29.76, 26.433, 23.105, 19.778, 16.451,
  16.451, 19.778, 23.105, 26.433, 29.76, 33.087, 36.414, 39.741, 43.068,
];

type Transition = { origin: string; onCovered: () => void };
const PageTransitionContext = createContext<((onCovered: () => void) => void) | null>(null);

export function PageTransitionProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [transition, setTransition] = useState<Transition | null>(null);
  const active = transition?.origin === pathname;

  useEffect(() => {
    if (!active) return;
    const timer = window.setTimeout(() => transition.onCovered(), DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [active, transition]);

  function startTransition(onCovered: () => void) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onCovered();
      return;
    }
    setTransition((current) => current?.origin === pathname ? current : { origin: pathname, onCovered });
  }

  return (
    <PageTransitionContext.Provider value={startTransition}>
      {children}
      {active && (
        <div className="pointer-events-none fixed inset-0 z-[100] flex" aria-hidden="true">
          {COLUMN_STARTS.map((start, index) => (
            <span
              key={index}
              className="-mr-px h-full w-[calc(100%/18+1px)] flex-none origin-bottom animate-page-wipe bg-[#e8effa] dark:bg-[#1c1930]"
              style={{
                animationDelay: `${(start / 100) * DURATION_MS}ms`,
                animationDuration: `${(1 - start / 100) * DURATION_MS}ms`,
              }}
            />
          ))}
        </div>
      )}
    </PageTransitionContext.Provider>
  );
}

export function usePageTransition() {
  const startTransition = useContext(PageTransitionContext);
  if (!startTransition) throw new Error("usePageTransition must be used within PageTransitionProvider");
  return startTransition;
}
