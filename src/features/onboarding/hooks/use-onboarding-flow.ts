"use client";

import { useState } from "react";
import { startingPointOptions } from "../data/starting-points";
import { getBreakContent } from "../lib/break-content";
import {
    resolveBranch,
    resolveLadderKey,
    resolvePlacement,
    resolveRecommendedPlacement,
    resolveRole,
} from "../lib/resolve";
import {
    getStepOptions,
    getVisibleSteps,
    isMultiSelectStep,
    STEP_ANSWER_KEY,
} from "../lib/steps";
import type { Answers, OptionValue } from "../types";

export type Screen =
  | "welcome"
  | "generating"
  | "role-reveal"
  | "placement"
  | "break"
  | "route"
  | "question";

// Changing career goes back to the role question and discards everything that
// depended on the branch.
const CHANGE_CAREER_INDEX = 3;
const CAREER_ANSWER_KEYS = new Set<string>([
  "branch",
  "branchFromTriage",
  "role",
  "roleFromSubQuiz",
  "stack",
  "stackFromSubQuiz",
  "experience",
  "javascriptExperience",
  "startingPoint",
]);

export function useOnboardingFlow() {
  const [answers, setAnswers] = useState<Answers>({});
  const [index, setIndex] = useState(0);
  // +1 moving forward, -1 going back: the step swap scales the incoming screen
  // from the opposite side so "back" feels like stepping out, not pressing in.
  const [direction, setDirection] = useState<1 | -1>(1);
  const [isRouteAssessment, setIsRouteAssessment] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const steps = getVisibleSteps(answers);
  const step = steps[Math.min(index, steps.length - 1)];
  const answerKey = STEP_ANSWER_KEY[step.id];
  const branch = resolveBranch(answers);
  const role = resolveRole(answers);
  const placement = resolvePlacement(answers);
  const recommendedPlacement = resolveRecommendedPlacement(answers);
  const options = getStepOptions(step.id, answers);
  const ladderKey = resolveLadderKey(answers);
  const ladderStages = (ladderKey ? (startingPointOptions[ladderKey] ?? []) : []).filter(
    (stage) => stage.value !== "not_sure",
  );

  // Until the learner picks, the starting point reads as the recommendation.
  const value: OptionValue | OptionValue[] | undefined =
    step.id === "starting_point"
      ? (answers.startingPoint ?? placement?.value)
      : answerKey
        ? answers[answerKey]
        : undefined;

  const isBreak = step.type === "break";
  const questionId = step.type === "break" ? step.questionId : null;
  const isChoice = Boolean(answerKey);
  const isMulti = isMultiSelectStep(step.id);
  const isFrontend = role === "frontend_developer";
  const breakContent = step.type === "break" ? getBreakContent(step.questionId, answers) : null;

  const isRoleReveal = isBreak && Boolean(role) && (questionId === "role" || questionId === "role_sub_quiz");
  const isPlacement =
    isBreak &&
    Boolean(placement) &&
    ((!isFrontend && questionId === "experience") ||
      (isFrontend &&
        answers.javascriptExperience === "new_to_javascript" &&
        questionId === "javascript_experience") ||
      (isFrontend &&
        answers.javascriptExperience !== "new_to_javascript" &&
        ((questionId === "stack" && answers.stack !== "help_me_choose") ||
          (questionId === "stack_sub_quiz" && answers.stack === "help_me_choose"))));

  const screen: Screen = isGenerating
    ? "generating"
    : step.id === "welcome"
      ? "welcome"
      : isRoleReveal
        ? "role-reveal"
        : isPlacement
          ? "placement"
          : isBreak
            ? "break"
            : step.id === "starting_point"
              ? "route"
              : "question";

  const canAdvance =
    !isChoice || (isMulti ? ((value as OptionValue[] | undefined)?.length ?? 0) > 0 : value !== undefined);
  const isLast = step.id === "daily_time_break";
  const hasFooter = screen !== "welcome" && screen !== "placement" && screen !== "generating" && !isRouteAssessment;
  // What the step swap keys on: a different step, entering/leaving the route
  // test, or the generating screen all count as a new screen.
  const screenKey = isGenerating ? "generating" : `${step.id}${isRouteAssessment ? ":test" : ""}`;

  const primaryLabel =
    step.id === "welcome"
      ? "Let’s go"
      : step.id === "starting_point"
        ? "Continue with this route"
        : isLast
          ? "Start learning"
          : "Continue";

  function select(nextValue: OptionValue) {
    if (!answerKey) return;
    setAnswers((current) => {
      if (!isMulti) return { ...current, [answerKey]: nextValue } as Answers;
      const chosen = (current[answerKey] as OptionValue[] | undefined) ?? [];
      return {
        ...current,
        [answerKey]: chosen.includes(nextValue)
          ? chosen.filter((item) => item !== nextValue)
          : [...chosen, nextValue],
      } as Answers;
    });
  }

  function goNext() {
    setDirection(1);
    setIndex((current) => Math.min(current + 1, steps.length - 1));
  }

  function goBack() {
    setDirection(-1);
    setIsRouteAssessment(false);
    setIndex((current) => Math.max(current - 1, 0));
  }

  function changeCareer() {
    setDirection(-1);
    setIsRouteAssessment(false);
    setAnswers((current) =>
      Object.fromEntries(
        Object.entries(current).filter(([key]) => !CAREER_ANSWER_KEYS.has(key)),
      ),
    );
    setIndex(CHANGE_CAREER_INDEX);
  }

  // The decisive path off the placement screen: accept the recommendation and
  // skip past the explicit route-review step (and its break screen) rather
  // than making the learner inspect and reconfirm what was just recommended.
  function acceptPlacement(placementValue: string) {
    const nextAnswers = { ...answers, startingPoint: placementValue };
    const nextSteps = getVisibleSteps(nextAnswers);
    let next = index + 1;
    while (
      nextSteps[next] &&
      (nextSteps[next].id === "starting_point" || nextSteps[next].id === "starting_point_break")
    ) {
      next += 1;
    }
    setAnswers(nextAnswers);
    setDirection(1);
    setIndex(Math.min(next, nextSteps.length - 1));
  }

  function reviewRoute() {
    setIsRouteAssessment(false);
    goNext();
  }

  function testLevel() {
    goNext();
    setIsRouteAssessment(true);
  }

  return {
    answers,
    index,
    steps,
    step,
    screen,
    screenKey,
    direction,
    branch,
    role,
    placement,
    recommendedPlacement,
    options,
    ladderStages,
    value,
    breakContent,
    isMulti,
    isRouteAssessment,
    setIsRouteAssessment,
    canAdvance,
    isLast,
    hasFooter,
    primaryLabel,
    canGoBack: index > 0 && !isGenerating,
    select,
    goNext,
    goBack,
    changeCareer,
    acceptPlacement,
    reviewRoute,
    testLevel,
    startGenerating: () => setIsGenerating(true),
  };
}
