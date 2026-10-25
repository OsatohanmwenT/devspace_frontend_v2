import { BRANCHES } from "../data/branches";
import { roleOptions } from "../data/roles";
import { getStepOptions } from "./steps";

// "Frontend Developer" for a known role, or the raw value when the role was
// not one of the branch's options.
export function getRoleLabel(branch: string | null, role: string | null) {
  if (!role) return "";
  const fromBranch = BRANCHES.some((item) => item.value === branch);
  if (!fromBranch) return role;
  return getStepOptions("role", { branch: branch ?? undefined }).find((option) => option.value === role)?.label ?? role;
}

const ROLE_LABELS = new Map(
  Object.values(roleOptions)
    .flat()
    .map((option) => [option.value, option.label]),
);

// "Frontend Developer" for a role id, wherever the role was picked.
export function getRoleLabelByValue(role: string | null) {
  return (role && ROLE_LABELS.get(role)) || "Learner";
}
