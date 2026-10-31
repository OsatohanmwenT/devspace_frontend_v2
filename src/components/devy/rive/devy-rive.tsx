"use client";

import { useRive } from "@rive-app/react-webgl2";
import { useEffect, useEffectEvent, useRef } from "react";
import { assetUrl } from "~/config/assets";
import { usePrefersReducedMotion } from "~/hooks/use-prefers-reduced-motion";
import { RIVE_CLIPS, type RiveClip, type RiveClipName } from "./rive-clips";

type DevyRiveProps = {
  clip: RiveClipName;
  className?: string;
  ariaLabel?: string;
  // Fires once the clip is actually playing (or, under reduced motion, once it
  // is scrubbed to its resting frame) — not on mount. The .riv loads async
  // (fetch + WASM), so timing a follow-up beat off mount can advance before
  // Devy ever appears on a cold cache.
  onReady?: () => void;
  // "complete-flow" only: true takes off, false lands again.
  flying?: boolean;
  // "complete-flow" only: the names of the state machine's active states each
  // time they change (e.g. "tower_launch" on the pad, "particles" in the air).
  onStateChange?: (states: string[]) => void;
};

const SHARP_PIXEL_RATIO = 3;

export function DevyRive({
  clip,
  className = "",
  ariaLabel,
  onReady,
  flying = false,
  onStateChange,
}: DevyRiveProps) {
  const reducedMotion = usePrefersReducedMotion();
  const config: RiveClip = RIVE_CLIPS[clip];
  const isStateMachine = config.kind === "state-machine";
  const isSharp = isStateMachine && Boolean(config.sharp);
  const isAutoBound = isStateMachine && Boolean(config.autoBind);
  const timeline = isStateMachine ? undefined : config.timeline;
  const startAt = isStateMachine ? 0 : (config.startAt ?? 0);
  const restAt = isStateMachine ? undefined : config.restAt;

  const reportReady = useEffectEvent(() => onReady?.());

  // Rive keeps the callbacks it was created with, so it reads the latest one
  // through a ref.
  const stateListener = useRef(onStateChange);
  useEffect(() => {
    stateListener.current = onStateChange;
  });

  const { rive, RiveComponent } = useRive(
    {
      src: assetUrl(config.src),
      stateMachine: isStateMachine ? "State Machine 1" : undefined,
      animations: timeline,
      autoplay: false,
      autoBind: isAutoBound,
      onStateChange: (event) => stateListener.current?.(Array.isArray(event.data) ? event.data.map(String) : []),
    },
    { customDevicePixelRatio: isSharp ? SHARP_PIXEL_RATIO : undefined },
  );

  useEffect(() => {
    if (!rive || !isAutoBound) return;
    const property = rive.viewModelInstance?.boolean("flying");
    if (property) property.value = flying;
  }, [rive, isAutoBound, flying]);

  useEffect(() => {
    if (!rive || !isSharp) return;
    // Rive resets the canvas size once during load, so apply the sharper size afterward.
    const timer = setTimeout(
      () => rive.resizeDrawingSurfaceToCanvas(SHARP_PIXEL_RATIO),
      100,
    );
    return () => clearTimeout(timer);
  }, [rive, isSharp]);

  useEffect(() => {
    if (!rive) return;
    if (!timeline) {
      if (!reducedMotion) rive.play();
    } else if (reducedMotion) {
      if (restAt !== undefined) rive.scrub(timeline, restAt);
    } else {
      if (startAt) rive.scrub(timeline, startAt);
      rive.play(timeline);
    }
    reportReady();
  }, [rive, timeline, startAt, restAt, reducedMotion]);

  return (
    <div
      className={`relative ${className}`}
      role={ariaLabel ? "img" : undefined}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : true}
    >
      <RiveComponent className="relative h-full w-full" />
    </div>
  );
}
