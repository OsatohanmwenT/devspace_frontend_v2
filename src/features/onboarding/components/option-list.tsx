"use client";

import { DevyLottie } from "~/components/devy";
import { useDelayedValue } from "../hooks/use-delayed-value";
import { useSelectPop } from "../hooks/use-select-pop";
import { isChosen, optionSurface } from "../lib/option-surface";
import type { Option, OptionValue } from "../types";
import { OptionIcon } from "./option-icon";

type OptionListProps = {
  options: Option[];
  value: OptionValue | OptionValue[] | undefined;
  onSelect: (value: OptionValue) => void;
  layout?: "list" | "grid";
};

export function OptionList({ options, value, onSelect, layout = "list" }: OptionListProps) {
  const [popping, setPopping] = useSelectPop();
  // Lets Devy's pop-out start a beat after the card's own pop, so it reads as
  // caused by it.
  const settledValue = useDelayedValue(value, 120);

  function choose(optionValue: OptionValue) {
    setPopping(optionValue);
    onSelect(optionValue);
  }

  // Siblings of a just-selected option soften for the pop's duration so the
  // chosen one is the only thing moving.
  const dimmed = (optionValue: OptionValue, selected: boolean) =>
    popping !== null && popping !== optionValue && !selected ? "opacity-75" : "";

  if (layout === "grid") {
    return (
      <div className="grid w-full max-w-[560px] grid-cols-2 gap-2.5" role="group">
        {options.map((option, index) => {
          const selected = isChosen(value, option.value);
          const devyOut = selected && isChosen(settledValue, option.value);
          // Devy climbs out the same side the card sits on: left column, left
          // side; right column, right side. The mirrored clip is the same asset.
          const popRight = index % 2 === 1;

          return (
            <button
              key={option.value}
              type="button"
              data-build
              data-cuelume-toggle
              className={`focus-ring relative flex flex-col items-center gap-2.5 rounded-xl px-3 py-4 text-center text-[13px] leading-[1.3] font-medium transition-[background,border-color,opacity] duration-[120ms] ${optionSurface(selected)} ${popping === option.value ? "motion-safe:animate-select-pop" : ""} ${dimmed(option.value, selected)}`}
              aria-pressed={selected}
              onClick={() => choose(option.value)}
            >
              {option.icon && <OptionIcon name={option.icon} selected={selected} />}
              <span>{option.label}</span>
              {/* Devy pops out from behind the selected card, like he's just
                  been disturbed. The card never changes shape to make room. */}
              {devyOut && (
                <span
                  className={`pointer-events-none absolute top-1/2 z-10 h-24 w-24 -translate-y-1/2 rotate-180 ${popRight ? "-right-24" : "-left-24"}`}
                >
                  <DevyLottie
                    clip="side-pop-out"
                    loop={false}
                    holdAtPeak
                    flip={popRight}
                    speed={4}
                    className="h-full w-full"
                  />
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // Only genuinely long lists (8+) split into two columns on wider screens.
  const twoColumn = options.length > 7;

  return (
    <div
      className={`grid w-full gap-2.5 ${twoColumn ? "max-w-[640px] min-[720px]:grid-cols-2" : "max-w-[520px]"}`}
      role="group"
    >
      {options.map((option) => {
        const selected = isChosen(value, option.value);

        return (
          <button
            key={option.value}
            type="button"
            data-build
            data-cuelume-toggle
            className={`focus-ring flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-[14px] leading-[1.45] transition-[background,border-color,opacity] duration-[120ms] ${optionSurface(selected)} ${popping === option.value ? "motion-safe:animate-select-pop" : ""} ${dimmed(option.value, selected)}`}
            aria-pressed={selected}
            onClick={() => choose(option.value)}
          >
            {option.icon && <OptionIcon name={option.icon} selected={selected} />}
            <span className="min-w-0 flex-1">
              <span className="block font-medium">{option.label}</span>
              {option.note && (
                <span className={`block text-[13px] ${selected ? "text-white/70" : "text-muted"}`}>
                  {option.note}
                </span>
              )}
            </span>
            {option.aside && (
              <span className={`flex-none text-[13px] ${selected ? "text-white/70" : "text-muted"}`}>
                {option.aside}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
