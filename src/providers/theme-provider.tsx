"use client";

import { useLayoutEffect, type ReactNode } from "react";
import { THEME_STORAGE_KEY } from "~/lib/theme";

// In development, Strict Mode's remount clears the class the init script set
// on <html>. Re-applying the stored choice before paint keeps dev matching
// production. It is a no-op in production.
export function ThemeProvider({ children }: { children: ReactNode }) {
  useLayoutEffect(() => {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored) {
        document.documentElement.classList.toggle("dark", stored === "dark");
      }
    } catch {
      // Storage blocked: keep whatever the init script applied.
    }
  }, []);

  return children;
}
