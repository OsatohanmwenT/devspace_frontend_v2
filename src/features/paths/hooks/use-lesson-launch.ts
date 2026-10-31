"use client";

import { useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useToast } from "~/providers/toast-provider";
import { startPath } from "../api/paths-api";

// Devy's trip from the roadmap to the lesson, in order:
// - liftoff: the rig crouches on the launchpad and takes off in place.
// - away: Devy streaks off the top of the screen while the lesson scene rises.
// - arrived: Devy has flown into the scene and hovers there before it opens.
export type LaunchPhase = "liftoff" | "away" | "arrived";

export type LaunchBox = { left: number; top: number; width: number; height: number };

export type LaunchFlight = {
  phase: LaunchPhase;
  // Where Devy's canvas sat on the roadmap, in viewport coordinates.
  box: LaunchBox;
  // The rig reports it has left the pad.
  onAirborne: () => void;
  // The flight into the lesson scene has finished.
  onArrived: () => void;
};

// The rig's own take-off starts the flight: it reports "airborne" as Devy
// leaves the pad, but the pad is part of the same canvas and takes about this
// long to fall out of frame. Leaving any sooner would carry it along.
// If the rig never reports in (a renamed state, a slow device), leave anyway
// so the learner is not stuck.
const CLEAR_OF_PAD_MS = 900;
const AIRBORNE_FALLBACK_MS = 4000;
const ARRIVED_HOLD_MS = 500;

// Starting a lesson is the one way to choose a path: if it is not the active
// path it becomes it, and a toast offers an Undo in case the learner was only
// trying it out.
export function useLessonLaunch(pathId: string, pathTitle: string, initialActivePathId: string, currentLessonId: string | null) {
  const toast = useToast();
  const reducedMotion = useReducedMotion();
  const [activePathId, setActivePathId] = useState(initialActivePathId);
  const [startedIds, setStartedIds] = useState<string[]>([]);
  const [flightState, setFlightState] = useState<{ phase: LaunchPhase; box: LaunchBox } | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const launching = useRef(false);
  const airborne = useRef(false);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const open = () => {
    // The lesson screen arrives with the lessons phase.
    window.clearTimeout(timer.current);
    toast("Lessons are coming soon");
    setFlightState(null);
    launching.current = false;
    airborne.current = false;
  };

  const advance = (from: LaunchPhase, to: LaunchPhase) =>
    setFlightState((state) => (state?.phase === from ? { ...state, phase: to } : state));

  const leave = () => advance("liftoff", "away");

  const onAirborne = () => {
    if (airborne.current) return;
    airborne.current = true;
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(leave, CLEAR_OF_PAD_MS);
  };

  const onArrived = () => {
    advance("away", "arrived");
    timer.current = window.setTimeout(open, ARRIVED_HOLD_MS);
  };

  const start = async (lessonId: string) => {
    if (launching.current) return;
    launching.current = true;
    setStartedIds((ids) => (ids.includes(lessonId) ? ids : [...ids, lessonId]));

    if (pathId !== activePathId) {
      const previous = await startPath(pathId);
      setActivePathId(pathId);
      toast(
        `Now learning ${pathTitle}`,
        previous
          ? {
              label: "Undo",
              onClick: () => {
                startPath(previous);
                setActivePathId(previous);
              },
            }
          : undefined,
      );
    }

    const tile = document.querySelector("[data-current-lesson]")?.getBoundingClientRect();
    const mascot = document.querySelector("[data-devy-flyer]")?.getBoundingClientRect();
    const onScreen = tile && tile.bottom > 0 && tile.top < window.innerHeight;
    if (reducedMotion || !onScreen || !mascot || lessonId !== currentLessonId) return open();

    setFlightState({ phase: "liftoff", box: { left: mascot.left, top: mascot.top, width: mascot.width, height: mascot.height } });
    timer.current = window.setTimeout(leave, AIRBORNE_FALLBACK_MS);
  };

  const flight: LaunchFlight | null = flightState && { ...flightState, onAirborne, onArrived };

  return { activePathId, startedIds, flight, start };
}
