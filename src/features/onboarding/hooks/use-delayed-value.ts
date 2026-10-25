"use client";

import { useEffect, useState } from "react";

// `value`, but only after it has held for `ms`.
export function useDelayedValue<T>(value: T, ms: number) {
  const [delayed, setDelayed] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDelayed(value), ms);
    return () => window.clearTimeout(timer);
  }, [value, ms]);

  return delayed;
}
