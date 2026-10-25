"use client";

import { useSyncExternalStore } from "react";

export type Breakpoint = "mobile" | "tablet" | "desktop";

// Mirrors the `tab` and `desk` breakpoints in globals.css.
const TABLET_QUERY = "(min-width: 681px)";
const DESKTOP_QUERY = "(min-width: 1201px)";

function subscribe(onChange: () => void) {
  const queries = [window.matchMedia(TABLET_QUERY), window.matchMedia(DESKTOP_QUERY)];
  for (const query of queries) query.addEventListener("change", onChange);
  return () => {
    for (const query of queries) query.removeEventListener("change", onChange);
  };
}

function getSnapshot(): Breakpoint {
  if (window.matchMedia(DESKTOP_QUERY).matches) return "desktop";
  return window.matchMedia(TABLET_QUERY).matches ? "tablet" : "mobile";
}

// Which layout tier the viewport is in: mobile up to 680px, tablet up to
// 1200px, desktop above. For layouts that are different trees rather than
// restyled ones.
export function useBreakpoint() {
  return useSyncExternalStore(subscribe, getSnapshot, () => "desktop" as Breakpoint);
}
