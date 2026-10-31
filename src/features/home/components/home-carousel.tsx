"use client";

import { motion } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { DevyLottie, type LottieClipName } from "~/components/devy";
import { GameIcon } from "~/components/ui/game-icon";
import { useBreakpoint } from "~/hooks/use-breakpoint";
import { useViewportWidth } from "~/hooks/use-viewport-width";
import type { HomeData } from "~/types/home";
import { useCardCarousel } from "../hooks/use-card-carousel";
import { ACCENTS } from "../lib/accents";
import { CarouselCard } from "./carousel-card";
import { ContinueFace } from "./continue-face";
import { DailyQuests } from "./daily-quests";
import { LeaderboardFace } from "./leaderboard-face";
import { PortfolioFace } from "./portfolio-face";
import { ScenePager } from "./scene-pager";
import { UpdateFace } from "./update-face";

// The cards, in the order they sit in the stack, with the Devy clip that keeps
// each one company on phones.
const CARDS = [
  { id: "continueLearning", label: "Continue learning", accent: ACCENTS.continueLearning, devy: "thinking" },
  { id: "leaderboard", label: "Leaderboard", accent: ACCENTS.leaderboard, devy: "listening" },
  { id: "portfolio", label: "Your work", accent: ACCENTS.portfolio, devy: "walk" },
  { id: "update", label: "What's new", accent: ACCENTS.update, devy: "wave" },
] as const satisfies readonly { id: string; label: string; accent: string; devy: LottieClipName }[];

const TABLET_CARD_WIDTH = 480;
const PHONE_CARD_MARGIN = 90;
const WHEEL_LOCK_MS = 430;

type HomeCarouselProps = {
  data: HomeData;
  actions: {
    continueLesson: () => void;
    openPaths: () => void;
    openLeaderboard: () => void;
    openProfile: () => void;
    startPractice: () => void;
  };
  // The Devy prompt bar takes its glow from whichever card is in front.
  promptBar: (accent: string) => ReactNode;
  // While the Ask Devy input is in use, this stage takes the stack's place.
  composing: boolean;
  stage: ReactNode;
};

// Up to 1200px: the four cards as a 3D stack you swipe through. Tablet and
// phone share it; they differ in card size and in what surrounds the stack.
export function HomeCarousel({ data, actions, promptBar, composing, stage }: HomeCarouselProps) {
  const isMobile = useBreakpoint() === "mobile";
  const viewportWidth = useViewportWidth();
  const [activeIndex, setActiveIndex] = useState(0);
  const wheelLocked = useRef(false);
  const count = CARDS.length;
  const course = data.courses[0];

  const { position, spread, depth, dragMovedRef, panHandlers } = useCardCarousel({
    count,
    activeIndex,
    onCommit: setActiveIndex,
    cardWidth: isMobile ? viewportWidth - PHONE_CARD_MARGIN : TABLET_CARD_WIDTH,
  });

  const changeCard = (direction: 1 | -1) =>
    setActiveIndex((current) => (current + direction + count) % count);

  // Arrow keys step through the cards on tablet (phones swipe).
  useEffect(() => {
    if (isMobile) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        event.defaultPrevented ||
        (event.key !== "ArrowLeft" && event.key !== "ArrowRight") ||
        (event.target as HTMLElement).matches("input, textarea, select, [contenteditable='true']")
      ) {
        return;
      }
      event.preventDefault();
      setActiveIndex((current) => (current + (event.key === "ArrowRight" ? 1 : -1) + count) % count);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isMobile, count]);

  // A tap on a card behind the front one brings it forward rather than opening it.
  const act = (index: number, action: () => void) => () =>
    index === activeIndex ? action() : setActiveIndex(index);

  const updateAction =
    data.update.kind === "path-complete" || data.update.kind === "welcome"
      ? actions.openPaths
      : actions.continueLesson;

  return (
    <div className="h-[calc(100vh-64px)] overflow-hidden px-[22px] py-5 max-tab:h-[calc(100dvh-64px)] max-tab:px-[18px] max-tab:py-3">
      <div className="relative mx-auto flex h-full w-full max-w-[1100px] flex-col justify-center max-tab:justify-start max-tab:pt-12">
        <div className="absolute inset-x-0 top-0 z-12 flex justify-center">
          <DailyQuests
            quests={data.quests}
            onContinueLesson={actions.continueLesson}
            onStartPractice={actions.startPractice}
            triggerClassName="focus-ring relative inline-flex min-h-10 cursor-pointer items-center gap-[7px] rounded-full border border-neutral-200 bg-white px-[13px] text-[13px] font-bold text-neutral-800 shadow-[0_8px_18px_-14px_rgb(20_20_40_/_0.28)] hover:bg-neutral-50 dark:border-white/10 dark:bg-night-card dark:text-night-ink dark:shadow-[0_8px_18px_-14px_rgb(0_0_0_/_0.65)] dark:hover:bg-[#2a2a2a]"
            panelClassName="left-1/2 w-[min(300px,calc(100vw-36px))] -translate-x-1/2"
          >
            {({ doneCount, total, unseen }) => (
              <>
                <GameIcon name="daily-tasks-notebook" className="size-4" />
                <span>Daily tasks</span>
                <span className="text-xs text-amber-600 tabular-nums">
                  {doneCount}/{total}
                </span>
                <svg className="size-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="m4.5 6.5 3.5 3.5 3.5-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {unseen && (
                  <span
                    className="absolute -top-0.5 -right-0.5 size-[9px] rounded-full border-2 border-white bg-red-500 dark:border-night-card"
                    aria-hidden="true"
                  />
                )}
              </>
            )}
          </DailyQuests>
        </div>

        {stage}

        <motion.section
          aria-label="Learning map"
          className={`relative left-1/2 h-[500px] w-screen -translate-x-1/2 touch-pan-y overscroll-x-contain max-tab:h-[420px] ${composing ? "hidden" : ""}`}
          style={{ perspective: isMobile ? 1150 : 1400, perspectiveOrigin: "50% 42%" }}
          onWheel={(event) => {
            if (viewportWidth <= 900 || wheelLocked.current || Math.abs(event.deltaY) < 12) return;
            wheelLocked.current = true;
            changeCard(event.deltaY > 0 ? 1 : -1);
            window.setTimeout(() => {
              wheelLocked.current = false;
            }, WHEEL_LOCK_MS);
          }}
          onClickCapture={(event) => {
            // A real drag ends in a ghost click on whatever card is under the finger.
            if (!dragMovedRef.current) return;
            event.preventDefault();
            event.stopPropagation();
            dragMovedRef.current = false;
          }}
          {...panHandlers}
        >
          <span
            className="pointer-events-none absolute top-[44%] left-1/2 h-[400px] w-[620px] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.12),rgba(59,130,246,0.035)_42%,transparent_72%)] max-tab:opacity-50"
            aria-hidden="true"
          />

          {/* Phones only: Devy peeks over the top of the stack. */}
          {isMobile && (
            <div className="pointer-events-none absolute top-11 left-1/2 z-0 -translate-x-1/2">
              <DevyLottie key={CARDS[activeIndex].id} clip={CARDS[activeIndex].devy} className="size-20" />
            </div>
          )}

          <CarouselCard
            {...{ count, position, spread, depth }}
            index={0}
            accent={CARDS[0].accent}
            label={CARDS[0].label}
            isFront={activeIndex === 0}
            surfaceClassName="bg-[#f5f9ff] dark:bg-night-card"
            paddingClassName="p-6 pt-3 max-tab:px-[30px] max-tab:pb-7"
            onClick={act(0, actions.continueLesson)}
          >
            {course && <ContinueFace course={course} onContinue={act(0, actions.continueLesson)} />}
          </CarouselCard>

          <CarouselCard
            {...{ count, position, spread, depth }}
            index={1}
            accent={CARDS[1].accent}
            label={CARDS[1].label}
            isFront={activeIndex === 1}
            onClick={act(1, actions.openLeaderboard)}
          >
            <LeaderboardFace
              league={data.league}
              onOpenLeaderboard={act(1, actions.openLeaderboard)}
              onStartLesson={act(1, actions.continueLesson)}
            />
          </CarouselCard>

          <CarouselCard
            {...{ count, position, spread, depth }}
            index={2}
            accent={CARDS[2].accent}
            label={CARDS[2].label}
            isFront={activeIndex === 2}
            onClick={act(2, actions.openProfile)}
          >
            <PortfolioFace data={data} onOpen={act(2, actions.openProfile)} />
          </CarouselCard>

          <CarouselCard
            {...{ count, position, spread, depth }}
            index={3}
            accent={CARDS[3].accent}
            label={CARDS[3].label}
            isFront={activeIndex === 3}
            onClick={act(3, updateAction)}
          >
            <UpdateFace
              update={data.update}
              eyebrow={course?.regionTitle ?? course?.title ?? "Your learning path"}
              onAct={act(3, updateAction)}
            />
          </CarouselCard>
        </motion.section>

        {!composing && <ScenePager cards={CARDS} activeIndex={activeIndex} onSelect={setActiveIndex} />}

        <section
          className="relative mx-auto mt-9 flex w-full max-w-[1040px] items-center justify-center py-3 max-tab:absolute max-tab:bottom-3 max-tab:left-1/2 max-tab:z-10 max-tab:mt-0 max-tab:-translate-x-1/2 max-tab:pt-3 max-tab:pb-0"
          aria-label="Quick actions"
        >
          {promptBar(CARDS[activeIndex].accent)}
        </section>
      </div>
    </div>
  );
}
