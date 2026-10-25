"use client";

import { useRef } from "react";
import { Button } from "~/components/ui/button";
import { useBuildIn } from "../hooks/use-build-in";
import { useCountUp } from "../hooks/use-count-up";
import type { StageGroup } from "../types";

type AssessmentResultProps = {
  score: number;
  total: number;
  group: StageGroup;
  onUse: () => void;
  onRetry: () => void;
};

// A result card: it materialises in place rather than rising in, so it reads
// as "here's what you got" settling into view, not arriving from off-page.
export function AssessmentResult({ score, total, group, onUse, onRetry }: AssessmentResultProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const shownScore = useCountUp(score);
  useBuildIn(rootRef, group.id, { mode: "scale" });

  return (
    <div
      ref={rootRef}
      className="grid w-full max-w-130 justify-items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-6 text-center dark:border-neutral-700 dark:bg-neutral-900"
    >
      <p data-build data-build-order="0" className="text-muted m-0 text-sm">
        You got <span className="font-semibold text-ink dark:text-night-ink">{shownScore}</span> of{" "}
        {total} correct.
      </p>
      <div data-build data-build-order="1">
        <p className="m-0 text-[11px] font-semibold tracking-[0.08em] text-blue-600 uppercase dark:text-blue-400">
          Recommended start
        </p>
        <strong className="mt-1 block text-xl font-medium">{group.label}</strong>
        <p className="text-muted m-0 mt-1 text-sm">
          {group.stages.map((stage) => stage.label).join(" · ")}
        </p>
      </div>
      <span data-build data-build-order="2" className="w-full">
        <Button className="min-h-13 w-full text-[15px]" onClick={onUse}>
          Use this starting point
        </Button>
      </span>
      <button
        data-build
        data-build-order="3"
        type="button"
        className="focus-ring rounded text-sm font-medium text-blue-600 underline underline-offset-4 hover:opacity-80 dark:text-blue-400"
        onClick={onRetry}
      >
        Take the assessment again
      </button>
    </div>
  );
}
