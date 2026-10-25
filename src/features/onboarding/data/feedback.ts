import type { QuestionId } from "../types";

const branchInsights: Record<string, string> = {
  web: "The web turns ideas into tools anyone can reach.",
  mobile: "Phones put your work directly into people’s hands.",
  backend: "Reliable products depend on strong invisible systems.",
  data: "Good data turns uncertainty into better decisions.",
  ai: "AI is reshaping how every industry works.",
  product: "Great products begin with the right problem.",
  marketing: "Good marketing connects useful products with the right people.",
  content_media: "Strong content gives an audience a reason to pay attention.",
  design: "Good design makes complex things feel simple.",
  cloud: "Modern products depend on secure, reliable infrastructure.",
  not_sure: "Exploring is how the right direction becomes clear.",
};

const roleInsights: Record<string, string> = {
  web: "Web roles blend logic with visual craft.",
  mobile: "Mobile roles design for life beyond the desk.",
  backend: "Backend roles keep data moving safely.",
  data: "Data roles turn patterns into better decisions.",
  ai: "AI roles turn data into useful predictions and tools.",
  product: "Product roles connect user needs with execution.",
  marketing: "Marketing roles connect customer insight with measurable growth.",
  content_media:
    "Content and media roles turn ideas into stories people choose to engage with.",
  design: "Design roles turn friction into clear experiences.",
  cloud: "Cloud roles keep digital products secure and available.",
};

type Feedback = {
  message: (answer: string, labels: string[], values: unknown[]) => string;
  insight: string | ((branch: string | null) => string);
};

// Short pauses acknowledge what the learner shared and add one useful spark
// without changing their learning profile.
export const breakPrompts: Record<QuestionId, Feedback> = {
  motivation: {
    message: () => "That’s a strong reason to start.",
    insight: "Clear goals make consistent practice easier.",
  },
  branch: {
    message: (answer, _labels, values) =>
      values.includes("not_sure")
        ? "We’ll narrow it down together."
        : `${answer} it is.`,
    insight: (branch) =>
      branchInsights[branch ?? "not_sure"] ?? branchInsights.not_sure,
  },
  branch_triage: {
    message: (answer) => `${answer} fits you well.`,
    insight: (branch) =>
      branchInsights[branch ?? "not_sure"] ?? branchInsights.not_sure,
  },
  role: {
    message: (answer, _labels, values) =>
      values.includes("help_me_choose")
        ? "I’ll help you find the right fit."
        : `${answer} it is.`,
    insight: (branch) =>
      roleInsights[branch ?? ""] ?? "Every role grows from strong foundations.",
  },
  role_sub_quiz: {
    message: (answer) => `${answer} sounds right.`,
    insight: (branch) =>
      roleInsights[branch ?? ""] ?? "Every role grows from strong foundations.",
  },
  stack: {
    message: (answer, _labels, values) =>
      values.includes("help_me_choose")
        ? "We’ll help you pick the right one."
        : `${answer} it is.`,
    insight: "Every option here leads to real, hireable skills.",
  },
  stack_sub_quiz: {
    message: (answer) => `${answer} sounds right.`,
    insight: "Every option here leads to real, hireable skills.",
  },
  experience: {
    message: () => "We’ll start at your level.",
    insight: "The right starting level keeps challenge productive.",
  },
  javascript_experience: {
    message: () => "That gives us the right next step.",
    insight: "Frameworks make more sense once JavaScript feels familiar.",
  },
  starting_point: {
    message: () => "That’s where your path will begin.",
    insight: "You can revisit earlier lessons whenever you need.",
  },
  project_interest: {
    message: (answer, labels) =>
      labels.length > 1
        ? "Nice mix. Your projects will feel familiar."
        : `Projects inspired by ${answer}.`,
    insight: "Relevant projects make new skills stick.",
  },
  // Lowercases only the first character — a blanket toLowerCase() mangled the
  // capital "I" mid-sentence in labels like "Fill gaps in what I know".
  immediate_need: {
    message: (answer, labels) =>
      labels.length > 1
        ? "We’ll put those goals first."
        : `We’ll focus on ${answer.charAt(0).toLowerCase()}${answer.slice(1)} first.`,
    insight: "A clear priority keeps learning focused.",
  },
  daily_time: {
    message: (answer) => `${answer} a day. You’ve got this.`,
    insight: "Short daily practice beats occasional long sessions.",
  },
};
