import type { HomeCourse } from "~/types/home";

export type SuggestionIcon = "explain" | "quiz" | "next" | "code";

export type Suggestion = {
  id: string;
  icon: SuggestionIcon;
  // "R G B", the card's own colour.
  accent: string;
  label: string;
};

// Starting points for talking to Devy, drawn from what the learner is doing.
export function buildSuggestions(course: HomeCourse | undefined): Suggestion[] {
  return [
    course?.nextLessonTitle && {
      id: "explain",
      icon: "explain" as const,
      accent: "59 130 246",
      label: `Explain ${course.nextLessonTitle}`,
    },
    course?.regionTitle && {
      id: "quiz",
      icon: "quiz" as const,
      accent: "22 163 74",
      label: `Quiz me on ${course.regionTitle}`,
    },
    { id: "next", icon: "next" as const, accent: "139 92 246", label: "What should I learn next?" },
    { id: "code", icon: "code" as const, accent: "249 115 22", label: "Help me debug my code" },
  ].filter((suggestion): suggestion is Suggestion => Boolean(suggestion));
}
