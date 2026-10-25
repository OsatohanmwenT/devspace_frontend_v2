import { getAvatarDataUri } from "~/lib/avatar-styles";

const SIZES = {
  sm: "size-7",
  md: "size-10",
  lg: "size-14",
};

// A generated avatar, seeded by anything stable (a rival's id, a learner's id),
// so a long board does not read as a wall of identical lettered circles.
export function Avatar({ seed, size = "md", className = "" }: { seed: string; size?: keyof typeof SIZES; className?: string }) {
  return (
    <span className={`inline-grid shrink-0 place-items-center overflow-hidden rounded-full bg-[#f0f0ee] dark:bg-[#262626] ${SIZES[size]} ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element -- generated data URI */}
      <img src={getAvatarDataUri(seed)} alt="" aria-hidden="true" className="size-full" />
    </span>
  );
}
