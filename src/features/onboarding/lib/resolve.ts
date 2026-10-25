import { roleToPath } from "../data/outcomes";
import {
    experienceOptions,
    javascriptExperienceOptions,
} from "../data/questions";
import { STACK_ROLES } from "../data/stacks";
import { startingPointOptions } from "../data/starting-points";
import type { Answers, Option } from "../types";

// Backend needs a preview before its language choice. Frontend deliberately
// has no framework default: new JavaScript learners begin on shared foundations.
const STACK_DEFAULTS: Record<string, string> = { backend_developer: "node" };

export function getExperienceRung(experience?: string) {
  return experienceOptions.find((option) => option.value === experience)?.rung ?? 1;
}

export function getJavascriptExperienceRung(javascriptExperience?: string) {
  return (
    javascriptExperienceOptions.find((option) => option.value === javascriptExperience)
      ?.rung ?? 1
  );
}

// A role is resolved either directly or via the sub-quiz, which writes back
// here rather than leaving `help_me_choose` sitting in the answer.
export function resolveRole({ role, roleFromSubQuiz }: Answers) {
  if (role && role !== "help_me_choose") return role;
  return roleFromSubQuiz ?? null;
}

export function resolveBranch({ branch, branchFromTriage }: Answers) {
  if (branch && branch !== "not_sure") return branch;
  return branchFromTriage ?? null;
}

// Same shape as resolveRole: a stack is resolved either directly or via its
// own sub-quiz, which writes to a separate key so the raw answer stays intact.
export function resolveStack({ stack, stackFromSubQuiz }: Answers) {
  if (stack && stack !== "help_me_choose") return stack;
  return stackFromSubQuiz ?? null;
}

// The single source of truth for which startingPointOptions entry a role's
// ladder lives under. Roles outside STACK_ROLES use their own key; STACK_ROLES
// roles use `${role}_${stack}`, falling back to that role's default stack
// before the stack question has been answered (the role-break preview needs a
// ladder to show before the stack step exists).
export function resolveLadderKey(answers: Answers = {}) {
  const role = resolveRole(answers);
  if (!role) return null;
  if (!STACK_ROLES.has(role)) return role;

  if (role === "frontend_developer" && !resolveStack(answers)) {
    return "frontend_developer_foundations";
  }

  const stack = resolveStack(answers) ?? STACK_DEFAULTS[role];
  const key = `${role}_${stack}`;
  return startingPointOptions[key] ? key : role;
}

export function getLadder(answers: Answers = {}): Option[] {
  const ladderKey = resolveLadderKey(answers);
  return ladderKey ? (startingPointOptions[ladderKey] ?? []) : [];
}

function getRung(answers: Answers) {
  return resolveRole(answers) === "frontend_developer"
    ? getJavascriptExperienceRung(answers.javascriptExperience)
    : getExperienceRung(answers.experience);
}

// The rung-derived recommendation, independent of anything the learner has
// manually picked on the route-review screen. Kept separate from
// resolvePlacement so a "Recommended" badge still points at the original
// suggestion after they choose a different stage.
export function resolveRecommendedPlacement(answers: Answers = {}) {
  const ladder = getLadder(answers);
  if (!ladder.length) return null;
  // The last ladder entry is always "not sure", so it is never recommended.
  return ladder[Math.min(getRung(answers) - 1, ladder.length - 2)] ?? ladder[0];
}

export function resolvePlacement(answers: Answers = {}) {
  const ladder = getLadder(answers);
  if (!ladder.length) return null;
  if (answers.startingPoint && answers.startingPoint !== "not_sure") {
    return ladder.find((option) => option.value === answers.startingPoint) ?? ladder[0];
  }
  // "Not sure" and low-experience learners are placed by rung instead.
  return resolveRecommendedPlacement(answers);
}

export function resolvePath(answers: Answers = {}) {
  const role = resolveRole(answers);
  return (role && roleToPath[role]) ?? "machine-learning";
}
