"use client";

import dynamic from "next/dynamic";

// The Rive and Lottie players pull in large runtimes, so they load on demand,
// client-side only. Routes that never show an animated Devy ship none of it.
export const DevyRive = dynamic(() => import("./rive/devy-rive").then((m) => m.DevyRive), {
  ssr: false,
});

export const DevyLottie = dynamic(
  () => import("./lottie/devy-lottie").then((m) => m.DevyLottie),
  { ssr: false },
);

export { DevyMood } from "./devy-mood";
export type { LottieClipName } from "./lottie/lottie-clips";
export type { RiveClipName } from "./rive/rive-clips";
