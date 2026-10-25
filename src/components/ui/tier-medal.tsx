import { LockIcon } from "./icons";

function channels(hex: string) {
  const value = parseInt(hex.replace("#", ""), 16);
  return [(value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff] as const;
}

// Darkens a hex colour for the medal's rim, so each league only has to declare
// one colour rather than a matched light/dark pair.
function darken(hex: string, amount = 40) {
  const [r, g, b] = channels(hex).map((channel) => Math.max(0, channel - amount));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

type TierMedalProps = {
  color: string;
  state: "default" | "current" | "locked";
  size?: number;
};

// A league medal. `current` rings it in the league's own colour; `locked` is a
// plain disc with a padlock. Sized in px so the ladder can scale tiers down as
// they recede.
export function TierMedal({ color, state, size = 46 }: TierMedalProps) {
  if (state === "locked") {
    return (
      <span
        className="grid place-items-center rounded-full bg-[#f0f0ee] dark:bg-[#262626]"
        style={{ width: size, height: size }}
        aria-hidden="true"
      >
        <span className="grid place-items-center" style={{ width: size * 0.42, height: size * 0.42 }}>
          <LockIcon className="h-full w-full text-[#b4b4b1] dark:text-[#7d7d80]" />
        </span>
      </span>
    );
  }

  const rim = darken(color);
  const [r, g, b] = channels(color);

  return (
    <span
      className="grid place-items-center rounded-full"
      style={{
        width: size,
        height: size,
        boxShadow:
          state === "current"
            ? `0 0 0 ${Math.max(2, Math.round(size / 16))}px rgba(${r}, ${g}, ${b}, 0.35)`
            : "none",
      }}
      aria-hidden="true"
    >
      <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
        <circle cx="24" cy="24" r="21" fill={rim} />
        <circle cx="24" cy="22" r="19" fill={color} />
        <circle cx="24" cy="22" r="13.5" fill="none" stroke={rim} strokeWidth="1.6" opacity=".65" />
        <path d="M24 13.5l2.9 5.9 6.5.9-4.7 4.6 1.1 6.4-5.8-3-5.8 3 1.1-6.4-4.7-4.6 6.5-.9z" fill="#fff" opacity=".9" />
      </svg>
    </span>
  );
}
