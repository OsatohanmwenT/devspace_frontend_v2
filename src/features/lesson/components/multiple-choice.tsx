import { RichText } from "~/components/ui/rich-text";
import type { MultipleChoiceQuestion } from "~/types/lesson";

type MultipleChoiceProps = {
  question: MultipleChoiceQuestion;
  answer: number | undefined;
  checked: boolean;
  onAnswer: (optionIndex: number) => void;
};

export function MultipleChoice({ question, answer, checked, onAnswer }: MultipleChoiceProps) {
  return (
    <div className="grid gap-2" role="group" aria-label="Answer options">
      {question.options.map((option, optionIndex) => {
        const selected = answer === optionIndex;
        const isCorrectOption = optionIndex === question.correctIndex;
        const wrongPick = checked && selected && !isCorrectOption;
        const state =
          checked && isCorrectOption
            ? "animate-answer-correct border-[#b6e3ca] bg-[#e7f6ee] dark:border-[#2b5540] dark:bg-[#16281f]"
            : wrongPick
              ? "animate-answer-wrong border-[#ff676d] bg-[#fdecea] dark:bg-[#442f30]"
              : selected
                ? "animate-choice-in border-[#6699ec] bg-[#e4eaf4] dark:bg-[#2f2e3e]"
                : "border-[#e1e1e1] bg-[#f5f5f5] hover:border-[#6699ec] dark:border-night-line dark:bg-[#262626]";

        return (
          <button
            key={optionIndex}
            type="button"
            className={`focus-ring flex items-center justify-between gap-3 rounded-xl border px-4 py-2.5 text-left text-[15px] leading-normal text-neutral-800 transition-[border-color,background] duration-[120ms] active:not-disabled:translate-y-px active:not-disabled:scale-[0.985] dark:text-night-ink ${state}`}
            aria-pressed={selected}
            disabled={checked}
            onClick={() => onAnswer(optionIndex)}
          >
            <RichText content={option} />
            {checked && isCorrectOption && (
              <svg className="size-5 flex-none text-[#16834e]" viewBox="0 0 24 24" fill="none" aria-label="Correct answer">
                <path d="m5 12.5 4.2 4.2L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
            {wrongPick && (
              <svg className="size-5 flex-none text-[#b3261e]" viewBox="0 0 24 24" fill="none" aria-label="Incorrect answer">
                <path d="M7 7l10 10M17 7 7 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            )}
          </button>
        );
      })}
    </div>
  );
}
