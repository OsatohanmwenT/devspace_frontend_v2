"use client";

import { useEffect, useEffectEvent, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { createPortal } from "react-dom";
import type { FillQuestion } from "~/types/lesson";
import { EDITOR_BAR, EDITOR_FRAME, EDITOR_LINE, EDITOR_SURFACE, EDITOR_TEXT } from "../lib/editor-theme";
import { TOKEN_CLASSES, tokenizePython } from "../lib/python-highlight";
import { clearBlank, emptyAnswer, fillNextBlank, type BlankAnswer } from "../lib/question-state";
import { PythonIcon } from "./python-icon";

type FillProps = {
  question: FillQuestion;
  answer: BlankAnswer | undefined;
  checked: boolean;
  onAnswer: (answer: BlankAnswer) => void;
};

const BLANK =
  "focus-ring mx-1 my-1 inline-flex min-h-[38px] min-w-[102px] items-center justify-center rounded-lg px-2.5 py-[3px] align-middle font-mono text-sm leading-[1.2] font-semibold transition-[background-color,box-shadow,transform] duration-100 active:not-disabled:translate-y-[3px] active:not-disabled:shadow-none max-tab:min-h-9 max-tab:min-w-[86px] max-tab:px-2";

function blankState(checked: boolean, selected: string | undefined, correct: boolean) {
  if (checked && selected && correct) return "animate-answer-correct cursor-pointer border border-solid border-[#86efac] bg-white text-neutral-800 shadow-[0_4px_0_#86efac] dark:bg-[#303030] dark:text-night-ink dark:shadow-[0_4px_0_#4ade80]";
  if (checked && selected) return "animate-answer-wrong cursor-pointer border border-solid border-[#ff676d] bg-white text-neutral-800 shadow-[0_4px_0_#dc2626] dark:bg-[#303030] dark:text-night-ink dark:shadow-[0_4px_0_#b91c1c]";
  if (selected) return "animate-choice-in cursor-pointer border border-solid border-[#d5d5d5] bg-white text-neutral-800 shadow-[0_4px_0_#d8d4cd] dark:border-[#515151] dark:bg-[#303030] dark:text-night-ink dark:shadow-[0_4px_0_#3d3d3d]";
  return "cursor-default border border-dashed border-[#d5d5d5] bg-white text-neutral-800 dark:border-[#515151] dark:bg-[#303030] dark:text-night-ink";
}

type BlankProps = FillProps & {
  blankIndex: number;
  dropTarget: number | undefined;
};

function Blank({ question, answer, blankIndex, checked, onAnswer, dropTarget }: BlankProps) {
  const current = answer ?? (emptyAnswer(question) as BlankAnswer);
  const selectedIndex = current[blankIndex];
  const selected = selectedIndex === undefined ? undefined : question.options[selectedIndex];
  const isDropTarget = dropTarget === blankIndex;

  return (
    <button
      type="button"
      data-blank={blankIndex}
      className={`${BLANK} ${blankState(checked, selected, selected === question.answers[blankIndex])} ${isDropTarget ? "ring-2 ring-[#6699ec] ring-offset-2 ring-offset-white dark:ring-offset-[#1e1e1e]" : ""}`}
      disabled={checked}
      onClick={() => onAnswer(clearBlank(current, blankIndex))}
      aria-label={selected ? `Blank ${blankIndex + 1}: ${selected}. Activate to clear.` : `Blank ${blankIndex + 1}: empty`}
    >
      {selected ?? " "}
    </button>
  );
}

const TOKEN =
  "min-h-11 rounded-[10px] border border-solid border-[#d5d5d5] bg-white px-4 font-mono text-sm font-semibold text-neutral-800 shadow-[0_4px_0_#d8d4cd] dark:border-[#515151] dark:bg-[#303030] dark:text-night-ink dark:shadow-[0_4px_0_#3d3d3d]";

// What the pointer is carrying: the option, and where its button sits now.
type Carry = { optionIndex: number; x: number; y: number; width: number; height: number };
type Press = { optionIndex: number; offsetX: number; offsetY: number; startX: number; startY: number; width: number; height: number; moving: boolean };

// A press that moves further than this is a drag, not a click.
const DRAG_THRESHOLD = 5;

const blankAt = (x: number, y: number) => {
  const blank = document.elementFromPoint(x, y)?.closest<HTMLElement>("[data-blank]");
  return blank ? Number(blank.dataset.blank) : undefined;
};

function TokenBank({ question, answer, checked, onAnswer, carry, onPress, takeClick }: FillProps & {
  carry: Carry | null;
  onPress: (event: ReactPointerEvent<HTMLButtonElement>, optionIndex: number) => void;
  takeClick: () => boolean;
}) {
  const current = answer ?? (emptyAnswer(question) as BlankAnswer);

  return (
    <div className="flex flex-wrap gap-x-4 gap-y-5" role="group" aria-label="Answer options">
      {question.options.map((option, optionIndex) => {
        const used = current.includes(optionIndex);
        const carried = carry?.optionIndex === optionIndex;
        return (
          <button
            key={optionIndex}
            type="button"
            className={`focus-ring ${TOKEN} touch-none transition-[background-color,box-shadow,transform,opacity] duration-100 select-none active:not-disabled:translate-y-[3px] active:not-disabled:shadow-none enabled:cursor-grab enabled:hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-45 dark:enabled:hover:brightness-125 ${carried ? "opacity-30" : ""}`}
            disabled={used || checked}
            onPointerDown={(event) => onPress(event, optionIndex)}
            onClick={() => !takeClick() && onAnswer(fillNextBlank(current, optionIndex))}
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
    <div className={`overflow-hidden rounded-2xl shadow-[0_1px_2px_rgb(0_0_0/0.04)] ${EDITOR_FRAME} ${EDITOR_SURFACE}`}>
      <div className={`flex items-center gap-2.5 border-b px-4 py-2.5 ${EDITOR_LINE} ${EDITOR_BAR}`}>
        <PythonIcon className="size-[18px]" />
        <span className="font-mono text-[13px] font-medium text-neutral-800 dark:text-[#e8e8e8]">{question.filename ?? "script.py"}</span>
      </div>
      <pre className={`overflow-x-auto px-5 py-5 font-mono text-sm leading-[2.2] ${EDITOR_TEXT}`}>
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
    <p className="m-0 text-[clamp(18px,1.5vw,21px)] leading-[2.3] text-neutral-800 max-tab:text-[19px] dark:text-night-ink">
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
};

// Prose or code with blanks, plus the bank of options to click or drag into
// them. Dragging is pointer-driven rather than native drag and drop, so the
// real button follows the pointer instead of a faded snapshot of it.
export function FillQuestionView({ question, answer, checked, onAnswer }: FillProps) {
  const [dropTarget, setDropTarget] = useState<number | undefined>();
  const [carry, setCarry] = useState<Carry | null>(null);
  const press = useRef<Press | null>(null);
  const swallowClick = useRef(false);

  const placeOption = (optionIndex: number, blankIndex: number) => {
    if (checked || optionIndex < 0 || optionIndex >= question.options.length) return;
    // Dropping an option that is already placed moves it rather than copying it.
    const next = [...(answer ?? (emptyAnswer(question) as BlankAnswer))];
    const existing = next.indexOf(optionIndex);
    if (existing !== -1) next[existing] = undefined;
    next[blankIndex] = optionIndex;
    onAnswer(next);
  };

  const onPress = (event: ReactPointerEvent<HTMLButtonElement>, optionIndex: number) => {
    if (checked || event.button !== 0) return;
    const rect = event.currentTarget.getBoundingClientRect();
    press.current = {
      optionIndex,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
      startX: event.clientX,
      startY: event.clientY,
      width: rect.width,
      height: rect.height,
      moving: false,
    };
  };

  const onMove = useEffectEvent((event: PointerEvent) => {
    const current = press.current;
    if (!current) return;
    if (!current.moving && Math.hypot(event.clientX - current.startX, event.clientY - current.startY) < DRAG_THRESHOLD) return;
    current.moving = true;
    setCarry({
      optionIndex: current.optionIndex,
      x: event.clientX - current.offsetX,
      y: event.clientY - current.offsetY,
      width: current.width,
      height: current.height,
    });
    setDropTarget(blankAt(event.clientX, event.clientY));
  });

  const onRelease = useEffectEvent((event: PointerEvent) => {
    const current = press.current;
    press.current = null;
    if (!current?.moving) return;
    // The click that follows a drag must not also fill the next blank.
    swallowClick.current = true;
    window.setTimeout(() => (swallowClick.current = false), 0);
    const target = event.type === "pointerup" ? blankAt(event.clientX, event.clientY) : undefined;
    if (target !== undefined) placeOption(current.optionIndex, target);
    setCarry(null);
    setDropTarget(undefined);
  });

  useEffect(() => {
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onRelease);
    window.addEventListener("pointercancel", onRelease);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onRelease);
      window.removeEventListener("pointercancel", onRelease);
    };
  }, []);

  const takeClick = () => {
    const swallowed = swallowClick.current;
    swallowClick.current = false;
    return swallowed;
  };

  const layout = { question, answer, checked, onAnswer, dropTarget };

  return (
    <div className="grid gap-9 rounded-2xl border border-[#e1e1e1] bg-[#f7f7f7] p-7 max-tab:p-5 dark:border-[#373737] dark:bg-[#202020]">
      {question.type === "code-fill" ? <CodeFill {...layout} /> : <ProseFill {...layout} />}
      <div className="grid gap-5">
        <p className="m-0 text-[15px] font-semibold text-[#777] dark:text-[#b2b2b6]">Click or drag an option to fill the blanks:</p>
        <TokenBank {...layout} carry={carry} onPress={onPress} takeClick={takeClick} />
      </div>
      {carry &&
        createPortal(
          <div
            aria-hidden="true"
            className={`${TOKEN} pointer-events-none fixed top-0 left-0 z-[200] grid cursor-grabbing place-items-center shadow-[0_14px_24px_-8px_rgb(0_0_0/0.35)]`}
            style={{ width: carry.width, height: carry.height, transform: `translate(${carry.x}px, ${carry.y}px) scale(1.06) rotate(-2deg)` }}
          >
            {question.options[carry.optionIndex]}
          </div>,
          document.body,
        )}
    </div>
  );
}
