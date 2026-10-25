"use client";

import { useSelectPop } from "../hooks/use-select-pop";
import { isChosen, optionSurface } from "../lib/option-surface";
import type { Option, OptionValue } from "../types";

type ChipListProps = {
  options: Option[];
  value: OptionValue | OptionValue[] | undefined;
  onSelect: (value: OptionValue) => void;
};

// Chips pop a touch harder than cards (they're smaller) and don't dim their
// siblings: multi-select means the others are still live choices.
export function ChipList({ options, value, onSelect }: ChipListProps) {
  const [popping, setPopping] = useSelectPop();

  return (
    <div
      className="flex max-w-[520px] flex-wrap justify-center gap-2.5 [--pop-scale:1.06]"
      role="group"
    >
      {options.map((option) => {
        const selected = isChosen(value, option.value);

        return (
          <button
            data-cuelume-toggle
            key={option.value}
            type="button"
            data-build
            aria-pressed={selected}
            onClick={() => {
              setPopping(option.value);
              onSelect(option.value);
            }}
            className={`focus-ring min-h-10 rounded-full px-4 text-sm transition-[background,border-color] duration-[120ms] ${optionSurface(selected)} ${popping === option.value ? "motion-safe:animate-select-pop" : ""}`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
