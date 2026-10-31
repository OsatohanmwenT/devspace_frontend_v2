import type { FillQuestion, Question } from "~/types/lesson";

// One answer model for every question type, so blank-filling and checking are
// not reimplemented per surface. A multiple-choice answer is the chosen option's
// index; a fill answer is, per blank, the chosen option's index.
export type BlankAnswer = (number | undefined)[];
export type Answer = number | BlankAnswer | undefined;

export const isFillQuestion = (question: Question): question is FillQuestion => question.type === "fill" || question.type === "code-fill";

export function emptyAnswer(question: Question): Answer {
  return isFillQuestion(question) ? Array<number | undefined>(question.answers.length).fill(undefined) : undefined;
}

export function isQuestionComplete(question: Question, answer: Answer) {
  if (isFillQuestion(question)) {
    const blanks = Array.isArray(answer) ? answer : [];
    return blanks.length === question.answers.length && blanks.every((blank) => blank !== undefined);
  }
  return answer !== undefined;
}

export function isQuestionCorrect(question: Question, answer: Answer) {
  if (isFillQuestion(question)) {
    const blanks = Array.isArray(answer) ? answer : [];
    return question.answers.every((expected, index) => question.options[blanks[index] ?? -1] === expected);
  }
  return answer === question.correctIndex;
}

// A wrong attempt with a retry left clears only the wrong blanks: a
// correctly-filled blank stays put, so a retry does not undo progress the
// learner already got right.
export function clearIncorrectBlanks(question: FillQuestion, answer: BlankAnswer): BlankAnswer {
  return answer.map((selected, blankIndex) => (selected !== undefined && question.options[selected] === question.answers[blankIndex] ? selected : undefined));
}

// Fills the first empty blank; returns the answer unchanged when all are taken.
export function fillNextBlank(answer: BlankAnswer, optionIndex: number): BlankAnswer {
  const next = answer.findIndex((blank) => blank === undefined);
  if (next === -1) return answer;
  return answer.map((blank, index) => (index === next ? optionIndex : blank));
}

export function clearBlank(answer: BlankAnswer, blankIndex: number): BlankAnswer {
  return answer.map((blank, index) => (index === blankIndex ? undefined : blank));
}
