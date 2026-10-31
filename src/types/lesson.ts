import type { Quest } from "./home";

// Text with a little emphasis in it: plain strings, bold runs and inline code.
export type RichTextPart = string | { strong: string } | { code: string };
export type RichText = string | RichTextPart[];

export type ArticleContent = {
  title: string;
  intro: string;
  // The same content as Devy would say it, for the commentary version of narration.
  spokenIntro?: string;
  sections: { title: string; body: RichText; spoken?: string }[];
  // A short chain of boxes, e.g. how a program flows.
  diagram?: { title: string; body: string; label: string; nodes: string[] };
  example?: { title: string; body: string; code: string };
  // What the next screen asks of the learner.
  next?: { title: string; body: string };
};

export type MultipleChoiceQuestion = {
  id: string;
  type: "multiple-choice";
  prompt: RichText;
  options: RichText[];
  correctIndex: number;
  explanation: string;
};

// Blanks filled from a bank of options. `segments` are the text around the
// blanks, so there is always one more segment than there are answers.
export type FillQuestion = {
  id: string;
  type: "fill" | "code-fill";
  prompt: string;
  segments: string[];
  answers: string[];
  options: string[];
  explanation: string;
  // Only on `code-fill`: the file the code is shown in.
  filename?: string;
};

export type Question = MultipleChoiceQuestion | FillQuestion;

export type QuizContent = {
  title: string;
  intro: string;
  // Devy's framing line, spoken when the quiz begins.
  spokenIntro?: string;
  questions: Question[];
};

// One thing to get done in a code exercise, checked against the code or what it prints.
export type ExerciseTask = {
  title: string;
  description: string;
  check: { pattern?: string; output?: string };
  // What Devy says while this is the first task still open.
  nudge?: string;
};

export type CodeEditorContent = {
  title: string;
  description: string;
  example: string;
  filename: string;
  starterCode: string;
  // What a correct program prints.
  output: string;
  tasks: ExerciseTask[];
  // Climb from a nudge to the full answer, one per tap.
  hints: string[];
  layout?: "guided";
  continueLabel?: string;
  devyIntro?: string;
};

export type Activity =
  | { id: string; type: "article"; content: ArticleContent }
  | { id: string; type: "quiz"; content: QuizContent }
  | { id: string; type: "code-editor"; content: CodeEditorContent };

export type Milestone = { eyebrow: string; title: string; body: string };

export type Concept = {
  id: string;
  title: string;
  activities: Activity[];
  // Shown between this concept and the next.
  transition?: Milestone;
};

export type Lesson = {
  id: string;
  title: string;
  // The role the lesson is written for, which Devy tailors its help to.
  role?: string;
  concepts: Concept[];
  completion: Milestone;
};

// What finishing a lesson paid, as the completion screens show it.
export type LessonReward = {
  xpEarned: number;
  // Present only when this lesson extends the streak (the day's first activity).
  streak: { before: number; after: number; dates: string[] } | null;
  // Present only when this lesson moved a daily quest.
  quests: { before: Quest[]; after: Quest[] } | null;
};
