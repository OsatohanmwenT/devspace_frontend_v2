import type { ComponentType, SVGProps } from "react";

const TONES = {
  violet: "bg-violet-400/15 text-blue-600 dark:text-blue-300",
  teal: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-500",
};

// The small coloured icon badge at the top-left of a card.
export function IconChip({
  icon: Icon,
  tone,
}: {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  tone: keyof typeof TONES;
}) {
  return (
    <span className={`grid size-9 flex-none place-items-center rounded-xl ${TONES[tone]}`}>
      <Icon className="size-[18px]" />
    </span>
  );
}
