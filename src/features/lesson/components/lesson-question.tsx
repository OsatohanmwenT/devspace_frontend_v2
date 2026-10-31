import { DevyMood } from "~/components/devy";
import { RichText } from "~/components/ui/rich-text";
import type { Question } from "~/types/lesson";
import { isFillQuestion, isQuestionCorrect, type Answer, type BlankAnswer } from "../lib/question-state";
import { FillQuestionView } from "./fill-question";
import { MultipleChoice } from "./multiple-choice";

type LessonQuestionProps = {
  question: Question;
  answer: Answer;
  checked: boolean;
  // A wrong answer with an attempt left: a nudge, not the reveal.
  retrying: boolean;
  onAnswer: (answer: Answer) => void;
};

export function LessonQuestion({ question, answer, checked, retrying, onAnswer }: LessonQuestionProps) {
  const correct = checked && isQuestionCorrect(question, answer);

  return (
    <section className="grid w-full max-w-[720px] gap-3">
      <h1 className="m-0 text-[19px] font-semibold text-neutral-800 dark:text-night-ink">
        <RichText content={question.prompt} />
      </h1>

      {isFillQuestion(question) ? (
        <FillQuestionView question={question} answer={answer as BlankAnswer | undefined} checked={checked} onAnswer={onAnswer} />
      ) : (
        <MultipleChoice question={question} answer={answer as number | undefined} checked={checked} onAnswer={onAnswer} />
      )}

      {/* Nothing about correctness or the explanation is derived while a retry
          is left, so there is nothing to spoil even by inspecting the page. */}
      {!checked && retrying && (
        <aside className="flex items-center gap-3 rounded-xl border border-[#f0dfa8] bg-[#fdf6e3] px-4 py-2.5 max-tab:items-start dark:border-[#4a3f22] dark:bg-[#2a2416]" aria-live="polite">
          <DevyMood mood="neutral" className="size-9 flex-none" />
          <div className="min-w-0 flex-1">
            <strong className="block text-sm text-neutral-800 dark:text-night-ink">Not quite yet</strong>
            <p className="m-0 mt-0.5 text-[13px] leading-[1.4] text-ink-soft dark:text-night-soft">Have another look and try again.</p>
          </div>
        </aside>
      )}

      {checked && (
        <div
          className={`rounded-2xl border px-5 py-3.5 ${
            correct
              ? "animate-answer-correct border-[#b6e3ca] bg-[#e7f6ee] dark:border-[#2b5540] dark:bg-[#16281f]"
              : "animate-answer-wrong border-[#f5c6c2] bg-[#fdecea] dark:border-[#5c2f2b] dark:bg-[#2a1817]"
          }`}
        >
          <strong className={`block text-sm ${correct ? "text-[#197a4b] dark:text-[#6ee7a8]" : "text-[#b3261e] dark:text-[#ffa8a2]"}`}>{correct ? "Correct" : "Not quite"}</strong>
          <p className="m-0 mt-2 text-[15px] leading-[1.55] text-neutral-800 dark:text-night-ink">
            <RichText content={question.explanation} />
          </p>
        </div>
      )}
    </section>
  );
}
