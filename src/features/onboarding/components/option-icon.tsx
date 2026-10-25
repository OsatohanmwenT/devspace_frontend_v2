import { BRAND_ICON_NAMES, ICON_PATHS, type IconName } from "../data/icon-paths";

export function OptionIcon({ name, selected }: { name: IconName; selected: boolean }) {
  const isBrand = BRAND_ICON_NAMES.has(name);

  return (
    <span
      className={`grid size-9 flex-none place-items-center rounded-lg ${
        selected
          ? "bg-white/95 text-blue-600 dark:text-blue-400"
          : "bg-neutral-100 dark:bg-neutral-700"
      }`}
      aria-hidden="true"
    >
      <svg
        className="size-[18px]"
        viewBox="0 0 24 24"
        fill={isBrand ? "currentColor" : "none"}
        stroke={isBrand ? "none" : "currentColor"}
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {ICON_PATHS[name]}
      </svg>
    </span>
  );
}
