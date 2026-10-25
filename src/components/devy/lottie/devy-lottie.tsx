"use client";

import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { assetUrl } from "~/config/assets";
import { usePrefersReducedMotion } from "~/hooks/use-prefers-reduced-motion";
import { LOTTIE_CLIPS, type LottieClipName } from "./lottie-clips";

type DevyLottieProps = {
  clip: LottieClipName;
  loop?: boolean;
  flip?: boolean;
  // Freeze once the clip has fully arrived instead of looping back to
  // invisible. "side-pop-out" keeps climbing to ~65% of its timeline, so ~70%
  // is where it is fully visible.
  holdAtPeak?: boolean;
  speed?: number;
  className?: string;
  ariaLabel?: string;
};

const PEAK_RATIO = 0.7;

export function DevyLottie({
  clip,
  loop = true,
  flip = false,
  holdAtPeak = false,
  speed = 1,
  className = "",
  ariaLabel,
}: DevyLottieProps) {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <div
      className={`relative ${flip ? "-scale-x-100" : ""} ${className}`}
      role={ariaLabel ? "img" : undefined}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : true}
    >
      {/* Reduced-motion viewers get the first frame only. */}
      <DotLottieReact
        src={assetUrl(LOTTIE_CLIPS[clip])}
        loop={loop && !reducedMotion}
        autoplay={!reducedMotion}
        speed={speed}
        className="relative h-full w-full"
        layout={{ fit: "contain", align: [0.5, 0.5] }}
        renderConfig={{ devicePixelRatio: Math.max(window.devicePixelRatio || 1, 2) }}
        dotLottieRefCallback={(instance) => {
          if (!instance || !holdAtPeak) return;
          const onFrame = (event: { currentFrame: number }) => {
            if (
              instance.totalFrames > 0 &&
              event.currentFrame >= instance.totalFrames * PEAK_RATIO
            ) {
              instance.pause();
              instance.removeEventListener("frame", onFrame);
            }
          };
          instance.addEventListener("frame", onFrame);
        }}
      />
    </div>
  );
}
