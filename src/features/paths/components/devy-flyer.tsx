"use client";

import { useAnimate } from "motion/react";
import { useEffect, useEffectEvent, type ReactNode } from "react";
import type { LaunchFlight } from "../hooks/use-lesson-launch";

// Devy is a Rive canvas that only draws inside its own box, so the flight is
// the box itself crossing the screen: straight up off the roadmap, accelerating
// and leaning into the climb. Once he is out of view the lesson opens, and its
// loading screen brings him back down into the scene.
const EXIT_S = 0.85;
const OFFSCREEN_MARGIN = 140;
const CLIMB_SCALE = 1.4;
const LEAN_DEG = 9;
const DRIFT_PX = 34;

// Slow off the pad, then faster and faster.
const ACCELERATE = [0.55, 0, 0.9, 0.45] as const;

type DevyFlyerProps = {
  flight: LaunchFlight | null;
  children: ReactNode;
};

export function DevyFlyer({ flight, children }: DevyFlyerProps) {
  const [scope, animate] = useAnimate<HTMLSpanElement>();
  const phase = flight?.phase;
  const box = flight?.box;
  const grounded = flight === null;

  const gone = useEffectEvent(() => flight?.onGone());

  useEffect(() => {
    if (phase !== "away" || !box || !scope.current) return;
    const el = scope.current;
    let cancelled = false;

    const fly = async () => {
      // Offsets are from where the canvas sits on the roadmap.
      const aboveY = -(box.top + box.height + OFFSCREEN_MARGIN);
      await animate(el, { x: DRIFT_PX, y: aboveY, rotate: LEAN_DEG, scale: CLIMB_SCALE }, { duration: EXIT_S, ease: ACCELERATE });
      if (!cancelled) gone();
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
        // Above the launch scene (z-100), the sticky headers and the lesson bar.
        className={flight ? "fixed z-[101] block" : "absolute inset-0 block"}
        style={flight ? { left: flight.box.left, top: flight.box.top, width: flight.box.width, height: flight.box.height } : undefined}
      >
        {children}
      </span>
    </span>
  );
}
