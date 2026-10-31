"use client";

import { useEffect, useRef, useState } from "react";
import type { CodeEditorContent } from "~/types/lesson";
import { evaluateExercise, type Coach, type ExerciseResult } from "../lib/code-exercise";

// Devy only offers help once per exercise, after a real stretch of nothing
// happening: never the moment someone pauses to think.
const IDLE_NUDGE_MS = 40000;

export type DevyMood = Coach["mood"] | "greet" | "idle" | "hint";
export type DevyNote = { mood: DevyMood; text: string; code?: string | null };

type Options = {
  content: CodeEditorContent;
  code: string;
  completed: boolean;
  onCodeChange: (code: string) => void;
  onComplete: () => void;
};

// The exercise's state: what has been run, what Devy is saying and how many
// hints have been given. Shared by both layouts so they behave identically.
export function useCodeExercise({ content, code, completed, onCodeChange, onComplete }: Options) {
  const { hints } = content;
  const [result, setResult] = useState<ExerciseResult | null>(null);
  const [hintsShown, setHintsShown] = useState(0);
  const [devy, setDevy] = useState<DevyNote>(() => ({
    mood: completed ? "success" : "greet",
    text: completed ? "You’ve already cracked this one — run it again any time, or carry on." : (content.devyIntro ?? `I’m right here. ${content.description}`),
  }));
  const idleTimer = useRef<number | undefined>(undefined);
  const nudged = useRef(false);

  const armIdleNudge = () => {
    window.clearTimeout(idleTimer.current);
    if (completed || nudged.current || hints.length === 0) return;
    idleTimer.current = window.setTimeout(() => {
      nudged.current = true;
      setDevy({ mood: "idle", text: "Stuck? That’s normal. Ask me for a hint and I’ll point you the right way — without giving it all away." });
    }, IDLE_NUDGE_MS);
  };

  useEffect(() => {
    armIdleNudge();
    return () => window.clearTimeout(idleTimer.current);
    // Re-armed by every action below; only completing the exercise changes the arming rule.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completed]);

  const run = () => {
    const next = evaluateExercise(content, code);
    setResult(next);
    setDevy(next.coach);
    if (next.passed && !completed) onComplete();
    armIdleNudge();
  };

  const edit = (nextCode: string) => {
    onCodeChange(nextCode);
    armIdleNudge();
  };

  const reset = () => {
    onCodeChange(content.starterCode);
    setResult(null);
    setDevy({ mood: "greet", text: "Fresh start. Take it one line at a time." });
    armIdleNudge();
  };

  // Hints climb from a nudge to the full answer, one per tap.
  const nextHint = () => {
    if (hintsShown >= hints.length) return;
    const isAnswer = hintsShown === hints.length - 1 && hints.length > 1;
    setHintsShown(hintsShown + 1);
    setDevy({
      mood: "hint",
      text: isAnswer ? "Here’s one way to write it — type it in yourself so it sticks:" : hints[hintsShown],
      code: isAnswer ? hints[hintsShown] : null,
    });
    armIdleNudge();
  };

  const hintLabel = hintsShown === 0 ? "Give me a hint" : hintsShown === hints.length - 1 && hints.length > 1 ? "Show me the answer" : "Another hint";

  return { result, devy, run, edit, reset, nextHint, hintLabel, hasMoreHints: hintsShown < hints.length };
}

export type CodeExercise = ReturnType<typeof useCodeExercise>;
