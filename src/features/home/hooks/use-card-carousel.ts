"use client";

import {
  animate,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
  type PanInfo,
} from "motion/react";
import { useCallback, useEffect, useRef } from "react";
import {
  layoutCard,
  mod,
  SPREAD_RATIO,
  SWIPE_DISTANCE,
  SWIPE_VELOCITY,
  wrapOffset,
} from "../lib/carousel-layout";

type Options = {
  count: number;
  activeIndex: number;
  // Reports the card that came to the front after a swipe settles.
  onCommit: (index: number) => void;
  // Width of one card in px, for the spacing between card centres.
  cardWidth: number;
};

const SETTLE = { type: "spring", stiffness: 260, damping: 30 } as const;

// Swipe, flick and programmatic changes all move the one `position` value.
export function useCardCarousel({ count, activeIndex, onCommit, cardWidth }: Options) {
  const reducedMotion = useReducedMotion();
  const position = useMotionValue(activeIndex);
  const dragStart = useRef(activeIndex);
  const dragMoved = useRef(false);
  const target = useRef(activeIndex);
  const spread = Math.max(240, cardWidth) * SPREAD_RATIO;

  const settle = useCallback(
    (next: number) => {
      target.current = next;
      if (reducedMotion) position.set(next);
      else animate(position, next, SETTLE);
    },
    [position, reducedMotion],
  );

  // A change from outside (pager, arrow keys) takes the shortest path around the
  // ring, and is skipped when it is just our own swipe echoing back.
  useEffect(() => {
    if (mod(target.current, count) === activeIndex) return;
    settle(target.current + wrapOffset(activeIndex - mod(target.current, count), count));
  }, [activeIndex, count, settle]);

  const onPanStart = useCallback(() => {
    position.stop();
    dragStart.current = position.get();
    dragMoved.current = false;
  }, [position]);

  const onPan = useCallback(
    (_: PointerEvent, info: PanInfo) => {
      if (Math.abs(info.offset.x) > 5) dragMoved.current = true;
      const distance = -info.offset.x / spread;
      position.set(dragStart.current + Math.sign(distance) * Math.min(Math.abs(distance), 1.1));
    },
    [position, spread],
  );

  const onPanEnd = useCallback(
    (_: PointerEvent, info: PanInfo) => {
      const direction =
        info.offset.x < -SWIPE_DISTANCE || info.velocity.x < -SWIPE_VELOCITY
          ? 1
          : info.offset.x > SWIPE_DISTANCE || info.velocity.x > SWIPE_VELOCITY
            ? -1
            : 0;
      const next = Math.round(dragStart.current) + direction;
      settle(next);
      onCommit(mod(next, count));
    },
    [count, onCommit, settle],
  );

  return {
    position,
    spread,
    depth: (reducedMotion ? 0 : 1) as 0 | 1,
    dragMovedRef: dragMoved,
    panHandlers: { onPanStart, onPan, onPanEnd },
  };
}

// The transform values for one card, derived from the shared position.
export function useCardStyle(
  position: MotionValue<number>,
  index: number,
  count: number,
  spread: number,
  depth: 0 | 1,
) {
  const layout = useTransform(position, (value) => layoutCard(value, index, count, spread, depth));
  return {
    x: useTransform(layout, (l) => l.x),
    y: useTransform(layout, (l) => l.y),
    z: useTransform(layout, (l) => l.z),
    rotateY: useTransform(layout, (l) => l.rotateY),
    scale: useTransform(layout, (l) => l.scale),
    opacity: useTransform(layout, (l) => l.opacity),
    filter: useTransform(layout, (l) => `blur(${l.blur}px)`),
    zIndex: useTransform(layout, (l) => l.zIndex),
  };
}
