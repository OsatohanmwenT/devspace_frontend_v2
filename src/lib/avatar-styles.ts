// DiceBear avatars, generated locally (no network calls, no image hosting).
// The same style and seed always produce the same image, which is what lets a
// simulated rival have a stable-looking avatar without any profile to store it in.
import { createAvatar, type Style } from "@dicebear/core";
import { adventurer, avataaars, bottts, funEmoji, micah, notionists, openPeeps, personas, pixelArt, thumbs } from "@dicebear/collection";
import { seededRandom } from "./rng";

// A curated subset of DiceBear's styles: illustrated people, a robot, an
// emoji, pixel art, minimalist portraits. Order decides which style a seed
// lands on, so reordering changes everyone's avatar.
// Each style has its own options type, which a mixed list cannot express.
const STYLES = [adventurer, avataaars, notionists, micah, openPeeps, personas, bottts, pixelArt, funEmoji, thumbs] as unknown as Style<object>[];

// Generating an SVG is cheap but not free, and the board re-derives the same
// avatars on every refresh, so each is built once.
const cache = new Map<string, string>();

// Whoever has not picked a style still gets one, and always the same one,
// derived from their seed.
export function getAvatarDataUri(seed: string) {
  const cached = cache.get(seed);
  if (cached) return cached;
  const style = STYLES[Math.floor(seededRandom("avatar-style", seed)() * STYLES.length)];
  const uri = createAvatar(style, { seed }).toDataUri();
  cache.set(seed, uri);
  return uri;
}
