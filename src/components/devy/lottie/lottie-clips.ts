// Lottie clips are Devy's motion-capture-style animations. Screens ask for a
// clip by name, never by path.
export const LOTTIE_CLIPS = {
  wave: "animations/lottie/wave.lottie",
  listening: "animations/lottie/listening.lottie",
  thinking: "animations/lottie/thinking.lottie",
  "side-pop-out": "animations/lottie/side-pop-out.json",
  walk: "animations/lottie/devy-walk-loop.lottie",
  "lesson-complete": "animations/lottie/lesson-complete.lottie",
  // A capture of the Rive rig, so it bakes in an opaque dark-gray background.
  // Only use it on a matching dark surface.
  idle: "animations/lottie/devy-idle-loop.lottie",
} as const satisfies Record<string, string>;

export type LottieClipName = keyof typeof LOTTIE_CLIPS;
