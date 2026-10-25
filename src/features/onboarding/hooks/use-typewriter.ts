"use client";

import { useEffect, useState } from "react";
import { usePrefersReducedMotion } from "~/hooks/use-prefers-reduced-motion";

// Reveals `text` a character at a time. Under reduced motion the full line
// just appears. Mount it fresh (via `key`) for each new line.
export function useTypewriter(text: string, speed = 18) {
  const reducedMotion = usePrefersReducedMotion();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (reducedMotion) return;
    const id = window.setInterval(() => {
      setCount((current) => {
        if (current + 1 >= text.length) window.clearInterval(id);
        return Math.min(current + 1, text.length);
      });
    }, speed);
    return () => window.clearInterval(id);
  }, [text, speed, reducedMotion]);

  return reducedMotion ? text : text.slice(0, count);
}
