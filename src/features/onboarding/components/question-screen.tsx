"use client";

import { useRef, type ReactNode } from "react";
import type { LottieClipName } from "~/components/devy";
import { useBuildIn } from "../hooks/use-build-in";
import { StepHeading } from "./step-heading";

type QuestionScreenProps = {
  stepId: string;
  title: string;
  subtitle?: string;
  devyClip?: LottieClipName;
  children: ReactNode;
};

// Every question screen: the heading pops in as one unit, then the options
// arrive with a light stagger, the one place order earns a cascade. The two
// runs are scoped to their own wrapper so they don't overlap.
export function QuestionScreen({ stepId, title, subtitle, devyClip, children }: QuestionScreenProps) {
  const headingRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);
  useBuildIn(headingRef, stepId);
  useBuildIn(optionsRef, stepId, { mode: "cascade", delay: 0.12 });

  return (
    <div className="grid w-full justify-items-center gap-6">
      <div ref={headingRef} className="grid w-full justify-items-center">
        <StepHeading title={title} subtitle={subtitle} devyClip={devyClip} />
      </div>
      <div ref={optionsRef} className="grid w-full justify-items-center">
        {children}
      </div>
    </div>
  );
}
