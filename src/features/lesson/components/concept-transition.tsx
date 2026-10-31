"use client";

import { animate, motion, useReducedMotion } from "motion/react";
import { useLayoutEffect, useRef, type ReactNode } from "react";
import { DevyLottie, DevyMood, type LottieClipName } from "~/components/devy";
import { Button } from "~/components/ui/button";
import { usePrefersReducedMotion } from "~/hooks/use-prefers-reduced-motion";

// The last tap anywhere, so the curtain can burst from the Continue button the
// learner actually pressed. Keyboard use (or a stale tap) falls back to the
// bottom centre, where that button sits.
let lastTap: { x: number; y: number; at: number } | null = null;
if (typeof window !== "undefined") {
  window.addEventListener(
    "pointerdown",
    (event) => {
      lastTap = { x: event.clientX, y: event.clientY, at: Date.now() };
    },
    { capture: true, passive: true },
  );
}

// Where the one-off sparkle burst lands around Devy: [x, y] in px from his
// centre, spread so it reads as a small pop rather than confetti.
const SPARKS = [[-86, -52], [84, -64], [-104, 18], [100, 8], [-58, 70], [64, 66]];

// When Devy lands, after the curtain has opened.
const LAND = 1.05;

const ease = [0.22, 0.61, 0.36, 1] as const;
const CURTAIN_TONES = ["bg-[#93c5fd]", "bg-[#3b82f6] dark:bg-[#2563eb]"];

type ConceptTransitionProps = {
  eyebrow?: string;
  title: string;
  body?: string;
  // A clip for Devy; otherwise the neutral face.
  clip?: LottieClipName;
  // A small accent on Devy marking this beat as a different kind of moment.
  badge?: ReactNode;
  action?: { label: string; onClick: () => void };
  // Pins the button to the bottom edge, as on the lesson-complete sequence.
  pinAction?: boolean;
  accentTitle?: boolean;
  markClassName?: string;
  children?: ReactNode;
  onExit?: () => void;
};

// Shared by the hand-off between concepts, the skill-check intro and the end of
// a lesson. They look alike but are not the same event: the caller picks Devy's
// clip and how much to dress it.
export function ConceptTransition({
  eyebrow,
  title,
  body,
  clip,
  badge,
  action,
  pinAction = false,
  accentTitle = false,
  markClassName = "size-[140px] max-tab:size-[104px]",
  children,
  onExit,
}: ConceptTransitionProps) {
  const reducedMotion = useReducedMotion();
  const prefersReduced = usePrefersReducedMotion();
  const root = useRef<HTMLElement>(null);
  const mark = useRef<HTMLDivElement>(null);
  const curtains = useRef<(HTMLDivElement | null)[]>([]);

  // Two blue waves burst from the tapped button, then open outward from where
  // Devy stands, handing straight over to him landing.
  useLayoutEffect(() => {
    if (prefersReduced) return;
    const bounds = root.current?.getBoundingClientRect();
    const markBounds = mark.current?.getBoundingClientRect();
    const layers = curtains.current.filter((layer): layer is HTMLDivElement => layer !== null);
    if (!bounds || layers.length === 0) return;

    const tap = lastTap && Date.now() - lastTap.at < 1500 ? lastTap : null;
    const burstX = tap ? tap.x - bounds.left : bounds.width / 2;
    const burstY = tap ? tap.y - bounds.top : bounds.height;
    const openX = markBounds ? markBounds.left + markBounds.width / 2 - bounds.left : bounds.width / 2;
    const openY = markBounds ? markBounds.top + markBounds.height / 2 - bounds.top : bounds.height * 0.4;
    // Big enough to reach every corner from wherever the circle starts.
    const cover = Math.hypot(Math.max(burstX, bounds.width - burstX), Math.max(burstY, bounds.height - burstY));
    const reveal = Math.hypot(Math.max(openX, bounds.width - openX), Math.max(openY, bounds.height - openY));

    layers.forEach((layer) => {
      layer.style.setProperty("--open-x", `${openX}px`);
      layer.style.setProperty("--open-y", `${openY}px`);
      layer.style.setProperty("--hole", "0px");
      layer.style.display = "block";
    });

    const runs = layers.flatMap((layer, index) => [
      animate(layer, { clipPath: [`circle(0px at ${burstX}px ${burstY}px)`, `circle(${cover}px at ${burstX}px ${burstY}px)`] }, { duration: 0.5, ease: [0.65, 0, 0.35, 1], delay: index * 0.08 }),
      animate(layer, { "--hole": ["0px", `${reveal}px`] }, { duration: 0.65, ease: [0.55, 0, 1, 0.45], delay: 0.55 + 0.08 * (layers.length - 1 - index) }),
    ]);
    const hide = window.setTimeout(() => layers.forEach((layer) => (layer.style.display = "none")), 1300);
    return () => {
      runs.forEach((run) => run.stop());
      window.clearTimeout(hide);
    };
  }, [prefersReduced]);

  // The copy waits for the curtain.
  const rise = (delay: number) => ({
    initial: reducedMotion ? false : { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.35, delay: reducedMotion ? 0 : LAND + delay, ease },
  });


  return (
    <section ref={root} className="relative flex h-full flex-col overflow-auto bg-white dark:bg-[#1f1f1f]" aria-labelledby="lesson-transition-title">
      {CURTAIN_TONES.map((tone, index) => (
        <div
          key={tone}
          ref={(node) => {
            curtains.current[index] = node;
          }}
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 z-20 hidden [mask-image:radial-gradient(circle_at_var(--open-x,50%)_var(--open-y,40%),transparent_var(--hole,0px),#000_calc(var(--hole,0px)+1px))] motion-reduce:hidden ${tone}`}
          style={{ clipPath: "circle(0px at 50% 100%)" }}
        />
      ))}
      {onExit && (
        <button
          type="button"
          className="focus-ring absolute top-4 left-4 z-10 grid size-11 place-items-center rounded-lg text-[#8a8a86] hover:bg-[#f5f5f5] hover:text-neutral-700 dark:text-night-soft dark:hover:bg-[#262626] dark:hover:text-night-ink"
          onClick={onExit}
          aria-label="Exit lesson"
        >
          <svg className="size-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      )}

      <div className="grid flex-1 place-items-center px-7 py-10 max-tab:px-5 max-tab:py-6">
        <div className="grid w-[min(100%,720px)] justify-items-center text-center">
          <div className="relative mb-5 grid place-items-center max-tab:mb-3">
            <motion.span
              aria-hidden="true"
              className="pointer-events-none absolute size-[300px] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.2),rgba(59,130,246,0.06)_45%,transparent_70%)] max-tab:size-[220px] dark:bg-[radial-gradient(circle,rgba(102,153,236,0.28),rgba(102,153,236,0.08)_45%,transparent_70%)]"
              initial={reducedMotion ? false : { opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: reducedMotion ? 0 : LAND - 0.15, ease }}
            />
            {!reducedMotion &&
              SPARKS.map(([x, y], index) => (
                <motion.span
                  key={index}
                  aria-hidden="true"
                  className={`pointer-events-none absolute rotate-45 rounded-[3px] ${index % 2 ? "size-2 bg-[#6699ec]" : "size-3 bg-amber-400"}`}
                  initial={{ opacity: 0, x: 0, y: 0, scale: 0.2 }}
                  animate={{ opacity: [0, 1, 0], x, y, scale: [0.2, 1, 0.4] }}
                  transition={{ duration: 1, delay: LAND + 0.1 + index * 0.03, times: [0, 0.5, 1], ease: "easeOut" }}
                />
              ))}
            <motion.div
              ref={mark}
              className={`relative ${markClassName}`}
              initial={reducedMotion ? false : { opacity: 0, y: 10, scale: 0.85 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 16, delay: reducedMotion ? 0 : LAND - 0.15 }}
            >
              {clip ? <DevyLottie clip={clip} className="size-full" /> : <DevyMood mood="neutral" className="size-full" />}
              {badge && (
                <span className="absolute -right-1 -bottom-1 grid size-11 place-items-center rounded-2xl border-2 border-white bg-[#2f6fed] text-white shadow-[0_6px_14px_rgba(0,0,0,.28)] max-tab:size-9 dark:border-night-card">
                  {badge}
                </span>
              )}
            </motion.div>
          </div>

          {eyebrow && (
            <motion.span {...rise(0)} className="mb-3 text-[13px] font-semibold text-[#2563eb] dark:text-[#88bdf2]">
              {eyebrow}
            </motion.span>
          )}
          <motion.h1
            {...rise(0.12)}
            id="lesson-transition-title"
            className={`m-0 max-w-[20ch] text-[clamp(25px,2.7vw,34px)] leading-[1.12] font-semibold text-balance max-tab:text-2xl ${accentTitle ? "text-amber-500 dark:text-amber-400" : "text-neutral-800 dark:text-night-ink"}`}
          >
            {title}
          </motion.h1>
          {body && (
            <motion.p {...rise(0.24)} className="mt-4 mb-0 max-w-[48ch] text-base leading-[1.6] text-balance text-ink-soft max-tab:mt-3 max-tab:text-[15px] dark:text-[#b2b2b6]">
              {body}
            </motion.p>
          )}
          {children && <motion.div {...rise(0.36)} className="w-full">{children}</motion.div>}
          {action && !pinAction && (
            <motion.div {...rise(0.36)} className="mt-9 max-tab:mt-7 max-tab:w-full">
              <Button className="min-h-12 min-w-[260px] px-10 text-base font-semibold max-tab:w-full" onClick={action.onClick}>
                {action.label}
              </Button>
            </motion.div>
          )}
        </div>
      </div>

      {action && pinAction && (
        <motion.div {...rise(0.36)} className="flex shrink-0 justify-center px-6 pt-2 pb-7 max-tab:px-4 max-tab:pb-5">
          <Button
            className="relative min-h-14 w-full max-w-[560px] overflow-hidden bg-[linear-gradient(180deg,rgb(255_255_255/0.2),transparent_50%),#2563eb] text-[17px] font-semibold shadow-[0_5px_0_#1e40af,0_18px_30px_-16px_rgb(37_99_235/0.75)] after:pointer-events-none after:absolute after:inset-0 after:-translate-x-full after:animate-sheen after:bg-[linear-gradient(105deg,transparent_35%,rgb(255_255_255/0.35)_50%,transparent_65%)] after:[--idle-delay:2.6s] after:content-[''] motion-reduce:after:animate-none"
            onClick={action.onClick}
          >
            {action.label}
          </Button>
        </motion.div>
      )}
    </section>
  );
}
