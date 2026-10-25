"use client";

import { motion } from "motion/react";
import { useRef } from "react";
import { useBuildIn } from "../hooks/use-build-in";
import { useSelectPop } from "../hooks/use-select-pop";
import { CASCADE } from "../lib/motion-presets";
import type { Option, OptionValue, StageGroup } from "../types";

type RouteOptionsProps = {
  groups: StageGroup[];
  notSureOption?: Option;
  value: OptionValue | OptionValue[] | undefined;
  placement: Option | null;
  onSelect: (value: OptionValue) => void;
  onTestOut: (group: StageGroup) => void;
};

const SELECTED_ROW =
  "border-blue-600 bg-blue-600/10 dark:border-blue-400 dark:bg-blue-400/15";
const IDLE_ROW =
  "border-neutral-300 bg-white hover:border-blue-600 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:border-blue-400";

// The route as a vertical timeline of phases: choose which one to begin in.
// The heading cascades, then the route draws itself top to bottom: each row
// lands and the connector below it grows down to meet the next.
export function RouteOptions({
  groups,
  notSureOption,
  value,
  placement,
  onSelect,
  onTestOut,
}: RouteOptionsProps) {
  const [popping, setPopping] = useSelectPop();
  const rootRef = useRef<HTMLDivElement>(null);
  useBuildIn(rootRef, "route-options", { mode: "cascade" });

  const recommendedGroup =
    placement && groups.find((group) => group.stages.some((stage) => stage.value === placement.value));
  const selectedGroup = groups.find((group) => group.stages.some((stage) => stage.value === value));
  const hasMovedOffRecommendation =
    recommendedGroup && selectedGroup && selectedGroup.id !== recommendedGroup.id;

  // A group is selected either because the experience-based placement lands
  // inside it, or because the learner picked it directly: in which case they
  // start at that group's first stage rather than one they never saw.
  function selectGroup(group: StageGroup) {
    const withinPlacement =
      placement && group.stages.some((stage) => stage.value === placement.value);
    setPopping(group.id);
    onSelect(withinPlacement ? placement.value : group.stages[0].value);
  }

  return (
    <div ref={rootRef} className="grid w-full max-w-[620px] justify-items-center gap-5 text-center">
      <div className="grid justify-items-center gap-2">
        <p data-build data-build-order="0" className="m-0 text-sm font-medium text-blue-600 dark:text-blue-400">
          Your learning route
        </p>
        <h1
          data-build
          data-build-order="1"
          className="m-0 font-display text-[clamp(26px,3.4vw,34px)] font-medium"
        >
          Review your starting route
        </h1>
        <p
          data-build
          data-build-order="2"
          className="text-muted m-0 max-w-[48ch] text-[15px] leading-normal"
        >
          {hasMovedOffRecommendation
            ? `You moved your start from ${recommendedGroup.label}. You can switch back any time.`
            : "Choose which phase to begin in. You can always return to earlier lessons later."}
        </p>
      </div>

      <div className="grid w-full" role="group" aria-label="Choose your starting phase">
        {groups.map((group, index) => {
          const selected = group.stages.some((stage) => stage.value === value);
          const isRecommended =
            placement && group.stages.some((stage) => stage.value === placement.value);
          const isLast = index === groups.length - 1;
          const dimmed = popping !== null && popping !== group.id && !selected;

          return (
            <div key={group.id} className={`flex items-stretch gap-3 ${isLast ? "" : "pb-2.5"}`}>
              {/* The marker column stretches to the row's full height, so the
                  connecting line always reaches the next marker however many
                  stages a group lists. */}
              <div className="flex flex-none flex-col items-center">
                <span
                  data-build
                  data-build-order={3 + index}
                  className={`grid size-7 flex-none place-items-center rounded-full text-xs font-semibold transition-colors ${
                    selected
                      ? "bg-blue-600 text-white dark:bg-blue-500"
                      : "border border-neutral-300 bg-white text-muted dark:border-neutral-700 dark:bg-neutral-900"
                  }`}
                  aria-hidden="true"
                >
                  {selected ? (
                    <motion.svg
                      key="check"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 520, damping: 22 }}
                      className="size-3.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12.5 9.5 17 19 7" />
                    </motion.svg>
                  ) : (
                    index + 1
                  )}
                </span>
                {!isLast && (
                  <motion.span
                    className="mt-1 w-px flex-1 origin-top bg-neutral-300 dark:bg-neutral-700"
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{
                      duration: 0.34,
                      ease: [0.33, 1, 0.68, 1],
                      delay: CASCADE.stagger * (3 + index) + 0.08,
                    }}
                    aria-hidden="true"
                  />
                )}
              </div>
              <div
                data-build
                data-build-order={3 + index}
                className={`min-w-0 flex-1 rounded-xl border p-3.5 text-left transition-[background,border-color,opacity] ${selected ? SELECTED_ROW : IDLE_ROW} ${popping === group.id ? "motion-safe:animate-select-pop" : ""} ${dimmed ? "opacity-75" : ""}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <button
                    data-cuelume-toggle
                    type="button"
                    className="focus-ring min-w-0 flex-1 rounded-lg text-left"
                    aria-pressed={selected}
                    onClick={() => selectGroup(group)}
                  >
                    <span className="flex items-center gap-2">
                      <span className="font-medium">{group.label}</span>
                      {isRecommended && (
                        <span className="rounded-full bg-blue-600/10 px-2 py-0.5 text-[11px] font-semibold text-blue-600 dark:bg-blue-400/15 dark:text-blue-400">
                          Recommended
                        </span>
                      )}
                    </span>
                    <span className="text-muted mt-0.5 block text-[13px]">
                      {group.stages.map((stage) => stage.label).join(" · ")}
                    </span>
                  </button>
                  <button
                    type="button"
                    className="focus-ring text-muted flex-none rounded-md px-1 py-0.5 text-xs font-medium underline underline-offset-2 hover:text-blue-600 dark:hover:text-blue-400"
                    onClick={() => onTestOut(group)}
                  >
                    Test out
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {notSureOption && (
          <div className="flex items-stretch gap-3 pt-1">
            <div className="w-7 flex-none" aria-hidden="true" />
            <button
              data-cuelume-toggle
              type="button"
              data-build
              data-build-order={3 + groups.length}
              className={`focus-ring min-h-14 min-w-0 flex-1 rounded-xl border px-4 text-left text-sm font-medium transition-[background,border-color,opacity] ${value === notSureOption.value ? SELECTED_ROW : IDLE_ROW} ${popping === "not_sure" ? "motion-safe:animate-select-pop" : ""} ${popping !== null && popping !== "not_sure" ? "opacity-75" : ""}`}
              aria-pressed={value === notSureOption.value}
              onClick={() => {
                setPopping("not_sure");
                onSelect(notSureOption.value);
              }}
            >
              {notSureOption.label}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
