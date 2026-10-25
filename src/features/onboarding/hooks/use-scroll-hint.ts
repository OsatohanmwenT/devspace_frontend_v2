"use client";

import { useEffect, useState, type RefObject } from "react";

const THRESHOLD = 12;

// True while the scroll area has more content below the fold. Re-measures when
// `contentKey` changes (a new screen), when the area or its content resizes,
// when a screen swap replaces the content, and when the area scrolls.
//
// The scroll area itself never changes size, so resizing alone would miss
// content that grows after mount; each child is observed as well, and
// re-observed whenever the children are replaced.
export function useScrollHint(ref: RefObject<HTMLElement | null>, contentKey: string) {
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    const area = ref.current;
    if (!area) return;

    const measure = () =>
      setHasMore(area.scrollHeight - area.clientHeight - area.scrollTop > THRESHOLD);

    const resizeObserver = new ResizeObserver(measure);
    const observeContent = () => {
      resizeObserver.disconnect();
      resizeObserver.observe(area);
      for (const child of area.children) resizeObserver.observe(child);
      measure();
    };

    const mutationObserver = new MutationObserver(observeContent);
    mutationObserver.observe(area, { childList: true });
    const frame = window.requestAnimationFrame(observeContent);
    area.addEventListener("scroll", measure, { passive: true });

    return () => {
      window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      area.removeEventListener("scroll", measure);
    };
  }, [ref, contentKey]);

  return hasMore;
}
