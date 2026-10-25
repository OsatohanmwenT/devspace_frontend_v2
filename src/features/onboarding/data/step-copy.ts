import type { LottieClipName } from "~/components/devy";
import type { QuestionId } from "../types";
import { branchTriage } from "./sub-quizzes";

export const STEP_COPY: Partial<
  Record<QuestionId, { title: string; subtitle: string }>
> = {
  motivation: {
    title: "What brings you here?",
    subtitle: "This shapes the examples we use, not what you can access.",
  },
  branch: {
    title: "Which area feels closest to what you want to do?",
    subtitle: "You can change this later — nothing here locks you in.",
  },
  branch_triage: {
    title: branchTriage.prompt,
    subtitle: "Pick whichever sounds most appealing. We’ll work out the rest.",
  },
  role: {
    title: "Which of these sounds most like you?",
    subtitle: "Not sure? Pick “Help me choose” and we’ll ask a different way.",
  },
  stack: {
    title: "Which would you like to focus on?",
    subtitle: "Not sure? Pick “Help me choose” and we’ll ask a different way.",
  },
  experience: {
    title: "Where are you starting from?",
    subtitle:
      "Be honest — it only affects where we begin, not what you can reach.",
  },
  javascript_experience: {
    title: "How familiar are you with JavaScript?",
    subtitle:
      "This helps us decide whether it is useful to choose a framework yet.",
  },
  starting_point: {
    title: "Where would you like to start?",
    subtitle: "Skip ahead if the early material is already familiar.",
  },
  project_interest: {
    title: "What would make learning feel worth it?",
    subtitle: "We’ll lean on this for project examples.",
  },
  immediate_need: {
    title: "What should Devspace help with first?",
    subtitle: "This sets what we surface on your home screen.",
  },
  daily_time: {
    title: "How long do you want to learn each day?",
    subtitle: "This sets your daily goal. You can change it any time.",
  },
};

// Which Devy clip keeps the learner company on each question.
export const QUESTION_DEVY_CLIPS: Partial<Record<QuestionId, LottieClipName>> =
  {
    motivation: "listening",
    branch: "walk",
    branch_triage: "walk",
    role: "listening",
    role_sub_quiz: "listening",
    stack: "thinking",
    stack_sub_quiz: "thinking",
    experience: "thinking",
    javascript_experience: "thinking",
    starting_point: "walk",
    project_interest: "walk",
    daily_time: "walk",
  };
