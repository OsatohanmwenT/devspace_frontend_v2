"use client";

import { useRef } from "react";
import { DevyLottie } from "~/components/devy";
import { Button } from "~/components/ui/button";
import { useBuildIn } from "../hooks/use-build-in";

// The one genuinely celebratory moment in the flow, so it gets the bigger
// bounce: Devy, title, copy and button arrive together as one springy block.
export function WelcomeScreen({ onStart }: { onStart: () => void }) {
  const rootRef = useRef<HTMLDivElement>(null);
  useBuildIn(rootRef, "welcome", { mode: "bounce" });

  return (
    <div ref={rootRef} className="grid justify-items-center gap-5 text-center">
      <span data-build data-build-order="0">
        <DevyLottie clip="wave" ariaLabel="Devy" className="h-40 w-40" />
      </span>
      <h1
        data-build
        data-build-order="1"
        className="m-0 max-w-[22ch] font-display text-[clamp(30px,4vw,40px)] leading-[1.15] font-medium"
      >
        Let’s set up your learning
      </h1>
      <p data-build data-build-order="2" className="text-muted m-0 max-w-[48ch] text-base leading-relaxed">
        A few quick questions so Devspace knows what you want, where to start, and what examples
        will feel relevant.
      </p>
      <span data-build data-build-order="3" className="w-[min(100%,520px)] max-w-[46ch]">
        <Button className="mt-3 min-h-[52px] w-full text-[15px]" onClick={onStart}>
          Let’s go
        </Button>
      </span>
    </div>
  );
}
