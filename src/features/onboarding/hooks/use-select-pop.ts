"use client";

import { useEffect, useState } from "react";
import { POP } from "../lib/motion-presets";

// Tracks which option was just chosen so it can play its one-shot pop while
// its siblings soften for the same beat.
export function useSelectPop() {
  const [popping, setPopping] = useState<string | number | null>(null);

  useEffect(() => {
    if (popping === null) return;
    const timer = window.setTimeout(() => setPopping(null), POP.duration * 1000 + 20);
    return () => window.clearTimeout(timer);
  }, [popping]);

  return [popping, setPopping] as const;
}
