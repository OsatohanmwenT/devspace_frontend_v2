import type { CustomRoute } from "~/types/paths";
import type { Path, Region } from "./types";

const ART = "art/thinking-in-code.png";

// Turns a proposed route into a path shaped like an authored one, so it can
// become the learner's active path and flow through Home and Paths like any
// career path. The backend generates this for real; the lessons here are
// placeholders named after each stage.
export function buildCustomPathRecord(route: CustomRoute): Path {
  const stageRegions: Region[] = route.stages.map((stage, index) => ({
    id: `${route.id}-stage-${index}`,
    level: `Region ${index + 1}`,
    title: stage.title,
    summary: stage.description,
    image: ART,
    lessons: [
      {
        id: `${route.id}-lesson-${index}`,
        title: stage.title,
        description: stage.description,
        state: index === 0 ? "current" : "locked",
      },
    ],
  }));

  const project: Region = {
    id: `${route.id}-project`,
    level: `Region ${route.stages.length + 1}`,
    title: "Ship the project",
    summary: route.project,
    image: ART,
    lessons: [
      {
        id: `${route.id}-project-lesson`,
        title: "Ship the project",
        description: route.project,
        checkpoint: true,
        state: "locked",
      },
    ],
  };

  return {
    id: route.id,
    family: "custom",
    title: route.title,
    description: route.goal,
    emblem: ART,
    isCustom: true,
    goal: route.goal,
    project: route.project,
    stages: route.stages,
    cards: [...stageRegions, project],
  };
}
