import { BRANCHES } from "../data/branches";
import { breakPrompts } from "../data/feedback";
import type { Answers, QuestionId } from "../types";
import { resolveBranch } from "./resolve";
import { getStepOptions, STEP_ANSWER_KEY } from "./steps";

function toArray<T>(value: T | T[] | undefined | null): T[] {
  if (Array.isArray(value)) return value;
  return value === undefined || value === null ? [] : [value];
}

// The short acknowledgement shown on a Devy break screen after a question.
export function getBreakContent(questionId: QuestionId, answers: Answers = {}) {
  const config = breakPrompts[questionId];
  const answerKey = STEP_ANSWER_KEY[questionId];
  const values = toArray(answerKey ? answers[answerKey] : undefined);
  const options =
    questionId === "branch_triage"
      ? BRANCHES
      : questionId === "role_sub_quiz"
        ? getStepOptions("role", answers)
        : questionId === "stack_sub_quiz"
          ? getStepOptions("stack", answers)
          : getStepOptions(questionId, answers);
  const labels = values
    .map((value) => options.find((option) => option.value === value)?.label)
    .filter((label): label is string => Boolean(label));
  const answer =
    labels.length > 1
      ? `${labels.slice(0, -1).join(", ")} and ${labels.at(-1)}`
      : (labels[0] ?? "that");
  const branch =
    questionId === "branch" && values.includes("not_sure")
      ? "not_sure"
      : resolveBranch(answers);

  if (!config) return null;
  return {
    message: config.message(answer, labels, values),
    insight:
      typeof config.insight === "function"
        ? config.insight(branch)
        : config.insight,
  };
}
