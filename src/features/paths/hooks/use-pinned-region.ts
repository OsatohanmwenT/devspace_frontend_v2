"use client";

import { useEffect, useState } from "react";

// Matches the sticky offset of a region header, just below the site header.
const PIN_TOP = 86;

// Which region header is currently stuck under the site header, if any. The
// pinned header paints a cover behind itself so lessons scrolling underneath
// don't show through the gap above it.
export function usePinnedRegion(pathId: string) {
  const [pinnedId, setPinnedId] = useState<string | null>(null);

  useEffect(() => {
    const update = () => {
      const pinned = [...document.querySelectorAll<HTMLElement>("[data-region-header]")]
        .filter((header) => {
          const bounds = header.getBoundingClientRect();
          return bounds.top <= PIN_TOP && bounds.bottom > PIN_TOP;
        })
        .at(-1);
      setPinnedId(pinned?.dataset.regionHeader ?? null);
    };

    const frame = requestAnimationFrame(update);
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [pathId]);

  return pinnedId;
}
