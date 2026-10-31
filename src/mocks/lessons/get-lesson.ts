import type { Lesson } from "~/types/lesson";
import contentCreation from "./content-creation-basics.json";
import dataAnalysis from "./data-analysis-basics.json";
import dataTypes from "./data-types.json";
import digitalMarketing from "./digital-marketing-basics.json";
import graphicDesign from "./graphic-design-basics.json";
import socialMedia from "./social-media-basics.json";
import technicalTeams from "./technical-teams-basics.json";
import videoEditing from "./video-editing-basics.json";
import writingPrograms from "./writing-programs.json";

const lessons = [
  writingPrograms,
  dataTypes,
  technicalTeams,
  digitalMarketing,
  dataAnalysis,
  videoEditing,
  contentCreation,
  socialMedia,
  graphicDesign,
] as unknown as Lesson[];

// Only some lessons have been written; the rest of a path is still "coming soon".
export const getMockLesson = (lessonId: string) => lessons.find((lesson) => lesson.id === lessonId) ?? null;
