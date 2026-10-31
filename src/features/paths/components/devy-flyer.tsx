"use client";

import { useAnimate } from "motion/react";
import { useEffect, useEffectEvent, type ReactNode } from "react";
import type { LaunchFlight } from "../hooks/use-lesson-launch";

// Devy is a Rive canvas that only draws inside its own box, so the flight is
// the box itself crossing the screen. It leaves the roadmap straight up,
// accelerating and leaning into the climb, then comes back in from the bottom
// edge and slows to a hover in the middle of the lesson scene. Nothing cuts
// between the two: he never stops flying.
const EXIT_S = 0.85;
const ENTER_S = 1.05;
const OFFSCREEN_MARGIN = 140;
const CLIMB_SCALE = 1.4;
const HOVER_SCALE = 1.25;
const LEAN_DEG = 9;
const DRIFT_PX = 34;

// Slow off the pad, then faster and faster.
const ACCELERATE = [0.55, 0, 0.9, 0.45] as const;
// Fast into frame, then settling.
const DECELERATE = [0.12, 0.8, 0.25, 1] as const;

type DevyFlyerProps = {
  flight: LaunchFlight | null;
  children: ReactNode;
};

export function DevyFlyer({ flight, children }: DevyFlyerProps) {
  const [scope, animate] = useAnimate<HTMLSpanElement>();
  const phase = flight?.phase;
  const box = flight?.box;
  const grounded = flight === null;

  const arrived = useEffectEvent(() => flight?.onArrived());

  useEffect(() => {
    if (phase !== "away" || !box || !scope.current) return;
    const el = scope.current;
    let cancelled = false;

    // Offsets are from where the canvas sits on the roadmap.
    const centreX = window.innerWidth / 2 - (box.left + box.width / 2);
    const centreY = window.innerHeight / 2 - (box.top + box.height / 2);
    const aboveY = -(box.top + box.height + OFFSCREEN_MARGIN);
    const belowY = window.innerHeight - box.top + OFFSCREEN_MARGIN;

    const fly = async () => {
      await animate(el, { x: DRIFT_PX, y: aboveY, rotate: LEAN_DEG, scale: CLIMB_SCALE }, { duration: EXIT_S, ease: ACCELERATE });
      if (cancelled) return;
      await animate(el, { x: centreX - DRIFT_PX, y: belowY, rotate: LEAN_DEG, scale: CLIMB_SCALE }, { duration: 0 });
      await animate(el, { x: centreX, y: centreY, rotate: 0, scale: HOVER_SCALE }, { duration: ENTER_S, ease: DECELERATE });
      if (!cancelled) arrived();
    };
    fly();

    return () => {
      cancelled = true;
    };
  }, [phase, box, animate, scope]);

  // Back on the roadmap Devy is home again, ready to land on the pad.
  useEffect(() => {
    if (grounded && scope.current) animate(scope.current, { x: 0, y: 0, rotate: 0, scale: 1 }, { duration: 0 });
  }, [grounded, animate, scope]);

  return (
    // The outer box holds the tile's space while the canvas lifts out of the layout.
    <span data-devy-flyer className="relative block h-[210px] w-[200px]">
      <span
        ref={scope}
        className={flight ? "fixed block" : "absolute inset-0 block"}
        style={flight ? { left: flight.box.left, top: flight.box.top, width: flight.box.width, height: flight.box.height } : undefined}
      >
        {children}
      </span>
    </span>
  );
}
