import type { CodeEditorContent, ExerciseTask } from "~/types/lesson";
import { runPython, type RunError } from "./mini-python";

// Runs a code-editor exercise and works out what Devy should say about it.
//
// Each task in the lesson data declares its own check:
//   { pattern: '<regex over the code>' }  the code has to contain this
//   { output: '2080' }                     the printed output has to match
// plus an optional `nudge`, which is what Devy says while that task is the
// first one still unmet. The exercise passes when the program runs cleanly and
// every task's check holds.

const taskDone = (task: ExerciseTask, code: string, output: string) => {
  const { pattern, output: expected } = task.check;
  if (pattern && !new RegExp(pattern, "m").test(code)) return false;
  if (expected != null && output.trim() !== String(expected).trim()) return false;
  return true;
};

// Classic edit distance, for "did you mean…?" on a misspelt name.
function distance(a: string, b: string) {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i += 1) {
    let previous = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const current = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, previous + (a[i - 1] === b[j - 1] ? 0 : 1));
      previous = current;
    }
  }
  return row[b.length];
}

function closestName(name: string, candidates: string[]) {
  let best: { candidate: string; d: number } | null = null;
  for (const candidate of candidates) {
    const d = distance(name.toLowerCase(), candidate.toLowerCase());
    if (d <= Math.max(2, Math.floor(name.length / 3)) && (!best || d < best.d)) best = { candidate, d };
  }
  return best?.candidate ?? null;
}

// Every name the code creates with `name =`, even on lines that never ran.
const assignedNames = (code: string) => [...code.matchAll(/^\s*([A-Za-z_]\w*)\s*[-+*/%]?=(?!=)/gm)].map((match) => match[1]);

// Devy's plain-English take on a Python error: what went wrong, on which line,
// and the smallest thing to try. Never a lecture on the traceback.
export function explainError(error: RunError, code: string) {
  const at = `Line ${error.line}`;
  switch (error.type) {
    case "NameError": {
      const name = error.name ?? "";
      const suggestion = closestName(name, [...new Set(assignedNames(code))].filter((candidate) => candidate !== name));
      return suggestion
        ? `${at} uses \`${name}\`, but nothing by that name exists yet. Did you mean \`${suggestion}\`?`
        : `${at} uses \`${name}\` before it's been created. Give it a value with \`${name} = …\` first, or check the spelling.`;
    }
    case "TypeError":
      if (/concatenate str/.test(error.message)) {
        return `${at} joins text and a number with \`+\`. Python won't mix them: wrap the number in \`str()\`, or use an f-string like \`f"Total: {total}"\`.`;
      }
      return `${at} mixes types Python can't combine (${error.message}). Check what each side of the operator holds.`;
    case "ZeroDivisionError":
      return `${at} divides by zero, which Python can't do. Check the number after the \`/\`.`;
    case "IndentationError":
      return `${at} starts with spaces. Everything in this exercise sits at the left edge, so delete the space at the start of the line.`;
    case "SyntaxError":
      if (/never closed/.test(error.message)) return `${at} opens a bracket that never closes. Add the matching \`)\`.`;
      if (/unterminated string/.test(error.message)) return `${at} starts some text with a quote but never closes it. Add the matching quote.`;
      if (/forgot a comma/.test(error.message)) return `${at} has two values side by side. It looks like a comma is missing between them.`;
      if (/'=='/.test(error.message)) return `${at} has an \`=\` where Python didn't expect one. Assignments go \`name = value\`, with the name on the left.`;
      return `Python couldn't read ${at.toLowerCase()}. Look for a missing bracket, quote or operator.`;
    case "NotSupported":
      return `${at}: ${error.message}. You won't need it for this one; the basics will do.`;
    default:
      return `${at}: ${error.type}: ${error.message}`;
  }
}

export type Coach = { mood: "error"; line: number; text: string } | { mood: "success" | "nudge"; text: string };

export type ExerciseResult = {
  output: string;
  error: RunError | null;
  tasks: { id: string; title: string; description: string; done: boolean }[];
  passed: boolean;
  coach: Coach;
};

export function evaluateExercise(content: CodeEditorContent, code: string): ExerciseResult {
  const run = runPython(code);
  const tasks = content.tasks.map((task, index) => ({
    id: `task-${index}`,
    title: task.title,
    description: task.description,
    done: !run.error && taskDone(task, code, run.output),
  }));
  const passed = !run.error && tasks.every((task) => task.done);

  let coach: Coach;
  if (run.error) {
    coach = { mood: "error", line: run.error.line, text: explainError(run.error, code) };
  } else if (passed) {
    coach = { mood: "success", text: "That’s it — it runs and every task checks out. Nice work." };
  } else {
    const openIndex = tasks.findIndex((task) => !task.done);
    const firstOpen = content.tasks[openIndex];
    const printedNothing = run.output.trim() === "";
    coach = {
      mood: "nudge",
      text: firstOpen?.nudge ?? (printedNothing ? "It ran, but nothing was printed. Use `print()` to show the result." : `Close — “${firstOpen?.title}” isn’t done yet.`),
    };
  }

  return { output: run.output, error: run.error, tasks, passed, coach };
}
