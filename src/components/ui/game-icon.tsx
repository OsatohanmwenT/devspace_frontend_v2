import { assetUrl } from "~/config/assets";

// The illustrated icons (chest, bolt, notebook, lock…) as one component, so a
// screen picks an icon by name rather than a file path. Each is a small
// transparent WebP cropped to the artwork.
const ICONS = {
  "devy-dumbbell": "icons/devy-dumbbell.webp",
  "daily-tasks-notebook": "icons/daily-tasks-notebook.webp",
  "shield-keyhole": "icons/shield-keyhole.webp",
  "treasure-chest": "icons/treasure-chest.webp",
  "devy-treasure-chest": "icons/devy-treasure-chest.webp",
  "lightning-bolt": "icons/lightning-bolt.webp",
  "coin-stack": "icons/coin-stack.webp",
  "gold-coin": "icons/gold-coin.webp",
} as const;

export type GameIconName = keyof typeof ICONS;

export function GameIcon({ name, className = "" }: { name: GameIconName; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- small fixed WebP
    <img
      src={assetUrl(ICONS[name])}
      alt=""
      aria-hidden="true"
      draggable={false}
      decoding="async"
      className={`object-contain select-none ${className}`}
    />
  );
}

// A season coin sized to the text around it. Replaces the coin emoji, which
// renders differently (or not at all) from one OS to the next.
export function CoinIcon({ className = "" }: { className?: string }) {
  return <GameIcon name="gold-coin" className={`inline-block size-[1.15em] -translate-y-[0.08em] align-middle ${className}`} />;
}
