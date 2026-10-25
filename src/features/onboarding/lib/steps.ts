import { BRANCHES } from "../data/branches";
import {
    dailyTimeOptions,
    experienceOptions,
    immediateNeedOptions,
    javascriptExperienceOptions,
    motivationOptions,
    projectInterestOptions,
} from "../data/questions";
import { roleOptions } from "../data/roles";
import { stackOptions, stackSubQuiz } from "../data/stacks";
import { startingPointOptions } from "../data/starting-points";
import { branchTriage, roleSubQuiz } from "../data/sub-quizzes";
import type { AnswerKey, Answers, BranchId, Option, QuestionId, Step } from "../types";
import {
    getExperienceRung,
    getJavascriptExperienceRung,
    resolveBranch,
    resolveLadderKey,
    resolveRole,
} from "./resolve";

// Below this rung there is nothing meaningful to place against, so the
// starting-point question is skipped rather than shown with one sensible answer.
const RUNG_REQUIRING_PLACEMENT = 2;

// Which answer key a step writes.
export const STEP_ANSWER_KEY: Partial<Record<string, AnswerKey>> = {
  motivation: "motivation",
  branch: "branch",
  branch_triage: "branchFromTriage",
  role: "role",
  role_sub_quiz: "roleFromSubQuiz",
  stack: "stack",
  stack_sub_quiz: "stackFromSubQuiz",
  experience: "experience",
  javascript_experience: "javascriptExperience",
  starting_point: "startingPoint",
  project_interest: "projectInterest",
  immediate_need: "immediateNeed",
  daily_time: "dailyMinutes",
};

// Steps where more than one answer is genuinely reasonable. The UI toggles
// rather than replaces, and the profile stores them as arrays.
export const MULTI_SELECT_STEPS = new Set<string>(["project_interest", "immediate_need"]);

export function isMultiSelectStep(stepId: string) {
  return MULTI_SELECT_STEPS.has(stepId);
}

// The ordered list of steps this particular set of answers has to walk. The
// progress bar reads its length, so it stays honest as branches open and close.
export function getVisibleSteps(answers: Answers = {}): Step[] {
  const steps: Step[] = [{ id: "welcome", type: "intro" }];
  const addQuestion = (id: QuestionId) => {
    steps.push({ id, type: "question" });
    steps.push({ id: `${id}_break`, type: "break", questionId: id });
  };

  addQuestion("motivation");
  addQuestion("branch");
  if (answers.branch === "not_sure") addQuestion("branch_triage");

  const branch = resolveBranch(answers);
  if (branch) addQuestion("role");
  if (branch && answers.role === "help_me_choose") addQuestion("role_sub_quiz");

  const role = resolveRole(answers);

  if (role === "backend_developer") addQuestion("stack");
  if (role === "backend_developer" && answers.stack === "help_me_choose") {
    addQuestion("stack_sub_quiz");
  }

  addQuestion("experience");
  const isFrontend = role === "frontend_developer";
  const asksFramework = isFrontend && answers.javascriptExperience !== "new_to_javascript";
  if (isFrontend) addQuestion("javascript_experience");
  if (asksFramework) addQuestion("stack");
  if (asksFramework && answers.stack === "help_me_choose") addQuestion("stack_sub_quiz");

  const placementRung = isFrontend
    ? getJavascriptExperienceRung(answers.javascriptExperience)
    : getExperienceRung(answers.experience);
  if (role && placementRung >= RUNG_REQUIRING_PLACEMENT) addQuestion("starting_point");

  addQuestion("project_interest");
  addQuestion("immediate_need");
  addQuestion("daily_time");

  return steps;
}

export function getStepOptions(stepId: string, answers: Answers = {}): Option[] {
  const branch = resolveBranch(answers) as BranchId | null;
  const role = resolveRole(answers);

  switch (stepId) {
    case "motivation":
      return motivationOptions;
    // The escape hatch has to exist as a selectable option, not just as a
    // branch the resolver knows how to handle.
    case "branch":
      return [...BRANCHES, { value: "not_sure", label: "I’m not sure yet", icon: "help" }];
    case "branch_triage":
      return branchTriage.options;
    case "role":
      return branch ? (roleOptions[branch] ?? []) : [];
    case "role_sub_quiz":
      return branch ? (roleSubQuiz[branch]?.options ?? []) : [];
    case "stack":
      return role ? (stackOptions[role] ?? []) : [];
    case "stack_sub_quiz":
      return role ? (stackSubQuiz[role]?.options ?? []) : [];
    case "experience":
      return experienceOptions;
    case "javascript_experience":
      return javascriptExperienceOptions;
    case "starting_point": {
      const ladderKey = resolveLadderKey(answers);
      return ladderKey ? (startingPointOptions[ladderKey] ?? []) : [];
    }
    case "project_interest":
      return projectInterestOptions;
    case "immediate_need":
      return immediateNeedOptions;
    case "daily_time":
      return dailyTimeOptions;
    default:
      return [];
  }
}
