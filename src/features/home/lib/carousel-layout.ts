// The tablet and phone card stack is driven by one continuous value.
//
// `position` is an unbounded float measured in card units: 0 means card 0 is
// centred, 1.5 means halfway between cards 1 and 2. Every card's placement is a
// pure function of its own distance from that value, so during a drag the
// whole stack moves in lockstep with the finger.

// Each curve is sampled against |offset| at these stops.
const STOPS = [0, 0.5, 1, 2];
const X = [0, 0.5, 1, 1.72]; // in card spreads, compressed at the far edge
const SCALE = [1, 0.9, 0.8, 0.68];
const ROTATE = [0, 18, 32, 40]; // degrees, signed by the side the card is on
const Y = [0, 9, 18, 26];
const Z = [0, -70, -140, -220];
// Side cards recede rather than sitting fully opaque: enough presence to read
// as "there is more to swipe to", not enough to compete with the front card.
const OPACITY = [1, 0.78, 0.32, 0];
const BLUR = [0, 1, 4, 7]; // px

// The gap between card centres, as a share of the card's own width.
export const SPREAD_RATIO = 0.82;
export const SWIPE_DISTANCE = 55;
export const SWIPE_VELOCITY = 500;

export const mod = (n: number, m: number) => ((n % m) + m) % m;

// Shortest signed distance around a ring of `n`. The seam sits where opacity
// has already reached 0, so the card that wraps from one end to the other does
// it unseen.
export function wrapOffset(delta: number, n: number) {
  let d = delta % n;
  if (d > n / 2) d -= n;
  if (d <= -n / 2) d += n;
  return d;
}

function interpolate(value: number, outputs: number[]) {
  const last = STOPS.length - 1;
  if (value <= STOPS[0]) return outputs[0];
  if (value >= STOPS[last]) return outputs[last];
  for (let i = 1; i <= last; i += 1) {
    if (value <= STOPS[i]) {
      const t = (value - STOPS[i - 1]) / (STOPS[i] - STOPS[i - 1]);
      return outputs[i - 1] + (outputs[i] - outputs[i - 1]) * t;
    }
  }
  return outputs[last];
}

export type CardLayout = {
  x: number;
  y: number;
  z: number;
  rotateY: number;
  scale: number;
  opacity: number;
  blur: number;
  zIndex: number;
};

// Where card `index` sits when the stack is at `position`. `depth` is 0 under
// reduced motion, flattening the 3D tilt.
export function layoutCard(
  position: number,
  index: number,
  count: number,
  spread: number,
  depth: 0 | 1,
): CardLayout {
  const offset = wrapOffset(index - position, count);
  const distance = Math.abs(offset);
  const side = Math.sign(offset);

  // z-index is the card's rank by distance, not a rounded formula: two cards at
  // nearly the same distance would tie, and the browser would then paint them
  // in DOM order instead of by which is closer.
  let rank = 0;
  for (let other = 0; other < count; other += 1) {
    if (other === index) continue;
    const otherDistance = Math.abs(wrapOffset(other - position, count));
    if (otherDistance < distance || (otherDistance === distance && other < index)) rank += 1;
  }

  return {
    x: side * interpolate(distance, X) * spread,
    y: interpolate(distance, Y),
    z: interpolate(distance, Z) * depth,
    rotateY: side * interpolate(distance, ROTATE) * depth,
    scale: interpolate(distance, SCALE),
    opacity: interpolate(distance, OPACITY),
    blur: interpolate(distance, BLUR),
    zIndex: count - rank,
  };
}
