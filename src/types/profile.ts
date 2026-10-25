// Draft contract, taken from the old app's `buildProfile`. To be agreed with
// the backend; id-like fields get narrowed to unions once onboarding lands.
export type Profile = {
  branch: string | null;
  branchAnswer: string | null;
  role: string | null;
  roleAnswer: string | null;
  stack: string | null;
  javascriptExperience: string | null;
  frameworkDecision: "pending" | "complete" | null;
  motivation: string | null;
  experience: string | null;
  rung: number;
  startingPoint: string | null;
  projectInterest: string[];
  immediateNeed: string[];
  dailyMinutes: number;
  pathId: string;
  completedAt: string;
};
