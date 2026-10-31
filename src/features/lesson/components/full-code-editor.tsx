"use client";

import { useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react";
import { useCodeExercise } from "../hooks/use-code-exercise";
import { CodeSurface } from "./code-surface";
import { CodeSnippet, ConsoleOutput, ContinueButton, DevyCoach, FileTab, ResetButton, RunButton, TaskList } from "./editor-parts";
import type { CodeEditorProps } from "./lesson-code-editor";

const WIDTH_RANGE = [26, 55] as const;
const HEIGHT_RANGE = [40, 85] as const;
const clamp = (value: number, [min, max]: readonly [number, number]) => Math.round(Math.max(min, Math.min(max, value)));

const PANE = "border border-[#e1e1e1] bg-white dark:border-[#353535] dark:bg-[#202020]";
const PANE_HEADER = "flex min-h-10 items-center border-b border-[#e1e1e1] bg-[#f5f5f4] px-4 dark:border-[#353535] dark:bg-[#262626]";

// Exercise pane (collapsible, resizable) beside the editor over the console. On
// narrow screens the panes stack and the page scrolls.
export function FullCodeEditor({ content, code, completed, onCodeChange, onComplete, onContinue }: CodeEditorProps) {
  const currentCode = code ?? content.starterCode;
  const exercise = useCodeExercise({ content, code: currentCode, completed, onCodeChange, onComplete });
  const [exerciseWidth, setExerciseWidth] = useState(38);
  const [editorHeight, setEditorHeight] = useState(68);
  const [collapsed, setCollapsed] = useState(false);
  const workspace = useRef<HTMLElement>(null);
  const editorArea = useRef<HTMLDivElement>(null);

  const dragResize = (event: PointerEvent, axis: "x" | "y") => {
    event.preventDefault();
    const bounds = (axis === "x" ? workspace.current : editorArea.current)?.getBoundingClientRect();
    if (!bounds) return;
    const resize = (move: globalThis.PointerEvent) => {
      if (axis === "x") setExerciseWidth(clamp(((move.clientX - bounds.left) / bounds.width) * 100, WIDTH_RANGE));
      else setEditorHeight(clamp(((move.clientY - bounds.top) / bounds.height) * 100, HEIGHT_RANGE));
    };
    const stop = () => {
      window.removeEventListener("pointermove", resize);
      window.removeEventListener("pointerup", stop);
    };
    window.addEventListener("pointermove", resize);
    window.addEventListener("pointerup", stop);
  };

  const keyResize = (event: KeyboardEvent, axis: "x" | "y") => {
    const less = axis === "x" ? "ArrowLeft" : "ArrowUp";
    const more = axis === "x" ? "ArrowRight" : "ArrowDown";
    if (event.key !== less && event.key !== more) return;
    event.preventDefault();
    const delta = (event.key === less ? -1 : 1) * (event.shiftKey ? 5 : 2);
    if (axis === "x") setExerciseWidth((width) => clamp(width + delta, WIDTH_RANGE));
    else setEditorHeight((height) => clamp(height + delta, HEIGHT_RANGE));
  };

  const coach = <DevyCoach devy={exercise.devy} onHint={exercise.nextHint} hintLabel={exercise.hintLabel} hasMoreHints={exercise.hasMoreHints} completed={completed} />;

  return (
    <section
      ref={workspace}
      style={{ "--exercise-width": `${exerciseWidth}%`, "--editor-height": `${editorHeight}%` } as CSSProperties}
      className={`grid size-full min-h-0 gap-2 overflow-auto bg-[#f3f3f1] p-3 min-[900px]:gap-0 min-[900px]:overflow-hidden dark:bg-[#141414] ${collapsed ? "min-[900px]:grid-cols-[44px_8px_minmax(0,1fr)]" : "min-[900px]:grid-cols-[minmax(300px,var(--exercise-width))_8px_minmax(0,1fr)]"}`}
    >
      {collapsed ? (
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          aria-label="Show exercise"
          aria-expanded="false"
          aria-controls="editor-exercise-pane"
          className={`focus-ring hidden flex-col items-center gap-3 rounded-lg py-3 text-[#455871] transition-colors hover:bg-[#eaeef5] min-[900px]:flex dark:text-[#c4ccd8] dark:hover:bg-[#262626] ${PANE}`}
        >
          <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path d="m9 18 6-6-6-6" />
          </svg>
          <span className="text-xs font-semibold [writing-mode:vertical-rl]">Exercise</span>
        </button>
      ) : (
        <aside id="editor-exercise-pane" className={`grid min-h-0 grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden rounded-lg ${PANE}`}>
          <header className={PANE_HEADER}>
            <svg aria-hidden="true" className="mr-2 size-4 text-[#1d3048] dark:text-[#d9e3f2]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <rect x="4" y="3" width="16" height="18" rx="2" />
              <path d="M8 8h8M8 12h8M8 16h5" />
            </svg>
            <span className="text-sm font-semibold text-[#1d3048] dark:text-night-ink">Exercise</span>
            <button
              type="button"
              onClick={() => setCollapsed(true)}
              aria-label="Hide exercise"
              aria-expanded="true"
              aria-controls="editor-exercise-pane"
              className="focus-ring ml-auto hidden size-7 place-items-center rounded text-[#455871] transition-colors hover:bg-[#dfe4ed] min-[900px]:grid dark:text-[#c4ccd8] dark:hover:bg-[#383838]"
            >
              <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
          </header>

          <div className="min-h-0 overflow-auto">
            <div className="p-5 pb-4">
              <h1 className="m-0 text-[22px] leading-[1.2] font-semibold text-[#172b44] dark:text-night-ink">{content.title}</h1>
              <p className="m-0 mt-2.5 text-[15px] leading-[1.58] text-[#3a506b] dark:text-[#b2b2b6]">{content.description}</p>
              {content.example && (
                <div className="mt-4">
                  <CodeSnippet code={content.example} />
                </div>
              )}
            </div>
            <section aria-labelledby="code-task-title" className="border-t border-[#e1e1e1] px-5 py-4 dark:border-[#353535]">
              <h2 id="code-task-title" className="m-0 mb-3 text-xs font-bold tracking-[0.1em] text-[#718198] uppercase dark:text-night-soft">
                Your tasks
              </h2>
              <TaskList tasks={content.tasks} result={exercise.result} />
            </section>
          </div>

          {/* Devy lives at the foot of the exercise pane: beside the task,
              reacting to each run, with hints a tap away. */}
          <div className="border-t border-[#e1e1e1] bg-canvas dark:border-[#353535] dark:bg-[#1c1c1c]">{coach}</div>
        </aside>
      )}

      <div
        role="separator"
        tabIndex={collapsed ? -1 : 0}
        aria-label="Resize exercise pane"
        aria-controls="editor-exercise-pane"
        aria-orientation="vertical"
        aria-valuemin={WIDTH_RANGE[0]}
        aria-valuemax={WIDTH_RANGE[1]}
        aria-valuenow={exerciseWidth}
        className={`relative hidden touch-none outline-none select-none before:absolute before:inset-y-2 before:left-1/2 before:w-[3px] before:-translate-x-1/2 before:rounded-full before:bg-transparent hover:before:bg-[#6699ec] focus-visible:before:bg-[#6699ec] min-[900px]:block ${collapsed ? "pointer-events-none" : "cursor-col-resize"}`}
        onPointerDown={(event) => !collapsed && dragResize(event, "x")}
        onKeyDown={(event) => keyResize(event, "x")}
      />

      <div ref={editorArea} className="grid min-h-0 min-w-0 grid-rows-[minmax(360px,auto)_auto] gap-2 min-[900px]:grid-rows-[minmax(0,var(--editor-height))_8px_minmax(120px,1fr)] min-[900px]:gap-0">
        <section id="editor-code-pane" className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden rounded-lg border border-[#2a2a2e] bg-[#1e1e1e]">
          <header className="flex min-h-10 items-stretch border-b border-white/[0.07] bg-[#252526]">
            <FileTab filename={content.filename} />
            <span className="ml-auto flex items-center px-4 text-xs font-semibold text-[#9a9aa0]">Python</span>
          </header>
          <CodeSurface code={currentCode} onChange={exercise.edit} onRun={exercise.run} disabled={completed} errorLine={exercise.result?.error?.line} />
          <div className="flex flex-wrap items-center gap-2 border-t border-white/[0.07] bg-[#252526] px-4 py-2.5">
            <ResetButton onClick={exercise.reset} disabled={completed} />
            <RunButton onClick={exercise.run} />
            <div className="ml-auto flex items-center gap-3">
              {exercise.result && !completed && (
                <span className="text-xs font-semibold text-[#a9a9ad]">
                  {exercise.result.tasks.filter((task) => task.done).length}/{exercise.result.tasks.length} tasks
                </span>
              )}
              {completed && <ContinueButton onClick={onContinue} label={content.continueLabel ?? "Continue lesson"} />}
            </div>
          </div>
        </section>

        <div
          role="separator"
          tabIndex={0}
          aria-label="Resize output console"
          aria-controls="editor-code-pane editor-output-pane"
          aria-orientation="horizontal"
          aria-valuemin={HEIGHT_RANGE[0]}
          aria-valuemax={HEIGHT_RANGE[1]}
          aria-valuenow={editorHeight}
          className="relative hidden cursor-row-resize touch-none outline-none select-none before:absolute before:inset-x-2 before:top-1/2 before:h-[3px] before:-translate-y-1/2 before:rounded-full before:bg-transparent hover:before:bg-[#6699ec] focus-visible:before:bg-[#6699ec] min-[900px]:block"
          onPointerDown={(event) => dragResize(event, "y")}
          onKeyDown={(event) => keyResize(event, "y")}
        />

        <section
          id="editor-output-pane"
          className={`grid min-h-[140px] grid-rows-[auto_minmax(0,1fr)] overflow-hidden rounded-lg border border-[#2a2a2e] bg-[#181818] ${collapsed ? "min-[900px]:grid-cols-[minmax(0,1fr)_minmax(300px,380px)]" : ""}`}
        >
          <header className="flex min-h-10 items-center border-b border-white/[0.07] bg-[#252526] px-4 min-[900px]:col-start-1">
            <span className="text-[13px] font-semibold text-[#e8e8e8]">Output</span>
            {exercise.result?.error && (
              <span className="ml-3 rounded bg-[#ff5c5c]/15 px-1.5 py-0.5 text-[11px] font-bold text-[#ff8a8a]">
                {exercise.result.error.type === "NotSupported" ? "Not supported" : exercise.result.error.type}
              </span>
            )}
            {exercise.result?.passed && <span className="ml-3 rounded bg-[#22c55e]/15 px-1.5 py-0.5 text-[11px] font-bold text-[#6ee7a8]">All tasks passed</span>}
          </header>
          <pre className="m-0 min-h-0 overflow-auto px-4 py-3 font-mono text-[13.5px] leading-[1.6] whitespace-pre-wrap text-[#d4d4d4] min-[900px]:col-start-1" aria-live="polite" aria-atomic="true">
            <ConsoleOutput result={exercise.result} />
          </pre>
          {/* With the exercise pane tucked away, Devy moves in beside the
              console so he is still right there after every run. */}
          {collapsed && (
            <div className="hidden min-h-0 overflow-auto border-l border-white/[0.07] bg-canvas p-3 min-[900px]:col-start-2 min-[900px]:row-span-2 min-[900px]:row-start-1 min-[900px]:block dark:bg-transparent">
              <DevyCoach devy={exercise.devy} onHint={exercise.nextHint} hintLabel={exercise.hintLabel} hasMoreHints={exercise.hasMoreHints} completed={completed} compact />
            </div>
          )}
        </section>
      </div>
    </section>
  );
}
