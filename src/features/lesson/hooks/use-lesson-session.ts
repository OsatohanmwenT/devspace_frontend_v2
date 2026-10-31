"use client";

import { useEffect, useState } from "react";
import type { Concept, LessonReward } from "~/types/lesson";
import type { FlowStep } from "../lib/lesson-flow";
import { clearIncorrectBlanks, isFillQuestion, isQuestionComplete, isQuestionCorrect, type Answer, type BlankAnswer } from "../lib/question-state";

// A wrong answer gets one retry with coaching before the explanation reveals:
// enough to correct a slip without turning every miss into a guessing game.
const MAX_ATTEMPTS = 2;
// How many right first tries in a row start to feel like a streak.
export const STREAK_THRESHOLD = 3;

type StepState = {
  answer?: Answer;
  // Resolved: correct, or the attempt cap was reached. Not merely "Check was pressed".
  checked?: boolean;
  attempts?: number;
  code?: string;
  completed?: boolean;
};

// `finished` is set once the lesson has been recorded, so a refresh on the last
// screen keeps what it paid instead of asking again.
type Session = { stepIndex: number; steps: Record<string, StepState>; streak: number; startedAt: number; finished?: { reward: LessonReward; seconds: number } };

export type CheckOutcome = "correct" | "wrong" | "retry";

const storageKey = (lessonId: string) => `devspace-lesson-session:${lessonId}`;

// A lesson left half-done picks up where it stopped.
function loadSession(lessonId: string, flowLength: number): Session {
  const empty: Session = { stepIndex: 0, steps: {}, streak: 0, startedAt: Date.now() };
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey(lessonId)) ?? "null");
    if (!saved) return empty;
    return {
      stepIndex: Math.min(Math.max(saved.stepIndex ?? 0, 0), flowLength - 1),
      steps: saved.steps ?? {},
      streak: saved.streak ?? 0,
      startedAt: saved.startedAt ?? Date.now(),
      finished: saved.finished,
    };
  } catch {
    return empty;
  }
}

export function clearSession(lessonId: string) {
  try {
    localStorage.removeItem(storageKey(lessonId));
  } catch {
    // Storage blocked: there was nothing saved to clear.
  }
}

export function useLessonSession(lessonId: string, flow: FlowStep[]) {
  const [session, setSession] = useState(() => loadSession(lessonId, flow.length));
  const step = flow[session.stepIndex];
  const state: StepState = (step && session.steps[step.id]) || {};

  useEffect(() => {
    try {
      localStorage.setItem(storageKey(lessonId), JSON.stringify(session));
    } catch {
      // Storage blocked: the lesson just will not resume.
    }
  }, [lessonId, session]);

  const patchStep = (patch: StepState, replace = false) =>
    setSession((current) => ({
      ...current,
      steps: { ...current.steps, [step.id]: replace ? patch : { ...current.steps[step.id], ...patch } },
    }));

  const move = (by: number) => setSession((current) => ({ ...current, stepIndex: Math.min(Math.max(current.stepIndex + by, 0), flow.length - 1) }));

  const isQuestion = step?.kind === "activity" && step.type === "question";
  const attempts = state.attempts ?? 0;
  const checked = state.checked ?? false;

  // Records an attempt and says how it went, so the screen can react.
  const checkQuestion = (): CheckOutcome | null => {
    if (!isQuestion) return null;
    const correct = isQuestionCorrect(step.question, state.answer);
    const nextAttempts = attempts + 1;

    if (!correct && nextAttempts < MAX_ATTEMPTS) {
      // A retry is left: clear only the wrong blanks, so a fill question does
      // not undo what was already right.
      const answer = isFillQuestion(step.question) && Array.isArray(state.answer) ? clearIncorrectBlanks(step.question, state.answer as BlankAnswer) : undefined;
      patchStep({ answer, checked: false, attempts: nextAttempts }, true);
      return "retry";
    }

    // Only a clean first-try answer extends the in-a-row counter.
    const firstTry = correct && nextAttempts === 1;
    patchStep({ checked: true, attempts: nextAttempts });
    setSession((current) => ({ ...current, streak: firstTry ? current.streak + 1 : 0 }));
    return correct ? "correct" : "wrong";
  };

  // Real tallies for the break-screen recap: never invented copy. Scoped to
  // one concept for a mid-lesson hand-off, to the whole flow for the finish.
  const recap = (concept?: Concept) => {
    const questions = flow.filter((flowStep) => flowStep.kind === "activity" && flowStep.type === "question" && (!concept || flowStep.concept === concept));
    const correct = questions.filter((flowStep) => {
      if (flowStep.kind !== "activity" || flowStep.type !== "question") return false;
      const saved = session.steps[flowStep.id];
      return saved?.checked && isQuestionCorrect(flowStep.question, saved.answer);
    }).length;
    return { correct, total: questions.length };
  };

  return {
    step,
    stepIndex: session.stepIndex,
    streak: session.streak,
    isLastStep: session.stepIndex === flow.length - 1,
    finished: session.finished,
    finish: (reward: LessonReward) =>
      setSession((current) => ({ ...current, finished: { reward, seconds: Math.max(1, Math.round((Date.now() - current.startedAt) / 1000)) } })),
    next: () => move(1),
    previous: () => move(-1),
    question: {
      answer: state.answer,
      checked,
      retrying: attempts > 0 && !checked,
      attempts,
      canCheck: isQuestion && isQuestionComplete(step.question, state.answer),
      setAnswer: (answer: Answer) => patchStep({ answer, checked: false }),
      check: checkQuestion,
    },
    editor: {
      code: state.code,
      completed: Boolean(state.completed),
      update: (code: string) => patchStep({ code, completed: false }),
      complete: () => patchStep({ completed: true }),
    },
    recap,
  };
}
