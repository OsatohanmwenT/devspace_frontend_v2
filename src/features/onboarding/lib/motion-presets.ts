// One vocabulary for the whole onboarding flow. Every screen pulls its timing
// from here so a step swap, a cascade or a word reveal feels the same wherever
// it appears.

// Step swap: the outgoing screen dims and shrinks in place (no slide, the
// header and footer around it don't move), then the incoming one builds in.
export const SWAP = {
  out: 0.2,
  in: 0.3,
  scaleOut: 0.96,
  scaleBackIn: 1.04,
  ease: [0.22, 0.61, 0.36, 1],
} as const;

// Build-in flavours, picked per screen rather than defaulted to one:
// - pop: a short rise with a touch of overshoot. Reads as "this just arrived".
// - scale: grows from slightly small with no travel, like a card materialising.
// - bounce: a bigger, springier scale-up for the one celebratory moment.
// - cascade: staggers children in order, reserved for lists.
export const BUILD_IN = {
  pop: { y: 10, scale: 0.97, duration: 0.34, ease: [0.34, 1.4, 0.64, 1] },
  scale: { scale: 0.92, duration: 0.32, ease: [0.33, 1, 0.68, 1] },
  bounce: { scale: 0.8, duration: 0.5, ease: [0.34, 1.8, 0.64, 1] },
  cascade: { y: 10, duration: 0.3, ease: [0.33, 1, 0.68, 1] },
} as const;

export const CASCADE = { stagger: 0.04, maxIndividual: 8 } as const;

// Hero titles reveal word by word; a question prompt should be readable the
// instant it appears.
export const WORD = { stagger: 0.05, y: 6, duration: 0.32, ease: [0.33, 1, 0.68, 1] } as const;

// Cards arrive from one point and fan out.
export const FAN = {
  angle: 9,
  rise: 12,
  scaleFrom: 0.6,
  duration: 0.55,
  ease: [0.34, 1.4, 0.64, 1],
  stagger: 0.09,
} as const;

// A selected option pops once while its siblings soften for the same beat.
export const POP = { duration: 0.26 } as const;
