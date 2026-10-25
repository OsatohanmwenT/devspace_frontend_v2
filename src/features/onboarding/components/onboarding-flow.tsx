"use client";

import { MotionConfig } from "motion/react";
import { useRef } from "react";
import { Button } from "~/components/ui/button";
import type { Profile } from "~/types/profile";
import { QUESTION_DEVY_CLIPS, STEP_COPY } from "../data/step-copy";
import { roleSubQuiz } from "../data/sub-quizzes";
import { stackSubQuiz } from "../data/stacks";
import { useOnboardingFlow } from "../hooks/use-onboarding-flow";
import { useScrollHint } from "../hooks/use-scroll-hint";
import { buildProfile } from "../lib/build-profile";
import { explainPlacement } from "../lib/placement-copy";
import { getRoleLabel } from "../lib/role-label";
import { getStageGroups } from "../lib/stage-groups";
import type { BranchId } from "../types";
import { BranchOrbit } from "./branch-orbit";
import { BreakScreen } from "./break-screen";
import { ChipList } from "./chip-list";
import { GeneratingPath } from "./generating-path";
import { OnboardingHeader } from "./onboarding-header";
import { OptionList } from "./option-list";
import { PlacementRecommendation } from "./placement-recommendation";
import { QuestionScreen } from "./question-screen";
import { RoleReveal } from "./role-reveal";
import { RouteReview } from "./route-review";
import { StepFrame } from "./step-frame";
import { WelcomeScreen } from "./welcome-screen";

// Where a screen sits inside the scroll area. The classes ride on the screen
// itself, so an exiting screen keeps its position until it has left.
const ALIGNMENT = {
  center: "my-auto pt-8",
  start: "mb-auto pt-10 max-[680px]:pt-6",
  end: "mt-auto pb-28",
  "start-then-center": "mb-auto sm:my-auto",
  "center-flush": "my-auto",
} as const;

// Screens whose option set is long enough to benefit from a 2-column icon grid
// instead of scanning a straight vertical list.
const GRID_LAYOUT_STEPS = new Set(["branch"]);
const CENTERED_QUESTIONS = new Set(["project_interest", "daily_time"]);

export function OnboardingFlow({ onComplete }: { onComplete: (profile: Profile) => void }) {
  const flow = useOnboardingFlow();
  const scrollRef = useRef<HTMLElement>(null);
  const hasMoreBelow = useScrollHint(scrollRef, flow.screenKey);
  const { step, screen, branch, role, answers } = flow;

  const roleLabel = getRoleLabel(branch, role);
  const breakQuestionId = step.type === "break" ? step.questionId : null;

  const alignment =
    screen === "generating"
      ? "center-flush"
      : screen === "role-reveal"
        ? "end"
        : screen === "route" && flow.isRouteAssessment
          ? "start-then-center"
          : screen === "question" && !CENTERED_QUESTIONS.has(step.id)
            ? "start"
            : "center";

  function renderQuestion() {
    const isSubQuiz = step.id === "role_sub_quiz" || step.id === "stack_sub_quiz";
    const title =
      step.id === "role_sub_quiz"
        ? (roleSubQuiz[branch as BranchId]?.prompt ?? "")
        : step.id === "stack_sub_quiz"
          ? (stackSubQuiz[role ?? ""]?.prompt ?? "")
          : (STEP_COPY[step.id as keyof typeof STEP_COPY]?.title ?? "");
    const subtitle = isSubQuiz
      ? "Pick whichever sounds more like you — there’s no wrong answer."
      : flow.isMulti
        ? "Select all that apply."
        : STEP_COPY[step.id as keyof typeof STEP_COPY]?.subtitle;

    return (
      <QuestionScreen
        stepId={step.id}
        title={title}
        subtitle={subtitle}
        devyClip={QUESTION_DEVY_CLIPS[step.id as keyof typeof QUESTION_DEVY_CLIPS]}
      >
        {step.id === "project_interest" ? (
          <ChipList options={flow.options} value={flow.value} onSelect={flow.select} />
        ) : (
          <OptionList
            options={flow.options}
            value={flow.value}
            onSelect={flow.select}
            layout={GRID_LAYOUT_STEPS.has(step.id) ? "grid" : "list"}
          />
        )}
      </QuestionScreen>
    );
  }

  return (
    <MotionConfig reducedMotion="user">
      <section
        className="relative grid h-dvh grid-rows-[56px_minmax(0,1fr)_96px] overflow-hidden"
        aria-label="Set up your learning"
      >
        <OnboardingHeader
          step={flow.index + 1}
          total={flow.steps.length}
          canGoBack={flow.canGoBack}
          onBack={flow.goBack}
        />

        <main
          ref={scrollRef}
          className="flex min-w-0 flex-col items-center overflow-x-hidden overflow-y-auto px-6 py-8 [scrollbar-gutter:stable] [scrollbar-width:none] max-[680px]:px-4 [&::-webkit-scrollbar]:hidden"
        >
          <StepFrame
            stepKey={flow.screenKey}
            direction={flow.direction}
            onExitComplete={() => scrollRef.current?.scrollTo({ top: 0 })}
            className={`grid w-full max-w-full min-w-0 justify-items-center gap-6 ${ALIGNMENT[alignment]}`}
          >
            {screen === "generating" && (
              <GeneratingPath onDone={() => onComplete(buildProfile(answers))} />
            )}

            {screen === "welcome" && <WelcomeScreen onStart={flow.goNext} />}

            {screen === "role-reveal" && <RoleReveal role={roleLabel} stages={flow.ladderStages} />}

            {screen === "placement" && flow.placement && (
              <PlacementRecommendation
                placement={flow.placement}
                roleLabel={roleLabel}
                explanation={explainPlacement(answers, flow.placement, roleLabel)}
                onStartLearning={() => flow.acceptPlacement(String(flow.placement?.value))}
                onReviewRoute={flow.reviewRoute}
                onChangeCareer={flow.changeCareer}
                onTestLevel={flow.testLevel}
              />
            )}

            {screen === "break" && flow.breakContent && (
              <BreakScreen
                key={step.id}
                message={flow.breakContent.message}
                insight={flow.breakContent.insight}
                snippet={
                  (breakQuestionId === "branch" || breakQuestionId === "branch_triage") && branch ? (
                    <BranchOrbit branch={branch as BranchId} />
                  ) : null
                }
              />
            )}

            {screen === "route" && (
              <RouteReview
                groups={getStageGroups(flow.options)}
                notSureOption={flow.options.find((option) => option.value === "not_sure")}
                value={flow.value}
                placement={flow.recommendedPlacement}
                branch={branch}
                onSelect={flow.select}
                isTesting={flow.isRouteAssessment}
                onTestingChange={flow.setIsRouteAssessment}
              />
            )}

            {screen === "question" && renderQuestion()}
          </StepFrame>
        </main>

        {/* When a list runs past the fold, the bottom edge is genuinely blurred
            (not just faded) so the last visible rows read as a crowd with more
            behind it. The blur ramps in through the mask, so it never draws a
            hard line across an option. */}
        {hasMoreBelow && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-24 z-10 h-28 bg-linear-to-b from-transparent to-canvas/85 backdrop-blur-[5px] [mask-image:linear-gradient(to_bottom,transparent,black_60%)] dark:to-night/85"
          />
        )}

        <footer className="flex items-center justify-center px-6 pb-5 max-[680px]:px-4">
          {flow.hasFooter && (
            <Button
              className="min-h-[52px] w-[min(100%,520px)] text-[15px]"
              onClick={flow.isLast ? flow.startGenerating : flow.goNext}
              disabled={!flow.canAdvance}
            >
              {flow.primaryLabel}
            </Button>
          )}
        </footer>
      </section>
    </MotionConfig>
  );
}
