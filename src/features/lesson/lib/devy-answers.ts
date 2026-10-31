import { getRoleLabelByValue } from "~/features/onboarding";
import type { ArticleContent, Question, RichText, RichTextPart } from "~/types/lesson";
import type { Profile } from "~/types/profile";
import type { FlowStep } from "./lesson-flow";

// Devy has no model behind it here. Every answer is pulled from content that
// already exists on the current step, and nothing that would spoil an
// unchecked answer.

export type PromptId = "summarise" | "example" | "hint" | "explain" | "why";
export type Prompt = { id: PromptId; label: string };
export type DevyResponse = { body: RichText; code?: string; suggestions?: Prompt[] };

const LABELS: Record<PromptId, string> = {
  summarise: "Summarise this",
  example: "Show me the example",
  hint: "Give me a hint",
  explain: "Explain the concept",
  why: "Why is that the answer?",
};

const prompt = (id: PromptId): Prompt => ({ id, label: LABELS[id] });
const parts = (content: RichText): RichTextPart[] => (Array.isArray(content) ? content : [content]);

export const toPlainText = (content: RichText) => parts(content).map((part) => (typeof part === "string" ? part : "code" in part ? part.code : part.strong)).join("");

// The article this step's concept is built around, for steps that follow it.
const articleOf = (step: FlowStep): ArticleContent | null => {
  if (step.kind !== "activity") return null;
  const article = step.concept.activities.find((activity) => activity.type === "article");
  return article?.type === "article" ? article.content : null;
};

export function getGreeting(profile: Pick<Profile, "role"> | null, hintOnly: boolean) {
  if (hintOnly) return "Hi, I’m Devy. I can rule out a wrong option, but working out the rest is what earns this lesson its XP.";
  const role = profile?.role ? getRoleLabelByValue(profile.role) : null;
  return role ? `Hi, I’m Devy. I’ll keep things close to ${role} work where it helps — ask me any time.` : "Hi, I’m Devy. Ask me for a hint or a recap of the concept behind this step.";
}

export function getPrompts(step: FlowStep, checked: boolean): Prompt[] {
  if (step.kind !== "activity") return [];
  if (step.type === "article") return step.content.example ? [prompt("summarise"), prompt("example")] : [prompt("summarise")];
  if (step.type === "question") return checked ? [prompt("why"), prompt("explain")] : [prompt("hint")];
  return [];
}

// Names an option to rule out rather than the answer: derived from the data,
// so it is always right and never a spoiler.
function multipleChoiceHint(question: Extract<Question, { type: "multiple-choice" }>): DevyResponse {
  const wrong = question.options.findIndex((_, index) => index !== question.correctIndex);
  if (wrong === -1) return { body: "Read the options again and pick the one that matches what the lesson showed." };
  return { body: ["It isn’t ", { strong: toPlainText(question.options[wrong]) }, ". Rule that one out and compare what’s left."] };
}

function conceptFallback(step: FlowStep, lead: string): DevyResponse {
  const article = articleOf(step);
  if (article?.example) return { body: lead, code: article.example.code };
  if (article?.sections.length) return { body: article.sections[0].body };
  return { body: "Have another look at the step before this one — it introduces everything you need here." };
}

export function getResponse(promptId: PromptId, step: FlowStep, checked: boolean): DevyResponse | null {
  if (step.kind !== "activity") return null;

  switch (promptId) {
    case "summarise": {
      if (step.type !== "article") return null;
      const first = step.content.sections[0];
      return { body: [...parts(step.content.intro), ...(first ? [" ", ...parts(first.body)] : [])] };
    }
    case "example":
      return step.type === "article" && step.content.example ? { body: step.content.example.body, code: step.content.example.code } : null;
    case "hint": {
      if (step.type !== "question") return null;
      return step.question.type === "multiple-choice" ? multipleChoiceHint(step.question) : conceptFallback(step, "Here’s the same idea from earlier in the lesson:");
    }
    case "explain": {
      const article = articleOf(step);
      if (!article?.sections.length) return conceptFallback(step, "Here’s the worked example again:");
      return { body: article.sections.flatMap((section, index) => [...(index > 0 ? [" "] : []), { strong: `${section.title}. ` }, ...parts(section.body)]) };
    }
    case "why":
      return checked && step.type === "question" ? { body: step.question.explanation } : null;
  }
}

// Typed text routes to the same honest, non-spoiling answers the chips give,
// never to free-form generation.
const KEYWORDS: Record<PromptId, string[]> = {
  hint: ["hint", "stuck", "help", "clue"],
  why: ["why", "correct", "right answer", "wrong"],
  explain: ["explain", "concept", "confused", "don't understand", "dont understand", "what does this"],
  example: ["example", "show me", "sample"],
  summarise: ["summar", "recap", "tl;dr", "tldr"],
};

// Only matches prompts that are available right now, so asking "why" before
// checking falls through to the fallback instead of answering early.
export function matchPrompt(text: string, available: Prompt[]): PromptId | null {
  const normalised = text.trim().toLowerCase();
  if (!normalised) return null;
  const ids = new Set(available.map((item) => item.id));
  const matched = (Object.keys(KEYWORDS) as PromptId[]).find((id) => ids.has(id) && KEYWORDS[id].some((keyword) => normalised.includes(keyword)));
  return matched ?? null;
}

export function getFallbackResponse(available: Prompt[]): DevyResponse {
  if (available.length === 0) return { body: "There’s nothing more I can help with on this step — try continuing to the next one." };
  const labels = available.map((item) => `“${item.label}”`);
  const list = labels.length === 1 ? labels[0] : `${labels.slice(0, -1).join(", ")} or ${labels.at(-1)}`;
  // The prompts come back too, so the reply offers them as buttons.
  return { body: `I’m focused on this step right now. Try ${list}.`, suggestions: available };
}
