// Rive clips drive Devy's rig. Screens ask for a clip by name, never by path.
// Two ways of playing them exist:
// - "state-machine": the clip plays "State Machine 1".
// - "timeline": the entrance is a raw linear animation, because driving the
//   state machine of these exports never produced a visible frame change.
//   `startAt` skips dead air at the start; `restAt` is the pose held when
//   motion is reduced.
export type RiveClip =
  | {
      kind: "state-machine";
      src: string;
      // Small canvases on the roadmap render at 3x so Devy stays crisp.
      sharp?: boolean;
      // Data-bound clip: its inputs live on the auto-bound view model instance.
      autoBind?: boolean;
    }
  | {
      kind: "timeline";
      src: string;
      timeline: string;
      startAt?: number;
      restAt?: number;
    };

export const RIVE_CLIPS = {
  "launchpad-intro": {
    kind: "state-machine",
    src: "animations/rive/devy-launchpad-intro.riv",
    sharp: true,
  },
  // The whole roadmap-tile flow in one file: intro, idle, launch, flight and
  // landing. The `flying` boolean on its view model drives it.
  "complete-flow": {
    kind: "state-machine",
    src: "animations/rive/devy-complete-flow.riv",
    sharp: true,
    autoBind: true,
  },
  // The rope file's only entrance is "Timeline 4"; its first ~4s are just the
  // empty rope dangling before Devy slides down, so playback starts at 3.4s.
  "rope-into": {
    kind: "timeline",
    src: "animations/rive/devy-rope-into.riv",
    timeline: "Timeline 4",
    startAt: 3.4,
    restAt: 6,
  },
  "side-pop-out-intro": {
    kind: "timeline",
    src: "animations/rive/devy-side-pop-out-intro.riv",
    timeline: "Timeline 1",
  },
  "up-down-pop-out": {
    kind: "timeline",
    src: "animations/rive/devy-up-down-pop-out.riv",
    timeline: "Timeline 2",
  },
} as const satisfies Record<string, RiveClip>;

export type RiveClipName = keyof typeof RIVE_CLIPS;
