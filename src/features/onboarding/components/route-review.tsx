"use client";

import { useState } from "react";
import type { Option, OptionValue, StageGroup } from "../types";
import { RouteAssessment } from "./route-assessment";
import { RouteOptions } from "./route-options";

type RouteReviewProps = {
  groups: StageGroup[];
  notSureOption?: Option;
  value: OptionValue | OptionValue[] | undefined;
  // The experience-based recommendation, independent of what was picked here.
  placement: Option | null;
  branch: string | null;
  onSelect: (value: OptionValue) => void;
  isTesting: boolean;
  onTestingChange: (isTesting: boolean) => void;
};

// Either the phase list or the test-out quiz for one phase. The quiz is
// reached from a phase's "Test out", or straight from the placement screen's
// "Test my level", which defaults to the recommended phase.
export function RouteReview({
  groups,
  notSureOption,
  value,
  placement,
  branch,
  onSelect,
  isTesting,
  onTestingChange,
}: RouteReviewProps) {
  const [testGroupId, setTestGroupId] = useState<string | null>(null);

  const recommendedGroup = groups.find(
    (group) => placement && group.stages.some((stage) => stage.value === placement.value),
  );
  const testGroup = groups.find((group) => group.id === testGroupId) ?? recommendedGroup ?? groups[0];

  if (isTesting && testGroup) {
    return (
      <RouteAssessment
        key={testGroup.id}
        group={testGroup}
        groups={groups}
        branch={branch}
        onUse={(startValue) => {
          onSelect(startValue);
          onTestingChange(false);
        }}
        onExit={() => onTestingChange(false)}
      />
    );
  }

  return (
    <RouteOptions
      groups={groups}
      notSureOption={notSureOption}
      value={value}
      placement={placement}
      onSelect={onSelect}
      onTestOut={(group) => {
        setTestGroupId(group.id);
        onTestingChange(true);
      }}
    />
  );
}
