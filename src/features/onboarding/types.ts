import type { IconName } from "./data/icon-paths";

export type BranchId =
  | "web"
  | "mobile"
  | "backend"
  | "data"
  | "ai"
  | "product"
  | "marketing"
  | "content_media"
  | "design"
  | "cloud";

export type Branch = { value: BranchId; label: string; icon: IconName };

export type OptionValue = string | number;

export type Option = {
  value: OptionValue;
  label: string;
  icon?: IconName;
  note?: string;
  aside?: string;
};

// `rung` is how experienced an answer is: 1 (new) to 4 (worked with real users).
export type RungOption = Option & { rung: number };

export type QuestionId =
  | "motivation"
  | "branch"
  | "branch_triage"
  | "role"
  | "role_sub_quiz"
  | "stack"
  | "stack_sub_quiz"
  | "experience"
  | "javascript_experience"
  | "starting_point"
  | "project_interest"
  | "immediate_need"
  | "daily_time";

export type Step =
  | { id: "welcome"; type: "intro" }
  | { id: QuestionId; type: "question" }
  | { id: `${QuestionId}_break`; type: "break"; questionId: QuestionId };

export type StepId = Step["id"];

// What the learner picked, keyed by what each step writes. The sub-quizzes and
// triage write to their own keys so the raw branch/role/stack answers stay intact.
export type Answers = {
  motivation?: string;
  branch?: string;
  branchFromTriage?: string;
  role?: string;
  roleFromSubQuiz?: string;
  stack?: string;
  stackFromSubQuiz?: string;
  experience?: string;
  javascriptExperience?: string;
  startingPoint?: string;
  projectInterest?: string[];
  immediateNeed?: string[];
  dailyMinutes?: number;
};

export type AnswerKey = keyof Answers;

export type StageGroup = { id: string; label: string; stages: Option[] };
