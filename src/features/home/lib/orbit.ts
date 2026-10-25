// The suggestion orbit: a flat ellipse around Devy, one lap every ~36s. The card
// at the bottom of the ellipse is "front": full size, in front of Devy, lit in
// its own colour. Cards shrink, fade and soften as they go round the back.
export const RADIUS_X = 230;
export const RADIUS_Y = 92;
export const LAP_MS = 36000;

export type Radii = { x: number; y: number };

// The orbit shrinks to fit a narrow cluster so cards never run off the edge of
// a phone: wide enough that each card clears Devy, no wider than the desktop
// ellipse.
export function getRadii(cluster: HTMLElement | null, card: HTMLElement | null): Radii {
  if (!cluster || !card) return { x: RADIUS_X, y: RADIUS_Y };
  const x = Math.min(RADIUS_X, Math.max(60, (cluster.clientWidth - card.offsetWidth) / 2 - 6));
  return { x, y: Math.min(RADIUS_Y, Math.max(48, x * 0.42)) };
}

// Places every card for the current angle, and returns which one is in front.
export function placeCards(cards: (HTMLElement | null)[], angle: number, radii: Radii) {
  let front = 0;
  let frontDepth = -1;
  cards.forEach((card, index) => {
    if (!card) return;
    const theta = angle + (index / cards.length) * Math.PI * 2;
    const depth = (Math.cos(theta) + 1) / 2;
    const x = Math.sin(theta) * radii.x;
    const y = Math.cos(theta) * radii.y;
    card.style.transform = `translate(-50%, -50%) translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) scale(${(0.72 + depth * 0.28).toFixed(3)})`;
    card.style.opacity = (0.35 + depth * 0.65).toFixed(3);
    card.style.filter = depth < 0.6 ? `blur(${((0.6 - depth) * 3).toFixed(2)}px)` : "none";
    card.style.zIndex = String(Math.round(depth * 10));
    card.style.setProperty("--glow", Math.max(0, (depth - 0.75) / 0.25).toFixed(3));
    if (depth > frontDepth) {
      frontDepth = depth;
      front = index;
    }
  });
  return front;
}
