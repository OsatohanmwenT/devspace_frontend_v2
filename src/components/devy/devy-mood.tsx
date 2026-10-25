import { assetUrl } from "~/config/assets";

const DEVY_MOODS = {
  neutral: "devy/neutral.svg",
  celebrating: "devy/celebrating.svg",
  annoyed: "devy/annoyed.svg",
  walking: "devy/walking.svg",
} as const;

type DevyMoodName = keyof typeof DEVY_MOODS;

// Which face shows is a content decision, not a decorative one:
// - neutral: the default companion.
// - celebrating: reserved for something the learner actually earned.
// - annoyed: Devy reacting to the situation (a stalled streak, a dead end),
//   never to the learner.
// A screen picks a mood, not a file path, and the entrance motion comes with it.
const MOOD_MOTION: Record<DevyMoodName, string> = {
  neutral: "",
  celebrating: "motion-safe:animate-devy-celebrate",
  annoyed: "motion-safe:animate-devy-annoyed",
  walking: "motion-safe:animate-devy-walk",
};

type DevyMoodProps = {
  mood?: DevyMoodName;
  className?: string;
  alt?: string;
};

export function DevyMood({ mood = "neutral", className = "", alt = "" }: DevyMoodProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- fixed-size SVG, nothing for next/image to optimise
    <img
      src={assetUrl(DEVY_MOODS[mood])}
      alt={alt}
      aria-hidden={alt ? undefined : true}
      className={`origin-bottom object-contain ${MOOD_MOTION[mood]} ${className}`}
    />
  );
}
