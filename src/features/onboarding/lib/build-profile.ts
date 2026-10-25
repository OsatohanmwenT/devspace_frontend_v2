import type { Profile } from "~/types/profile";
import type { Answers } from "../types";
import {
    getExperienceRung,
    resolveBranch,
    resolvePath,
    resolvePlacement,
    resolveRole,
    resolveStack,
} from "./resolve";

function toArray(value: string | string[] | undefined): string[] {
  if (Array.isArray(value)) return value;
  return value === undefined ? [] : [value];
}

// Records the raw answers alongside the resolved ones, so "not sure" and
// "help me choose" detours stay visible after they have been resolved.
export function buildProfile(answers: Answers = {}): Profile {
  const role = resolveRole(answers);
  const stack = resolveStack(answers);

  return {
    branch: resolveBranch(answers),
    branchAnswer: answers.branch ?? null,
    role,
    roleAnswer: answers.role ?? null,
    stack,
    javascriptExperience: answers.javascriptExperience ?? null,
    frameworkDecision:
      role === "frontend_developer"
        ? answers.javascriptExperience === "new_to_javascript"
          ? "pending"
          : stack
            ? "complete"
            : null
        : null,
    motivation: answers.motivation ?? null,
    experience: answers.experience ?? null,
    rung: getExperienceRung(answers.experience),
    startingPoint: (resolvePlacement(answers)?.value as string | undefined) ?? null,
    projectInterest: toArray(answers.projectInterest),
    immediateNeed: toArray(answers.immediateNeed),
    dailyMinutes: answers.dailyMinutes ?? 10,
    pathId: resolvePath(answers),
    completedAt: new Date().toDateString(),
  };
}
