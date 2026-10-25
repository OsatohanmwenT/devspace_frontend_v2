"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useEffectEvent, useRef, useState, type ReactNode } from "react";

type DrawerProps = {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  // `right` is a side panel; `bottom` is a sheet that can grow to full screen.
  placement?: "right" | "bottom";
  expandable?: boolean;
  compactHeader?: boolean;
};

const CLOSE_MS = 240;
const FOCUSABLE = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

// A panel over a scrim. Unlike the full-bleed overlays elsewhere in the app, it
// deliberately leaves the page visible behind it: the point of a reference
// panel is that you don't lose your place while consulting it.
export function Drawer({
  title,
  subtitle,
  onClose,
  children,
  placement = "right",
  expandable = false,
  compactHeader = false,
}: DrawerProps) {
  const reducedMotion = useReducedMotion();
  const panelRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef<number | undefined>(undefined);
  const [closing, setClosing] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const isBottom = placement === "bottom";

  // The bottom sheet slides away before it unmounts; the side panel just goes.
  const requestClose = () => {
    if (!isBottom || reducedMotion) return onClose();
    if (closing) return;
    setClosing(true);
    closeTimer.current = window.setTimeout(onClose, CLOSE_MS);
  };
  const closeFromKeyboard = useEffectEvent(requestClose);

  useEffect(() => {
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        closeFromKeyboard();
        return;
      }
      if (event.key !== "Tab") return;
      // Keep focus inside the panel while it is open.
      const focusable = panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown, true);
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, []);

  useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  const shift = isBottom && !reducedMotion ? 28 : 0;
  const panelSize = isBottom
    ? expanded
      ? "h-full w-full"
      : "h-[calc(100%-100px)] w-[calc(100%-40px)] rounded-t-3xl border border-b-0 border-[#e1e1e1] shadow-[0_-8px_24px_rgba(20,20,20,0.10)] max-tab:h-[86vh] max-tab:w-full max-tab:rounded-t-2xl dark:border-night-line dark:shadow-[0_-12px_32px_rgba(0,0,0,.34)]"
    : "h-full w-[min(100%,560px)] border-l border-[#e1e1e1] shadow-[-8px_0_24px_rgba(20,20,20,0.08)] dark:border-night-line dark:shadow-none";
  const iconButton =
    "grid flex-none place-items-center rounded-lg text-ink-soft hover:bg-[#f2f2f0] hover:text-neutral-700 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-400 dark:text-[#b2b2b6] dark:hover:bg-[#262629] dark:hover:text-white";

  return (
    <div className={`fixed inset-0 z-40 flex ${isBottom ? "items-end justify-center" : "justify-end"}`}>
      <motion.button
        type="button"
        className="absolute inset-0 size-full cursor-default bg-black/30 dark:bg-black/55"
        initial={{ opacity: 0 }}
        animate={{ opacity: closing ? 0 : 1 }}
        transition={{ duration: closing ? 0.22 : 0.18 }}
        onClick={requestClose}
        aria-label="Close panel"
        tabIndex={-1}
      />

      <motion.section
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative grid grid-rows-[auto_minmax(0,1fr)] bg-white transition-[width,height,border-radius] duration-300 dark:bg-[#151517] ${panelSize}`}
        initial={{ opacity: 0, y: shift }}
        animate={{ opacity: closing ? 0 : 1, y: closing ? shift : 0 }}
        transition={{ duration: closing ? 0.24 : 0.32, ease: [0.16, 1, 0.3, 1] }}
      >
        {isBottom && !expanded && (
          <span className="absolute top-2.5 left-1/2 h-1 w-10 -translate-x-1/2 rounded-full bg-[#c8c8c4] dark:bg-[#6b6b70]" aria-hidden="true" />
        )}
        <header
          className={`flex items-center justify-between gap-4 border-b border-[#e1e1e1] px-6 py-4 max-tab:px-4 dark:border-night-line ${isBottom && !compactHeader ? "pt-6" : ""} ${compactHeader ? "px-5 py-2" : ""}`}
        >
          <div className="min-w-0">
            <h2 className={`m-0 font-semibold text-neutral-800 dark:text-night-ink ${compactHeader ? "text-[15px]" : "text-xl"}`}>{title}</h2>
            {subtitle && <p className="mt-0.5 mb-0 text-[13px] text-ink-soft dark:text-night-soft">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-2">
            {isBottom && expandable && (
              <button
                type="button"
                className={`rounded-lg border border-[#e1e1e1] text-xs font-semibold text-ink-soft hover:bg-[#f2f2f0] hover:text-neutral-700 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-400 dark:border-night-line dark:text-[#b2b2b6] dark:hover:bg-[#262629] dark:hover:text-white ${compactHeader ? "min-h-8 px-2.5" : "min-h-9 px-3"}`}
                onClick={() => setExpanded((value) => !value)}
                aria-pressed={expanded}
              >
                {expanded ? "Minimize" : "Full screen"}
              </button>
            )}
            <button ref={closeRef} type="button" className={`${iconButton} ${compactHeader ? "size-8" : "size-9"}`} onClick={requestClose} aria-label="Close">
              <svg className="size-[18px]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </header>
        <div className="min-h-0 overflow-y-auto px-6 py-6 max-tab:px-4">{children}</div>
      </motion.section>
    </div>
  );
}
