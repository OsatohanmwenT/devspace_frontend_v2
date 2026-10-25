import { buildCustomPathRecord } from "~/mocks/paths/build-custom-path-record";
import { derivePathProgress } from "~/mocks/paths/derive-path-progress";
import { explorePaths, getPath, pathShelves } from "~/mocks/paths/get-path";
import type { ExplorePath, Path } from "~/mocks/paths/types";
import { readDb, writeDb } from "~/mocks/mock-db";
import { getMockProfile } from "~/mocks/profile";
import { getMockProgress } from "~/mocks/progress";
import type { CustomRoute } from "~/types/paths";
import type { Profile } from "~/types/profile";
export type { DerivedLesson, DerivedRegion } from "~/mocks/paths/derive-path-progress";
export type { ExplorePath, Path } from "~/mocks/paths/types";

type Progress = ReturnType<typeof derivePathProgress>;

export type PathsData = {
  path: Path;
  progress: Progress;
  explorePaths: ExplorePath[];
  // Custom paths the learner built and set aside for another.
  pausedCustomPaths: Path[];
  activePathId: string;
};

export type PathDetailData = {
  path: Path;
  progress: Progress;
  profile: Profile;
  activePathId: string;
  // A frontend learner who has finished the JavaScript foundations picks a framework.
  frameworkCheckpointReady: boolean;
};

export type Framework = "react" | "vue" | "angular";

const HISTORY_LIMIT = 5;
const CUSTOM_PATH_INTRO = "custom-path";

const isKnownPath = (pathId: string) =>
  pathShelves.some((path) => path.id === pathId) ||
  explorePaths.some((path) => path.id === pathId) ||
  Boolean(readDb().customPaths?.[pathId]);

export async function getPaths(): Promise<PathsData | null> {
  const profile = getMockProfile();
  if (!profile) return null;

  const path = getPath(profile.pathId);
  const progress = derivePathProgress(path, getMockProgress().completedLessons);
  const pausedCustomPaths = Object.values(readDb().customPaths ?? {}).filter((custom) => custom.id !== path.id);
  return { path, progress, explorePaths, pausedCustomPaths, activePathId: profile.pathId };
}

export async function getPathDetail(pathId: string): Promise<PathDetailData | null> {
  const profile = getMockProfile();
  if (!profile || !isKnownPath(pathId)) return null;

  const completedLessons = getMockProgress().completedLessons;
  const path = getPath(pathId);
  return {
    path,
    progress: derivePathProgress(path, completedLessons),
    profile,
    activePathId: profile.pathId,
    frameworkCheckpointReady:
      profile.role === "frontend_developer" &&
      profile.frameworkDecision === "pending" &&
      Boolean(completedLessons["program-flow"]),
  };
}

export const isAuthoredPath = (pathId: string) => pathShelves.some((path) => path.id === pathId);

// Makes a path the active one. The path it replaces is not lost: it joins the
// history, deduped so switching back and forth doesn't pile up repeats. Returns
// the path that was active, for an Undo.
export async function startPath(pathId: string): Promise<string | null> {
  const db = readDb();
  if (!db.profile) return null;
  const previous = db.profile.pathId;
  const history = (db.pathHistory ?? []).filter((id) => id !== pathId && id !== previous);
  writeDb({
    ...db,
    pathHistory: (previous !== pathId ? [previous, ...history] : history).slice(0, HISTORY_LIMIT),
    profile: { ...db.profile, pathId },
  });
  return previous;
}

export async function chooseFramework(framework: Framework): Promise<void> {
  const db = readDb();
  if (!db.profile) return;
  writeDb({ ...db, profile: { ...db.profile, stack: framework, frameworkDecision: "complete" } });
}

export async function createCustomPath(route: CustomRoute): Promise<Path | null> {
  const db = readDb();
  if (!db.profile) return null;
  const path = buildCustomPathRecord(route);
  writeDb({ ...db, customPaths: { ...db.customPaths, [path.id]: path } });
  await startPath(path.id);
  return path;
}

export async function hasSeenCustomPathIntro(): Promise<boolean> {
  return Boolean(readDb().seenPageIntroductions?.[CUSTOM_PATH_INTRO]);
}

export async function markCustomPathIntroSeen(): Promise<void> {
  const db = readDb();
  writeDb({ ...db, seenPageIntroductions: { ...db.seenPageIntroductions, [CUSTOM_PATH_INTRO]: true } });
}
