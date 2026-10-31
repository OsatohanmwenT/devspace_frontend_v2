import { Fragment } from "react";
import { DevyLottie, type LottieClipName } from "~/components/devy";
import type { ExerciseTask } from "~/types/lesson";
import type { ExerciseResult } from "../lib/code-exercise";
import { formatPythonError } from "../lib/mini-python";
import { TOKEN_CLASSES, tokenizePython } from "../lib/python-highlight";
import type { DevyMood, DevyNote } from "../hooks/use-code-exercise";
import { RUN_SHORTCUT } from "./code-surface";

// `inline code` in Devy's lines and task text, without pulling in markdown.
export function InlineCode({ text }: { text: string }) {
  return text.split(/(`[^`]+`)/g).map((part, index) =>
    part.startsWith("`") && part.endsWith("`") ? (
      <code key={index} className="rounded bg-black/[0.07] px-1 py-px font-mono text-[0.9em] dark:bg-white/10">
        {part.slice(1, -1)}
      </code>
    ) : (
      <Fragment key={index}>{part}</Fragment>
    ),
  );
}

function Highlighted({ code }: { code: string }) {
  return code.split("\n").map((line, index) => (
    <div key={index}>
      {line
        ? tokenizePython(line).map((token, tokenIndex) => (
            <span key={tokenIndex} className={TOKEN_CLASSES[token.type]}>
              {token.value}
            </span>
          ))
        : "​"}
    </div>
  ));
}

export function CodeSnippet({ code }: { code: string }) {
  return (
    <pre className="m-0 overflow-auto rounded-md bg-[#1e1e1e] px-3 py-2 font-mono text-[13px] leading-[1.55]">
      <Highlighted code={code} />
    </pre>
  );
}

// The task list, ticked off by the last run.
export function TaskList({ tasks, result }: { tasks: ExerciseTask[]; result: ExerciseResult | null }) {
  return (
    <ul className="m-0 grid list-none gap-2.5 p-0">
      {tasks.map((task, index) => {
        const done = Boolean(result?.tasks[index]?.done);
        return (
          <li key={task.title} className="flex gap-3">
            <span
              className={`mt-0.5 grid size-5 flex-none place-items-center rounded-full border-2 transition-colors ${done ? "border-[#22c55e] bg-[#22c55e] text-white" : "border-[#c5cfdd] dark:border-[#4a4a4f]"}`}
              aria-hidden="true"
            >
              {done && (
                <svg className="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              )}
            </span>
            <span className="text-[14.5px] leading-normal text-[#1d3048] dark:text-[#e6e8ec]">
              <strong className={done ? "text-[#15803d] dark:text-[#6ee7a8]" : ""}>{task.title}.</strong>{" "}
              <span className="text-[#516984] dark:text-[#a9a9ad]">
                <InlineCode text={task.description} />
              </span>
              <span className="sr-only">{done ? " (done)" : " (not done yet)"}</span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}

export function ConsoleOutput({ result }: { result: ExerciseResult | null }) {
  if (!result) return <span className="text-[#8a8f9c]">Run your code to see what it prints. ({RUN_SHORTCUT})</span>;
  return (
    <>
      {result.output && <span>{result.output}</span>}
      {!result.output && !result.error && <span className="text-[#8a8f9c]">(Your program ran but didn’t print anything.)</span>}
      {result.error && (
        <span className="text-[#ff8a8a]">
          {result.output && !result.output.endsWith("\n") ? "\n" : ""}
          {formatPythonError(result.error)}
        </span>
      )}
    </>
  );
}

const CLIP: Record<DevyMood, LottieClipName> = {
  greet: "wave",
  idle: "listening",
  hint: "thinking",
  nudge: "listening",
  error: "thinking",
  success: "lesson-complete",
};

const TONE: Partial<Record<DevyMood, string>> = {
  error: "border-[#ff8a8a]/40 bg-[#fff5f5] dark:border-[#ff6b6b]/35 dark:bg-[#2a1d1f]",
  success: "border-[#22c55e]/40 bg-[#f0fdf4] dark:border-[#22c55e]/35 dark:bg-[#16261c]",
};

type DevyCoachProps = {
  devy: DevyNote;
  onHint: () => void;
  hintLabel: string;
  hasMoreHints: boolean;
  completed: boolean;
  compact?: boolean;
};

// Devy, docked in the editor: reacts to every run and hands out hints.
export function DevyCoach({ devy, onHint, hintLabel, hasMoreHints, completed, compact = false }: DevyCoachProps) {
  const clip = CLIP[devy.mood];

  return (
    <section className={`flex items-end gap-2 ${compact ? "" : "p-4 pt-3"}`} aria-label="Devy" aria-live="polite">
      {/* Devy stands in the bottom-left corner; the bubble floats up beside his
          head so the tail points at him rather than at his feet. */}
      <DevyLottie key={clip} clip={clip} loop={clip !== "lesson-complete"} className={`${compact ? "size-[112px] max-[720px]:size-[88px]" : "size-[120px]"} -mb-2 -ml-2 flex-none`} />
      <div
        className={`relative mb-12 min-w-0 flex-1 rounded-2xl rounded-bl-md border px-3.5 py-3 shadow-[0_10px_24px_-18px_rgba(0,0,0,.45)] max-[720px]:mb-8 ${TONE[devy.mood] ?? "border-[#dbe7fb] bg-[#f4f8ff] dark:border-[#34465e] dark:bg-[#1d2531]"}`}
      >
        <p className="m-0 text-sm leading-normal text-[#1d3048] dark:text-[#e6e8ec]">
          <InlineCode text={devy.text} />
        </p>
        {devy.code && (
          <div className="mt-2.5">
            <CodeSnippet code={devy.code} />
          </div>
        )}
        {!completed && hasMoreHints && (
          <button
            type="button"
            onClick={onHint}
            className="focus-ring mt-2.5 inline-flex min-h-8 items-center gap-1.5 rounded-full border border-[#bfd3f7] bg-white px-3 text-[12.5px] font-semibold text-[#2f6ad8] transition-colors hover:bg-[#eaf1ff] dark:border-[#6699ec]/45 dark:bg-transparent dark:text-[#9cc0ff] dark:hover:bg-[#6699ec]/15"
          >
            <svg aria-hidden="true" className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M9 18h6M10 22h4M8.5 14.5C7.6 13.7 7 12.5 7 11a5 5 0 0 1 10 0c0 1.5-.6 2.7-1.5 3.5-.8.7-1.5 1.4-1.5 2.5h-4c0-1.1-.7-1.8-1.5-2.5Z" />
            </svg>
            {hintLabel}
          </button>
        )}
      </div>
    </section>
  );
}

export function RunButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={`Run (${RUN_SHORTCUT})`}
      className="focus-ring inline-flex min-h-9 items-center gap-2 rounded-lg bg-[#22c55e] px-4 text-sm font-semibold text-[#052e14] transition-colors hover:bg-[#34d46c]"
    >
      <svg aria-hidden="true" className="size-3.5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M7 4.5v15l13-7.5-13-7.5Z" />
      </svg>
      Run
      <kbd className="hidden rounded bg-black/15 px-1.5 py-px text-[11px] font-semibold min-[900px]:inline">{RUN_SHORTCUT}</kbd>
    </button>
  );
}

export function ResetButton({ onClick, disabled }: { onClick: () => void; disabled: boolean }) {
  return (
    <button
      type="button"
      aria-label="Reset code"
      title="Reset code"
      disabled={disabled}
      onClick={onClick}
      className="focus-ring grid size-9 place-items-center rounded-lg border border-white/15 text-[#d4d4d4] transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
    >
      <svg aria-hidden="true" className="size-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5" />
      </svg>
    </button>
  );
}

export function ContinueButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      autoFocus
      className="focus-ring inline-flex min-h-9 items-center gap-2 rounded-lg bg-[#6699ec] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#4f83db]"
    >
      {label}
      <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    </button>
  );
}

export function FileTab({ filename }: { filename: string }) {
  return (
    <div className="flex items-center gap-2 border-r border-white/[0.07] bg-[#1e1e1e] px-4">
      <span className="grid size-4 place-items-center rounded-sm bg-[#569cd6] text-[9px] font-bold text-neutral-800">PY</span>
      <span className="font-mono text-[13px] font-medium text-[#e8e8e8]">{filename}</span>
    </div>
  );
}
