"use client";

import { useEffect, useState } from "react";

type LoadState<T> = { status: "loading" } | { status: "ready"; data: T } | { status: "error" };

// Loads data once on mount. Screens render a loading state from the first
// frame, because every API call is async.
export function useLoad<T>(load: () => Promise<T>): LoadState<T> {
  const [state, setState] = useState<LoadState<T>>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    load().then(
      (data) => !cancelled && setState({ status: "ready", data }),
      () => !cancelled && setState({ status: "error" }),
    );
    return () => {
      cancelled = true;
    };
  }, [load]);

  return state;
}
