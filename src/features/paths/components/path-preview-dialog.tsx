"use client";

import { useEffect } from "react";
import { Button } from "~/components/ui/button";
import { assetUrl } from "~/config/assets";
import type { ExplorePath } from "../api/paths-api";
import { pathKindLabel } from "./explore-path-card";

const CHIP = "rounded-full bg-[#f1efe9] px-2.5 py-1 text-[11px] text-[#525252] dark:bg-[#363636] dark:text-[#d4d4d4]";

type PathPreviewDialogProps = {
  path: ExplorePath;
  isActive: boolean;
  onClose: () => void;
  onStart: () => void;
};

// A dialog rather than a page: a confirm-before-committing step over the
// explore grid, so it keeps the grid's scroll position. It answers "what am I
// getting into" with the skill ladder the path would walk.
export function PathPreviewDialog({ path, isActive, onClose, onStart }: PathPreviewDialogProps) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-40 grid place-items-center overflow-y-auto bg-black/65 p-5 backdrop-blur-sm" role="presentation" onMouseDown={onClose}>
      <article
        className="relative grid max-h-[88vh] w-full max-w-[600px] overflow-y-auto rounded-3xl border border-[#e0e0dc] bg-white shadow-[0_24px_60px_rgba(0,0,0,.45)] dark:border-night-line dark:bg-night-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="path-preview-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          data-cuelume-toggle
          onClick={onClose}
          aria-label="Close"
          className="focus-ring absolute top-3 right-3 z-1 grid size-9 place-items-center rounded-full bg-white/80 text-neutral-800 hover:bg-white dark:bg-black/40 dark:text-white dark:hover:bg-black/60"
        >
          ×
        </button>
        <div className="grid min-h-36 place-items-center bg-[#f5f5f4] dark:bg-[#303030]">
          {/* eslint-disable-next-line @next/next/no-img-element -- local learning-path art */}
          <img className="h-24 w-[min(50%,150px)] object-contain" src={assetUrl(path.image)} alt="" />
        </div>
        <div className="grid gap-4 p-[clamp(22px,4vw,36px)]">
          <div className="grid gap-1.5">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[11px] font-bold tracking-[.08em] text-[#4169e1] uppercase">{pathKindLabel(path)}</span>
              {isActive && (
                <span className="rounded-full bg-[#168a46]/20 px-2.5 py-0.5 text-[11px] font-semibold text-[#168a46] dark:text-[#6ee7a8]">Active mission</span>
              )}
            </div>
            <h2 id="path-preview-title" className="text-[clamp(24px,3.2vw,32px)] leading-[1.15] font-semibold text-neutral-800 dark:text-night-ink">
              {path.title}
            </h2>
            <p className="text-[15px] leading-[1.55] text-ink-soft dark:text-night-soft">{path.reason}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className={`${CHIP} font-medium`}>{path.meta}</span>
            {path.tools.map((tool) => (
              <span key={tool} className={CHIP}>
                {tool}
              </span>
            ))}
          </div>

          {path.learningSteps && (
            <div className="grid gap-2.5 border-t border-[#eeeeeb] pt-4 dark:border-night-line">
              <h3 className="text-[11px] font-bold tracking-[.08em] text-[#737371] uppercase dark:text-[#7d7d80]">What you&apos;ll learn</h3>
              <ol className="m-0 grid list-none gap-2 p-0">
                {path.learningSteps.map((step, index) => (
                  <li key={step} className="flex items-center gap-2.5 text-sm text-neutral-800 dark:text-night-ink">
                    <span className="grid size-6 flex-none place-items-center rounded-full border border-[#d4d4d4] bg-[#f5f5f4] text-[11px] font-bold text-ink-soft dark:border-night-line dark:bg-[#262626] dark:text-night-soft">
                      {index + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 border-t border-[#eeeeeb] pt-4 dark:border-night-line">
            {isActive ? (
              <span className="text-sm font-medium text-[#168a46] dark:text-[#6ee7a8]">✓ This is your active mission path</span>
            ) : (
              <Button className="min-h-11 px-6 text-sm font-semibold" onClick={onStart} autoFocus>
                Start learning →
              </Button>
            )}
          </div>
        </div>
      </article>
    </div>
  );
}
