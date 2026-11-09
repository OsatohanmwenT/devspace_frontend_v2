import type { CustomRouteStage } from "~/types/paths";

export type Lesson = {
  id: string;
  title: string;
  // The two-word name shown on the route tile; the full title is used elsewhere.
  shortTitle?: string;
  state?: string;
  checkpoint?: boolean;
  description?: string;
};

export type Region = {
  id: string;
  level: string;
  title: string;
  summary: string;
  image: string;
  lessons: Lesson[];
};

export type Path = {
  id: string;
  family: string;
  title: string;
  description: string;
  emblem: string;
  cards: Region[];
  // Only on paths a learner built from their own goal.
  isCustom?: boolean;
  goal?: string;
  project?: string;
  stages?: CustomRouteStage[];
};

export type ExplorePath = {
  id: string;
  type: "career" | "skill";
  category: string;
  family: string;
  meta: string;
  title: string;
  reason: string;
  description: string;
  image: string;
  tools: string[];
  recommended: boolean;
  learningSteps: string[] | null;
};
