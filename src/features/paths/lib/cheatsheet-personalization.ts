import type { Profile } from "~/types/profile";

export type CheatsheetPersonalization = {
  wantsExamplesUpFront: boolean;
  wantsMentalModel: boolean;
  reason: string | null;
};

// Reads answers onboarding already collected, so there are no new questions.
// The rule and syntax never change; only what opens by default, and whether a
// mental-model line is added, does.
export function getCheatsheetPersonalization(profile: Pick<Profile, "rung" | "immediateNeed">): CheatsheetPersonalization {
  const rung = profile.rung ?? 2;
  const immediateNeed = profile.immediateNeed ?? [];
  const wantsInterviewPrep = immediateNeed.includes("interview_prep");
  const wantsExamplesUpFront = rung >= 3 || wantsInterviewPrep || immediateNeed.includes("fix_gaps");
  const wantsMentalModel = rung <= 1;

  let reason: string | null = null;
  if (wantsInterviewPrep) reason = "Opened early — you said you’re prepping for interviews.";
  else if (wantsExamplesUpFront) reason = "Opened early based on your experience.";
  else if (wantsMentalModel) reason = "Extra context added since you’re just starting out.";

  return { wantsExamplesUpFront, wantsMentalModel, reason };
}
