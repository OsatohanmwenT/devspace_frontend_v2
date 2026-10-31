"use client";

import { motion, useAnimationFrame, useReducedMotion } from "motion/react";
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { DevyLottie } from "~/components/devy";
import type { ChatMessage, HomeMode } from "../hooks/use-devy-chat";
import type { Suggestion, SuggestionIcon } from "../lib/compose-suggestions";
import { getRadii, LAP_MS, placeCards, RADIUS_X, RADIUS_Y, type Radii } from "../lib/orbit";

const ICONS: Record<SuggestionIcon, ReactNode> = {
  explain: (
    <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H10a2 2 0 0 1 2 2v13a2 2 0 0 0-2-2H4zM20 5.5A1.5 1.5 0 0 0 18.5 4H14a2 2 0 0 0-2 2v13a2 2 0 0 1 2-2h6z" />
  ),
  quiz: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="4" />
      <path d="m8.5 12 2.5 2.5 4.5-5" />
    </>
  ),
  next: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="m14.8 9.2-1.6 4-4 1.6 1.6-4z" />
    </>
  ),
  code: <path d="m9 8-4 4 4 4M15 8l4 4-4 4M13 6l-2 12" />,
};

const EASE = [0.22, 1, 0.36, 1] as const;

type ComposeStageProps = {
  mode: HomeMode;
  // The learner's first name, when they have given one.
  name: string;
  suggestions: Suggestion[];
  messages: ChatMessage[];
  typing: boolean;
  onPick: (label: string) => void;
  onClose: () => void;
  // The accent of whichever card is in front, so the prompt bar can glow to match.
  onFrontChange: (accent: string) => void;
};

// The "how can I help" stage shown while the Ask Devy input has focus: the
// dashboard steps aside and Devy takes the middle, with a few starting points
// drawn from what the learner is doing. Once they ask, the suggestions give way
// to the conversation.
export function ComposeStage({
  mode,
  name,
  suggestions,
  messages,
  typing,
  onPick,
  onClose,
  onFrontChange,
}: ComposeStageProps) {
  const reducedMotion = useReducedMotion();
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const clusterRef = useRef<HTMLDivElement>(null);
  const threadRef = useRef<HTMLDivElement>(null);
  const radii = useRef<Radii>({ x: RADIUS_X, y: RADIUS_Y });
  const angle = useRef(0);
  const paused = useRef(false);
  const [front, setFront] = useState(0);
  const isChat = mode === "chat";

  useEffect(() => {
    threadRef.current?.scrollTo({
      top: threadRef.current.scrollHeight,
      behavior: reducedMotion ? "auto" : "smooth",
    });
  }, [messages.length, typing, reducedMotion]);

  useLayoutEffect(() => {
    const measure = () => {
      radii.current = getRadii(clusterRef.current, cardRefs.current[0]);
      setFront(placeCards(cardRefs.current, angle.current, radii.current));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [suggestions.length, isChat]);

  const frontAccent = suggestions[front]?.accent;
  useEffect(() => {
    if (frontAccent) onFrontChange(frontAccent);
  }, [frontAccent, onFrontChange]);

  useAnimationFrame((_, delta) => {
    if (isChat || paused.current || reducedMotion) return;
    angle.current -= (delta / LAP_MS) * Math.PI * 2;
    const next = placeCards(cardRefs.current, angle.current, radii.current);
    if (next !== front) setFront(next);
  });

  return (
    <motion.div
      className="pointer-events-none relative z-[5] flex flex-col items-center justify-center gap-7 *:pointer-events-auto max-desk:h-[520px] max-desk:w-full max-desk:gap-4 max-desk:px-4 max-tab:h-[440px] max-tab:gap-3 max-tab:px-1 data-[mode=chat]:min-h-0 data-[mode=chat]:justify-end desk:h-full desk:w-full"
      data-mode={mode}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* The glow follows whichever card is in front; its colour eases over
          1.2s rather than snapping as the orbit turns. */}
      <motion.span
        className="absolute left-1/2 -bottom-[140px] h-[440px] w-[900px] -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,rgb(var(--card-accent)_/_0.26),transparent_70%)] blur-[24px] max-tab:-bottom-[100px] max-tab:h-[320px] max-tab:w-[140vw] pointer-events-none!"
        initial={false}
        animate={{ "--card-accent": suggestions[front]?.accent ?? "59 130 246" }}
        transition={{ duration: reducedMotion ? 0 : 1.2, ease: "easeInOut" }}
        aria-hidden="true"
      />

      {!isChat && (
        <motion.h2
          className="m-0 text-[26px] font-bold tracking-[-0.02em] text-neutral-800 max-desk:text-2xl max-tab:text-center max-tab:text-xl dark:text-night-ink"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.52, ease: EASE, delay: 0.06 }}
        >
          Hey{name ? `, ${name}` : ""}! How can I help?
        </motion.h2>
      )}

      {isChat && (
        <div
          className="flex max-h-full w-[min(700px,100%)] flex-col gap-4 overflow-y-auto px-1 pt-2 pb-3 [scrollbar-width:thin] max-tab:gap-3"
          ref={threadRef}
          role="log"
          aria-live="polite"
          aria-label="Conversation with Devy"
        >
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-end gap-2.5 motion-safe:animate-msg-in ${message.role === "user" ? "justify-end" : ""}`}
            >
              <p
                className={`m-0 max-w-[80%] rounded-[20px] px-[18px] py-3.5 text-[17px] leading-[1.55] max-tab:max-w-[88%] max-tab:px-3.5 max-tab:py-3 max-tab:text-[15px] ${
                  message.role === "user"
                    ? "rounded-br-md bg-blue-600 text-white"
                    : "rounded-bl-md border border-neutral-200 bg-white text-neutral-800 shadow-[0_10px_24px_-18px_rgb(20_20_40_/_0.2)] dark:border-white/8 dark:bg-night-card dark:text-night-ink dark:shadow-none"
                }`}
              >
                {message.text}
              </p>
            </div>
          ))}
          {typing && (
            <div className="flex items-end gap-2.5 motion-safe:animate-msg-in">
              <p
                className="m-0 flex max-w-[80%] gap-[5px] rounded-[20px] rounded-bl-md border border-neutral-200 bg-white px-[18px] py-[18px] text-neutral-800 dark:border-white/8 dark:bg-night-card dark:text-night-ink"
                aria-label="Devy is typing"
              >
                {[0, 150, 300].map((delay) => (
                  <span
                    key={delay}
                    className="size-2 rounded-full bg-current motion-safe:animate-thinking-dot"
                    style={{ animationDelay: `${delay}ms` }}
                  />
                ))}
              </p>
            </div>
          )}
        </div>
      )}

      <motion.div
        ref={clusterRef}
        className={`relative h-[380px] w-[680px] translate-y-11 max-tab:h-[250px] max-tab:w-full max-tab:translate-y-0 ${isChat ? "hidden" : ""}`}
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        onMouseEnter={() => (paused.current = true)}
        onMouseLeave={() => (paused.current = false)}
        onFocus={() => (paused.current = true)}
        onBlur={() => (paused.current = false)}
      >
        <motion.span
          className="absolute top-[100px] left-[260px] z-5 size-40 max-tab:top-14 max-tab:left-[calc(50%-48px)] max-tab:size-24"
          aria-hidden="true"
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 240, damping: 16 }}
        >
          <DevyLottie clip="wave" className="size-full" />
        </motion.span>
        {suggestions.map((suggestion, index) => (
          <button
            key={suggestion.id}
            ref={(node) => {
              cardRefs.current[index] = node;
            }}
            type="button"
            className="focus-ring absolute top-1/2 left-1/2 flex min-h-[112px] w-[184px] cursor-pointer flex-col justify-between gap-[18px] rounded-[18px] border border-neutral-200 bg-white p-4 text-left text-[15px] leading-[1.3] font-bold text-neutral-800 shadow-[0_0_0_calc(1.5px_*_var(--glow,0))_rgb(var(--card-accent)_/_0.6),0_18px_40px_-18px_rgb(var(--card-accent)_/_calc(0.5_*_var(--glow,0))),0_14px_28px_-22px_rgb(20_20_40_/_0.22)] will-change-[transform,opacity] max-tab:min-h-[82px] max-tab:w-[124px] max-tab:gap-2 max-tab:rounded-[14px] max-tab:p-2.5 max-tab:text-xs dark:border-white/10 dark:bg-night-card dark:text-night-ink dark:shadow-[0_0_0_calc(1.5px_*_var(--glow,0))_rgb(var(--card-accent)_/_0.7),0_18px_40px_-18px_rgb(var(--card-accent)_/_calc(0.6_*_var(--glow,0))),0_14px_28px_-22px_rgb(0_0_0_/_0.5)]"
            style={{ "--card-accent": suggestion.accent } as CSSProperties}
            tabIndex={isChat ? -1 : 0}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => onPick(suggestion.label)}
          >
            <svg
              className="size-[22px] text-[rgb(var(--card-accent))] max-tab:size-[18px]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              {ICONS[suggestion.icon]}
            </svg>
            <span>{suggestion.label}</span>
          </button>
        ))}
      </motion.div>

      <button
        type="button"
        className="focus-ring absolute top-1/2 left-[calc(50%-390px)] grid size-10 place-items-center rounded-full text-neutral-500 transition-colors hover:bg-black/5 max-desk:left-4 max-tab:top-0 max-tab:right-0 max-tab:left-auto dark:text-[#9a9ea8] dark:hover:bg-white/8"
        aria-label="Close"
        onClick={onClose}
      >
        <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <path d="M6 6l12 12M18 6 6 18" />
        </svg>
      </button>
    </motion.div>
  );
}
