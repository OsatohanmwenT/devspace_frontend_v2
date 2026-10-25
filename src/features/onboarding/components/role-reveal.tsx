"use client";

import { useRef } from "react";
import { useBuildIn } from "../hooks/use-build-in";
import { CASCADE } from "../lib/motion-presets";
import type { Option } from "../types";
import { StageCards } from "./stage-cards";
import { WordReveal } from "./word-reveal";

// The role reveal: "{role} it is." over a row of illustrated stage cards, so
// the choice is backed by what the route actually teaches. The carousel already
// scans itself into place, so the heading just materialises (scale, no travel)
// rather than adding a second directional motion to watch.
export function RoleReveal({ role, stages }: { role: string; stages: Option[] }) {
  const rootRef = useRef<HTMLDivElement>(null);
  useBuildIn(rootRef, role, { mode: "scale" });

  return (
    <div ref={rootRef} className="grid w-full max-w-[620px] justify-items-center gap-6 text-center">
      <div className="grid justify-items-center gap-2">
        <p data-build data-build-order="0" className="m-0 text-sm font-medium text-blue-600 dark:text-blue-400">
          Your learning path
        </p>
        <h1 className="m-0 font-display text-[clamp(26px,3.4vw,34px)] font-medium">
          <WordReveal text={`${role} it is.`} delay={CASCADE.stagger} />
        </h1>
        <p
          data-build
          data-build-order="2"
          className="text-muted m-0 max-w-[48ch] text-[15px] leading-normal"
        >
          Here’s a quick view of the skills you’ll build, step by step.
        </p>
      </div>
      <StageCards stages={stages} label={`${role} learning path`} />
    </div>
  );
}
