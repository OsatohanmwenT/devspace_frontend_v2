"use client";

import type { ReactNode } from "react";
import type { HomeData } from "~/types/home";
import { getGreeting } from "../lib/greeting";
import { CourseCard } from "./course-card";
import { DashboardCard } from "./dashboard-card";
import { PortfolioCard } from "./portfolio-card";
import { PremiumOffer } from "./premium-offer";

type HomeDesktopProps = {
  data: HomeData;
  actions: {
    continueLesson: () => void;
    startPractice: () => void;
    openProfile: () => void;
    openLeaderboard: () => void;
  };
  // The Devy prompt bar, which the view owns because it drives the whole page.
  promptBar: ReactNode;
  // While the Ask Devy input is in use, the dashboard steps aside for this stage.
  composing: boolean;
  stage: ReactNode;
};

const STEP_ASIDE = "pointer-events-none opacity-35";
const MOVE = "transition-[translate,opacity] duration-[620ms] ease-[cubic-bezier(0.22,1,0.36,1)]";

// 1201px and up: a two-column dashboard. Progress and "your work" on the left,
// the course to carry on with on the right, the Devy prompt bar underneath.
export function HomeDesktop({ data, actions, promptBar, composing, stage }: HomeDesktopProps) {
  const course = data.courses[0];

  return (
    <div className="h-[calc(100vh-64px)] overflow-x-hidden overflow-y-auto px-[22px] py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="mx-auto grid h-full w-full max-w-[1000px] grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] grid-rows-[auto_auto_1fr_auto] gap-6 pb-4">
        <header
          className={`col-span-2 col-start-1 row-start-1 flex items-center justify-between gap-4 ${MOVE} ${composing ? "pointer-events-none -translate-y-3.5 opacity-0" : ""}`}
        >
          <h1 className="m-0 text-[28px] font-bold tracking-[-0.03em] text-neutral-800 dark:text-night-ink">
            {getGreeting()}
          </h1>
        </header>

        <div className={`col-start-1 row-start-2 ${MOVE} ${composing ? `-translate-x-[480px] ${STEP_ASIDE}` : ""}`}>
          <DashboardCard
            data={data}
            onContinueLesson={actions.continueLesson}
            onStartPractice={actions.startPractice}
            onOpenProfile={actions.openProfile}
            onOpenLeaderboard={actions.openLeaderboard}
          />
        </div>

        {course && (
          <div className={`col-start-2 row-span-2 row-start-2 self-start ${MOVE} ${composing ? `translate-x-[700px] ${STEP_ASIDE}` : ""}`}>
            <CourseCard course={course} onContinue={actions.continueLesson} />
          </div>
        )}

        <div className={`col-start-1 row-start-3 ${MOVE} ${composing ? `-translate-x-[480px] ${STEP_ASIDE}` : ""}`}>
          <PortfolioCard data={data} onOpen={actions.openProfile} />
        </div>

        <div className="pointer-events-none relative z-[5] col-span-full row-span-3 row-start-1 flex flex-col justify-center">
          {stage}
        </div>

        <section className="relative col-span-2 row-start-4 mx-auto flex w-full max-w-[1040px] items-center justify-center self-end py-3 pb-4" aria-label="Quick actions">
          {promptBar}
        </section>
      </div>
      <PremiumOffer />
    </div>
  );
}
