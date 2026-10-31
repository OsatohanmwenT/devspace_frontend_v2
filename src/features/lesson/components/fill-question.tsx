"use client";

import { useState } from "react";
import type { FillQuestion } from "~/types/lesson";
import { TOKEN_CLASSES, tokenizePython } from "../lib/python-highlight";
import { clearBlank, emptyAnswer, fillNextBlank, type BlankAnswer } from "../lib/question-state";

type FillProps = {
  question: FillQuestion;
  answer: BlankAnswer | undefined;
  checked: boolean;
  onAnswer: (answer: BlankAnswer) => void;
};

const BLANK =
  "focus-ring mx-[3px] inline-flex min-h-[38px] min-w-[102px] items-center justify-center rounded-lg px-2.5 py-[3px] align-middle font-mono text-sm leading-[1.2] font-medium text-neutral-800 active:not-disabled:translate-y-px active:not-disabled:scale-[0.985] max-tab:min-h-9 max-tab:min-w-[86px] max-tab:px-2 dark:text-night-ink";

function blankState(checked: boolean, selected: string | undefined, correct: boolean) {
  if (checked && selected && correct) return "animate-answer-correct cursor-pointer border border-solid border-[#04adc0] bg-[#cee9ed] dark:bg-[#213c3f]";
  if (checked && selected) return "animate-answer-wrong cursor-pointer border border-solid border-[#ff676d] bg-[#f6e1e2] dark:bg-[#442f30]";
  if (selected) return "animate-choice-in cursor-pointer border border-solid border-[#6699ec] bg-white dark:bg-[#303030]";
  return "cursor-default border border-dashed border-[#d5d5d5] bg-white dark:border-[#515151] dark:bg-[#303030]";
}

type BlankProps = FillProps & {
  blankIndex: number;
  dropTarget: number | undefined;
  onDropTarget: (blankIndex: number | undefined) => void;
  onDropOption: (optionIndex: number, blankIndex: number) => void;
};

function Blank({ question, answer, blankIndex, checked, onAnswer, dropTarget, onDropTarget, onDropOption }: BlankProps) {
  const current = answer ?? (emptyAnswer(question) as BlankAnswer);
  const selectedIndex = current[blankIndex];
  const selected = selectedIndex === undefined ? undefined : question.options[selectedIndex];
  const isDropTarget = dropTarget === blankIndex;

  return (
    <button
      type="button"
      className={`${BLANK} ${blankState(checked, selected, selected === question.answers[blankIndex])} ${isDropTarget ? "bg-[#eef5ff] ring-2 ring-[#6699ec] ring-offset-2 dark:bg-[#303030]" : ""}`}
      disabled={checked}
      onClick={() => onAnswer(clearBlank(current, blankIndex))}
      onDragOver={(event) => {
        if (checked) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
        onDropTarget(blankIndex);
      }}
      onDragLeave={() => isDropTarget && onDropTarget(undefined)}
      onDrop={(event) => {
        event.preventDefault();
        onDropTarget(undefined);
        const optionIndex = Number(event.dataTransfer.getData("text/plain"));
        if (Number.isInteger(optionIndex)) onDropOption(optionIndex, blankIndex);
      }}
      aria-label={selected ? `Blank ${blankIndex + 1}: ${selected}. Activate to clear.` : `Blank ${blankIndex + 1}: empty`}
    >
      {selected ?? " "}
    </button>
  );
}

function TokenBank({ question, answer, checked, onAnswer, onDragStart, onDragEnd }: FillProps & { onDragStart: () => void; onDragEnd: () => void }) {
  const current = answer ?? (emptyAnswer(question) as BlankAnswer);

  return (
    <div className="flex flex-wrap gap-2.5" role="group" aria-label="Answer options">
      {question.options.map((option, optionIndex) => {
        const used = current.includes(optionIndex);
        return (
          <button
            key={optionIndex}
            type="button"
            className="focus-ring min-h-11 rounded-[10px] border border-[#d5d5d5] bg-white px-4 font-mono text-sm font-medium text-neutral-800 transition-[border-color,background] duration-[120ms] active:not-disabled:translate-y-px active:not-disabled:scale-[0.985] enabled:hover:border-[#6699ec] enabled:hover:bg-[#f0f5fd] disabled:cursor-not-allowed disabled:opacity-45 dark:border-[#4a4a4a] dark:bg-[#303030] dark:text-night-ink dark:enabled:hover:bg-[#393747]"
            disabled={used || checked}
            draggable={!used && !checked}
            onDragStart={(event) => {
              event.dataTransfer.effectAllowed = "move";
              event.dataTransfer.setData("text/plain", String(optionIndex));
              onDragStart();
            }}
            onDragEnd={onDragEnd}
            onClick={() => onAnswer(fillNextBlank(current, optionIndex))}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}

// Code with blanks, a Parsons-style exercise: the static parts are syntax
// highlighted, the blanks are the same fill model as prose questions.
function CodeFill(props: BlankLayoutProps) {
  const { question } = props;
  return (
    <div className="overflow-hidden rounded-2xl border border-[#3a3a3a] bg-[#1e1e1e]">
      <div className="flex items-center gap-2 border-b border-night-line bg-[#252526] px-4 py-2.5">
        <span className="grid size-4 place-items-center rounded-sm bg-[#569cd6] text-[9px] font-bold text-neutral-800">PY</span>
        <span className="font-mono text-[13px] text-[#d4d4d4]">{question.filename ?? "script.py"}</span>
      </div>
      <pre className="overflow-x-auto px-4 py-3.5 font-mono text-sm leading-[1.8] text-[#d4d4d4]">
        <code>
          {question.segments.map((segment, index) => (
            <span key={index}>
              {tokenizePython(segment).map((token, tokenIndex) => (
                <span key={tokenIndex} className={TOKEN_CLASSES[token.type]}>
                  {token.value}
                </span>
              ))}
              {index < question.answers.length && <Blank {...props} blankIndex={index} />}
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}

function ProseFill(props: BlankLayoutProps) {
  const { question } = props;
  return (
    <p className="m-0 text-[clamp(18px,1.5vw,21px)] leading-[1.55] text-neutral-800 max-tab:text-[19px] dark:text-night-ink">
      {question.segments.map((segment, index) => (
        <span key={index}>
          {segment}
          {index < question.answers.length && <Blank {...props} blankIndex={index} />}
        </span>
      ))}
    </p>
  );
}

type BlankLayoutProps = FillProps & {
  dropTarget: number | undefined;
  onDropTarget: (blankIndex: number | undefined) => void;
  onDropOption: (optionIndex: number, blankIndex: number) => void;
};

// Prose or code with blanks, plus the bank of options to click or drag into them.
export function FillQuestionView({ question, answer, checked, onAnswer }: FillProps) {
  const [dropTarget, setDropTarget] = useState<number | undefined>();

  const placeOption = (optionIndex: number, blankIndex: number) => {
    if (checked || optionIndex < 0 || optionIndex >= question.options.length) return;
    // Dropping an option that is already placed moves it rather than copying it.
    const next = [...(answer ?? (emptyAnswer(question) as BlankAnswer))];
    const existing = next.indexOf(optionIndex);
    if (existing !== -1) next[existing] = undefined;
    next[blankIndex] = optionIndex;
    onAnswer(next);
  };

  const layout = { question, answer, checked, onAnswer, dropTarget, onDropTarget: setDropTarget, onDropOption: placeOption };

  return (
    <div className="grid gap-3 rounded-2xl border border-[#e1e1e1] bg-[#f7f7f7] p-3.5 max-tab:p-3 dark:border-[#373737] dark:bg-[#202020]">
      {question.type === "code-fill" ? <CodeFill {...layout} /> : <ProseFill {...layout} />}
      <div className="grid gap-2.5">
        <p className="m-0 text-[15px] font-semibold text-[#777] dark:text-[#b2b2b6]">Click or drag an option to fill the blanks:</p>
        <TokenBank {...layout} onDragStart={() => setDropTarget(undefined)} onDragEnd={() => setDropTarget(undefined)} />
      </div>
    </div>
  );
}
