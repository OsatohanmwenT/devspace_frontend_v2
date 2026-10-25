"use client";

import { useRef, useState } from "react";
import { Button } from "~/components/ui/button";
import { BRANCH_TEST_QUESTIONS } from "../data/assessment-questions";
import { useBuildIn } from "../hooks/use-build-in";
import type { BranchId, OptionValue, StageGroup } from "../types";
import { AssessmentResult } from "./assessment-result";
import { StepFrame } from "./step-frame";

type RouteAssessmentProps = {
  group: StageGroup;
  groups: StageGroup[];
  branch: string | null;
  // Called with the first stage of the group the result lands in.
  onUse: (startValue: OptionValue) => void;
  onExit: () => void;
};

const TEXT_BUTTON =
  "focus-ring rounded text-sm font-medium text-blue-600 underline underline-offset-4 hover:opacity-80 dark:text-blue-400";

// A short quiz that places the learner in the route. Unmounting resets it, so
// leaving and re-entering always starts clean.
export function RouteAssessment({ group, groups, branch, onUse, onExit }: RouteAssessmentProps) {
  const [answers, setAnswers] = useState<number[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [result, setResult] = useState<{ score: number; group: StageGroup } | null>(null);
  const rootRef = useRef<HTMLElement>(null);
  const questions = BRANCH_TEST_QUESTIONS[branch as BranchId] ?? BRANCH_TEST_QUESTIONS.web;
  const question = questions[questionIndex];
  const isLastQuestion = questionIndex === questions.length - 1;
  const answeredAll = answers.length === questions.length && answers.every((a) => a !== undefined);

  useBuildIn(rootRef, result ? "result" : "quiz");

  function answer(optionIndex: number) {
    setAnswers((current) => {
      const next = [...current];
      next[questionIndex] = optionIndex;
      return next;
    });
    if (!isLastQuestion) setQuestionIndex((current) => current + 1);
  }

  // Moves the starting point a phase up for a perfect score and a phase back
  // when more than one answer missed.
  function finish() {
    const score = questions.reduce(
      (total, item, index) => total + Number(answers[index] === item.answer),
      0,
    );
    const currentIndex = Math.max(0, groups.findIndex((item) => item.id === group.id));
    const resultIndex =
      score === questions.length
        ? Math.min(currentIndex + 1, groups.length - 1)
        : score < questions.length - 1
          ? Math.max(currentIndex - 1, 0)
          : currentIndex;
    setResult({ score, group: groups[resultIndex] });
  }

  function retry() {
    setResult(null);
    setAnswers([]);
    setQuestionIndex(0);
  }

  return (
    <section
      ref={rootRef}
      className="grid w-full max-w-[620px] justify-items-center gap-5"
      aria-labelledby="route-test-title"
    >
      <div className="grid justify-items-center gap-2 text-center">
        <p data-build data-build-order="0" className="m-0 text-sm font-medium text-blue-600 dark:text-blue-400">
          {result ? "Route placement" : "Route assessment"}
        </p>
        <h1
          data-build
          data-build-order="1"
          id="route-test-title"
          className="m-0 font-display text-[clamp(26px,3.4vw,34px)] font-medium"
        >
          {result ? "Your recommended starting point" : `Test out of ${group.label}`}
        </h1>
        <p
          data-build
          data-build-order="2"
          className="text-muted m-0 max-w-[48ch] text-[15px] leading-normal"
        >
          {result
            ? result.score < questions.length - 1
              ? "A couple of these are worth another look, so we moved your starting point a bit earlier."
              : "Based on your answers, this is the best place to begin."
            : `Answer ${questions.length} questions and we will place you at the right point in this route.`}
        </p>
      </div>

      {result ? (
        <AssessmentResult
          score={result.score}
          total={questions.length}
          group={result.group}
          onUse={() => onUse(result.group.stages[0].value)}
          onRetry={retry}
        />
      ) : (
        <div className="grid w-full gap-3">
          <p data-build data-build-order="3" className="text-muted m-0 text-center text-[13px] font-medium">
            Question {questionIndex + 1} of {questions.length}
          </p>
          {/* Each question is its own screen inside the card: the swap runs on
              the card only, so the heading above stays put. */}
          <StepFrame stepKey={`q-${questionIndex}`} className="w-full">
            <div
              role="group"
              aria-labelledby={`route-question-${questionIndex}`}
              className="grid gap-2 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900"
            >
              <p id={`route-question-${questionIndex}`} className="m-0 px-1 text-sm font-medium">
                {questionIndex + 1}. {question.prompt}
              </p>
              {question.options.map((option, optionIndex) => {
                const selected = answers[questionIndex] === optionIndex;

                return (
                  <button
                    data-cuelume-toggle
                    key={option}
                    type="button"
                    className={`focus-ring min-h-11 rounded-xl border px-4 text-left text-sm font-medium transition-colors ${
                      selected
                        ? "border-blue-600 bg-blue-600/10 dark:border-blue-400 dark:bg-blue-400/15"
                        : "border-neutral-300 hover:border-blue-600 dark:border-neutral-700 dark:hover:border-blue-400"
                    }`}
                    aria-pressed={selected}
                    onClick={() => answer(optionIndex)}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </StepFrame>
          {isLastQuestion && (
            <Button className="min-h-[52px] w-full text-[15px]" disabled={!answeredAll} onClick={finish}>
              See my route placement
            </Button>
          )}
          <button type="button" className={TEXT_BUTTON} onClick={onExit}>
            Back to route options
          </button>
        </div>
      )}
    </section>
  );
}
