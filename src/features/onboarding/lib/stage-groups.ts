import type { Option, StageGroup } from "../types";

const STAGE_GROUP_LABELS = ["Foundations", "Core skills", "Advanced"];

// Groups a role's stage ladder into named phases instead of a flat list, so
// route review is a choice between 2-3 concepts rather than a scan of every
// stage. Works for any ladder length.
export function getStageGroups(ladderOptions: Option[]): StageGroup[] {
  const stages = ladderOptions.filter((option) => option.value !== "not_sure");
  const bandSize = Math.ceil(stages.length / STAGE_GROUP_LABELS.length);

  return STAGE_GROUP_LABELS.map((label, index) => ({
    id: label.toLowerCase().replace(/\s+/g, "_"),
    label,
    stages: stages.slice(index * bandSize, index * bandSize + bandSize),
  })).filter((group) => group.stages.length > 0);
}
