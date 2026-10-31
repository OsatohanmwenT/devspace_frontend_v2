"use client";

import { useCodeExercise } from "../hooks/use-code-exercise";
import { CodeSurface } from "./code-surface";
import { ConsoleOutput, ContinueButton, DevyCoach, FileTab, ResetButton, RunButton, TaskList } from "./editor-parts";
import type { CodeEditorProps } from "./lesson-code-editor";

// One focused column: the task, the editor, the output, Devy.
export function GuidedCodeEditor({ content, code, completed, onCodeChange, onComplete, onContinue }: CodeEditorProps) {
  const currentCode = code ?? content.starterCode;
  const exercise = useCodeExercise({ content, code: currentCode, completed, onCodeChange, onComplete });

  return (
    <section className="min-h-full overflow-auto bg-canvas px-6 py-10 max-[720px]:px-4 max-[720px]:py-6 dark:bg-[#171717]">
      <div className="mx-auto grid w-full max-w-[720px] gap-5">
        <header className="text-center">
          <span className="text-xs font-bold tracking-[0.16em] text-[#6699ec] uppercase">Code lab</span>
          <h1 className="m-0 mt-2 text-[clamp(26px,3vw,34px)] font-semibold text-[#172b44] dark:text-night-ink">{content.title}</h1>
          <p className="mx-auto mt-3 mb-0 max-w-[52ch] text-base leading-[1.55] text-[#516984] dark:text-[#b2b2b6]">{content.description}</p>
        </header>

        <div className="rounded-2xl border border-[#e1e1e1] bg-white px-5 py-4 dark:border-night-line dark:bg-[#202020]">
          <TaskList tasks={content.tasks} result={exercise.result} />
        </div>

        <section className="overflow-hidden rounded-2xl border border-[#28303c] bg-[#1e1e1e] shadow-[0_18px_40px_rgba(23,43,68,.18)]">
          <header className="flex min-h-11 items-stretch border-b border-white/[0.07] bg-[#252526]">
            <FileTab filename={content.filename} />
          </header>
          <CodeSurface code={currentCode} onChange={exercise.edit} onRun={exercise.run} disabled={completed} errorLine={exercise.result?.error?.line} minHeight={240} />
          <div className="flex flex-wrap items-center gap-2 border-t border-white/[0.07] bg-[#252526] px-4 py-3">
            <ResetButton onClick={exercise.reset} disabled={completed} />
            <RunButton onClick={exercise.run} />
            {completed && (
              <span className="ml-auto">
                <ContinueButton onClick={onContinue} label={content.continueLabel ?? "Continue lesson"} />
              </span>
            )}
          </div>
          <pre className="m-0 max-h-[180px] min-h-16 overflow-auto border-t border-white/[0.07] bg-[#181818] px-4 py-3 font-mono text-[13.5px] leading-[1.6] whitespace-pre-wrap text-[#d4d4d4]" aria-live="polite">
            <ConsoleOutput result={exercise.result} />
          </pre>
        </section>

        <DevyCoach devy={exercise.devy} onHint={exercise.nextHint} hintLabel={exercise.hintLabel} hasMoreHints={exercise.hasMoreHints} completed={completed} compact />
      </div>
    </section>
  );
}
